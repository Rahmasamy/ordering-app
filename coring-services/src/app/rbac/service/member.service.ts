import {Knex} from "knex";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {IEmailProvider} from "../../../pkg/email/email.interface";
import {AppError} from "../../../lib/error/AppError";
import {db} from "../../../lib/knex/knex";
import {toMs} from "../../../pkg/utils/time";
import {createPasswordReset} from "../../auth/repository/password-reset.repo";
import {generateOTP, hashOTP} from "../../auth/utils";
import {SystemRole} from "../../user/enums";
import {UserService} from "../../user/service/user.service";
import {CreateMemberDTO, UpdateMemberDTO, UpdateMemberBranchesDTO} from "../dto/member.dto";
import {memberInvitationEmail} from "../templates/member-invitation";
import {MemberBranch} from "../entity/member-branch.entity";
import {RestaurantMember} from "../entity/restaurant-member.entity";
import {MemberStatus} from "../enums";
import {
    CannotCreateOwnerUserError,
    RoleNotFoundError,
    MemberNotFoundError,
    CannotDeleteOwnerError,
    InvalidBranchIdsError
} from "../errors";
import {setMemberBranches, countBranchesByIdsAndRestaurant} from "../repository/member-branch.repo";
import {createRestaurantMember, findMembersByRestaurantId, findMemberWithRoleName, updateMember, deleteMember} from "../repository/restaurant_member.repo";
import {findRoleByName} from "../repository/role.repo";
import {getPermissionsDetailsByRoleName, getPermissionsByRoleName} from "../repository/permission.repo";



@injectable()
export class MemberService{
    constructor(
        @inject(TOKENS.UserService) private readonly userService: UserService,
        @inject(TOKENS.EmailProvider) private readonly emailProvider: IEmailProvider,
    ) {}

    async createOwnerMember(restaurantId: number, userId: number, trx?: Knex.Transaction): Promise<RestaurantMember> {
        const ownerRoleId = await findRoleByName('owner', trx);
        if (!ownerRoleId) throw RoleNotFoundError;
        const now = new Date();
        return createRestaurantMember({
            restaurantId,
            userId,
            roleId: ownerRoleId,
            status: MemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
        }, trx);
    }

    async createMember(restaurantId: number, data: CreateMemberDTO){
        // dont accept owner role creation
        if(data.role == 'owner') {
            throw CannotCreateOwnerUserError
        }

        // find roleId by role name
        const roleId = await findRoleByName(data.role);
        if(!roleId){
            throw RoleNotFoundError
        }

        // validate branchIds belong to this restaurant
        const branchIds = data.branchIds || [];
        await this.validateBranchOwnership(branchIds, restaurantId);

        // create user, member, assign branches
        const trx = await db.transaction();
        try {
            const now = new Date();
            const user = await this.userService.create({
                email: data.email,
                phone: data.phoneNumber,
                name: data.name,
                password: '',
                systemRole: SystemRole.RESTAURANT_USER,
            }, trx);

            const member = await createRestaurantMember(
                {
                    restaurantId,
                    userId: user.id,
                    roleId,
                    createdAt: now,
                    updatedAt: now,
                    status: MemberStatus.INACTIVE
                }, trx
            )
            // assign branches
            const rows = branchIds.map(branchId => new MemberBranch({
                branchId: branchId,
                memberId: member.id,
                createdAt: now,
            }))
            await setMemberBranches(member.id, rows, trx)

            // generate otp, create password reset record and send email
            const otp = generateOTP();
            const hashedOtp = hashOTP(otp);
            await createPasswordReset({
                    userId: user.id,
                    otpHash: hashedOtp,
                    expiresAt: new Date(Date.now() + toMs(7, 'd')),
                    createdAt: new Date(),
                }, trx
            )
            const email = memberInvitationEmail(otp, data.role);
            await this.emailProvider.send(data.email, email.subject, email.html);

            await trx.commit()

            return {
                message: "Member invited successfully",
                member: {
                    id: member.id,
                    userId: user.id,
                    email: data.email,
                    name: data.name,
                    phone: data.phoneNumber,
                    role: data.role,
                    status: MemberStatus.INACTIVE,
                    branchIds,
                }
            }
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    }

    async listMembers(restaurantId: number, filters?: { roleId?: number; branchId?: number; search?: string }) {
        let query = db("restaurant_members as rm")
            .select(
                "rm.id",
                "rm.user_id",
                "u.email",
                "u.name",
                "u.phone",
                "r.name as role",
                "r.id as roleId",
                "r.display_name as roleDisplayName",
                "rm.status"
            )
            .join("users as u", "rm.user_id", "u.id")
            .join("roles as r", "rm.role_id", "r.id")
            .where("rm.restaurant_id", restaurantId);

        if (filters?.roleId) {
            query = query.andWhere("rm.role_id", filters.roleId);
        }

        if (filters?.search) {
            const searchLower = `%${filters.search.toLowerCase()}%`;
            query = query.andWhere(function() {
                this.whereRaw("LOWER(u.name) LIKE ?", [searchLower])
                    .orWhereRaw("LOWER(u.email) LIKE ?", [searchLower])
                    .orWhereRaw("LOWER(u.phone) LIKE ?", [searchLower]);
            });
        }

        if (filters?.branchId) {
            query = query.where(function() {
                this.whereIn("rm.id", db("member_branches").select("member_id").where("branch_id", filters.branchId))
                    .orWhere("r.name", "owner");
            });
        }

        const members = await query;
        if (members.length === 0) return { data: [] };

        const memberIds = members.map(m => m.id);
        const branches = await db("member_branches")
            .select("member_id as memberId", "branch_id as branchId")
            .whereIn("member_id", memberIds);

        const branchesMap: Record<number, number[]> = {};
        for (const b of branches) {
            if (!branchesMap[b.memberId]) branchesMap[b.memberId] = [];
            branchesMap[b.memberId].push(Number(b.branchId));
        }

        const membersWithBranches = members.map(row => ({
            id: row.id,
            userId: row.user_id,
            email: row.email,
            name: row.name,
            phone: row.phone,
            role: row.role,
            roleId: row.roleId,
            roleDisplayName: row.roleDisplayName,
            status: row.status,
            branchIds: branchesMap[row.id] || []
        }));

        return { data: membersWithBranches };
    }

    async updateMember(restaurantId: number, memberId: number, data: UpdateMemberDTO) {
        // single query: member + role name
        const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError;
        }

        const updateData: {roleId?: number, status?: string} = {};
        if (data.role) {
            const roleId = await findRoleByName(data.role);
            if (!roleId) throw RoleNotFoundError;
            updateData.roleId = roleId;
        }
        if (data.status) {
            updateData.status = data.status;
        }

        await updateMember(memberId, updateData);
        return {message: "Member updated successfully"};
    }

    async deleteMember(restaurantId: number, memberId: number) {
        // single query: member + role name (no N+1)
        const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError;
        }
        if (result.roleName === 'owner') {
            throw CannotDeleteOwnerError;
        }
        await deleteMember(memberId);
        return {message: "Member deleted successfully"};
    }

    async updateMemberBranches(restaurantId: number, memberId: number, data: UpdateMemberBranchesDTO) {
        // single query: member + role name (no N+1)
        const result = await findMemberWithRoleName(memberId);
        if (!result || Number(result.member.restaurantId) !== Number(restaurantId)) {
            throw MemberNotFoundError;
        }
        if (result.roleName === 'owner') {
            throw new AppError('Cannot assign branches to owners, they have access to all branches', 400);
        }

        // validate branchIds belong to this restaurant (single COUNT query)
        await this.validateBranchOwnership(data.branchIds, restaurantId);

        const now = new Date();
        const rows = data.branchIds.map(branchId => new MemberBranch({
            branchId,
            memberId: result.member.id,
            createdAt: now,
        }));
        await setMemberBranches(memberId, rows);

        return {
            message: "Member branch assignments updated successfully",
            branchIds: data.branchIds,
        };
    }

    async getRolePermissions(roleName: string) {
        const permissions = await getPermissionsDetailsByRoleName(roleName);
        return {role: roleName, permissions};
    }

    async getPermissionsByRoleInternal(roleName: string): Promise<string[]> {
        return getPermissionsByRoleName(roleName);
    }

    async validateBranchOwnership(branchIds: number[], restaurantId: number) {
        if (branchIds.length === 0) return;
        const count = await countBranchesByIdsAndRestaurant(branchIds, restaurantId);
        if (count !== branchIds.length) {
            throw InvalidBranchIdsError;
        }
    }

    async listRoles() {
        const roles = await db("roles").select("id", "name", "display_name as displayName", "description");
        const permissions = await db("permissions").select("id", "resource", "action");
        const mappings = await db("role_permissions").select("role_id as roleId", "permission_id as permissionId");

        return {
            roles: roles.map(role => {
                const assignedIds = new Set(
                    mappings.filter(m => m.roleId === role.id).map(m => m.permissionId)
                );

                const resourceGroups: { [resource: string]: any[] } = {};
                for (const p of permissions) {
                    if (!resourceGroups[p.resource]) {
                        resourceGroups[p.resource] = [];
                    }
                    resourceGroups[p.resource].push({
                        id: p.id,
                        action: p.action,
                        enabled: assignedIds.has(p.id)
                    });
                }

                const nestedPermissions = Object.keys(resourceGroups).map(resource => ({
                    resource,
                    actions: resourceGroups[resource]
                }));

                return {
                    id: role.id,
                    name: role.name,
                    displayName: role.displayName,
                    description: role.description,
                    permissions: nestedPermissions
                };
            })
        };
    }

    async createRole(data: { displayName: string; description?: string; permissionIds?: number[] }) {
        const now = new Date();
        const trx = await db.transaction();
        try {
            const roleName = data.displayName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
            const [role] = await trx("roles").insert({
                name: roleName,
                display_name: data.displayName,
                description: data.description || null,
                created_at: now,
                updated_at: now
            }).returning(["id", "name", "display_name as displayName", "description"]);

            if (data.permissionIds && data.permissionIds.length > 0) {
                const mappings = data.permissionIds.map(permissionId => ({
                    role_id: role.id,
                    permission_id: permissionId,
                    created_at: now
                }));
                await trx("role_permissions").insert(mappings);
            }

            await trx.commit();
            return {
                role: {
                    ...role,
                    permissionIds: data.permissionIds || []
                }
            };
        } catch (err) {
            await trx.rollback();
            throw err;
        }
    }

    async toggleRolePermission(roleId: number, permissionId: number, enabled: boolean) {
        if (enabled) {
            await db("role_permissions").insert({
                role_id: roleId,
                permission_id: permissionId,
                created_at: new Date()
            }).onConflict(["role_id", "permission_id"]).ignore();
        } else {
            await db("role_permissions")
                .where({ role_id: roleId, permission_id: permissionId })
                .del();
        }
        return { message: "Permission toggled successfully" };
    }
}

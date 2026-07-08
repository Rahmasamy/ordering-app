import {NextFunction, Response, Request} from "express";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess} from "../../../lib/http/response";
import {validateBody} from "../../../lib/validation/validate";
import {CreateMemberDTO, UpdateMemberDTO, UpdateMemberBranchesDTO} from "../dto/member.dto";
import {CreateRoleDTO, TogglePermissionDTO} from "../dto/role.dto";
import {MemberService} from "../service/member.service";
import {db} from "../../../lib/knex/knex";
import {logActivity} from "../../analytics/repository/activity-log.repository";

@injectable()
export class MemberController {
    constructor(@inject(TOKENS.MemberService) private readonly memberService: MemberService) {}

    private async getUserName(req: Request): Promise<string> {
        if (!req.user?.userId) return "System";
        const user = await db("users").where({ id: req.user.userId }).first();
        return user ? user.name : req.user.email;
    }

    createMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateMemberDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const result = await this.memberService.createMember(restaurantId, data);
            
            const actorName = await this.getUserName(req);
            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Team Management",
                `Invited new member ${data.name}`,
                "update",
                `Role: ${data.role}`
            );

            sendSuccess(res, result, 201);
        }
        catch (error) {
            next(error);
        }
    }

    listMembers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { roleId, branchId, search } = req.query;
            const result = await this.memberService.listMembers(
                Number(req.params.restaurantId),
                {
                    roleId: roleId ? Number(roleId) : undefined,
                    branchId: branchId ? Number(branchId) : undefined,
                    search: search ? String(search) : undefined
                }
            );
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    updateMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);

            // Fetch member details for logging
            const memberObj = await db("restaurant_members as rm")
                .join("users as u", "rm.user_id", "u.id")
                .where("rm.id", memberId)
                .select("u.name")
                .first();
            const memberName = memberObj?.name || `Member #${memberId}`;

            const result = await this.memberService.updateMember(
                restaurantId,
                memberId,
                data
            );

            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Team Management",
                `Updated role/status details for ${memberName}`,
                "update",
                `Role: ${data.role || 'unchanged'} - Status: ${data.status || 'unchanged'}`
            );

            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    deleteMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);

            // Fetch member details for logging
            const memberObj = await db("restaurant_members as rm")
                .join("users as u", "rm.user_id", "u.id")
                .where("rm.id", memberId)
                .select("u.name")
                .first();
            const memberName = memberObj?.name || `Member #${memberId}`;

            const result = await this.memberService.deleteMember(
                restaurantId,
                memberId
            );

            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Team Management",
                `Removed team member: ${memberName}`,
                "alert",
                "Revoked access"
            );

            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    updateMemberBranches = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateMemberBranchesDTO, req.body);
            const restaurantId = Number(req.params.restaurantId);
            const memberId = Number(req.params.memberId);

            // Fetch member details for logging
            const memberObj = await db("restaurant_members as rm")
                .join("users as u", "rm.user_id", "u.id")
                .where("rm.id", memberId)
                .select("u.name")
                .first();
            const memberName = memberObj?.name || `Member #${memberId}`;

            const result = await this.memberService.updateMemberBranches(
                restaurantId,
                memberId,
                data
            );

            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Team Management",
                `Updated branch assignments for ${memberName}`,
                "update",
                `Branch IDs: ${data.branchIds.join(', ')}`
            );

            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    getRolePermissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.memberService.getRolePermissions(req.params.role as string);
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    listRoles = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.memberService.listRoles();
            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    createRole = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateRoleDTO, req.body);
            const result = await this.memberService.createRole(data);
            
            const restaurantId = req.user?.restaurantId || 1;
            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Access Control",
                `Created custom role: ${data.displayName}`,
                "update"
            );

            sendSuccess(res, result, 201);
        }
        catch (error) {
            next(error);
        }
    }

    toggleRolePermission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(TogglePermissionDTO, req.body);
            const result = await this.memberService.toggleRolePermission(
                Number(req.params.roleId),
                data.permissionId,
                data.enabled
            );

            const restaurantId = req.user?.restaurantId || 1;
            await logActivity(
                restaurantId,
                req.user?.userId || null,
                "Access Control",
                `Updated permission ID: ${data.permissionId} on role: ${req.params.roleId}`,
                "status"
            );

            sendSuccess(res, result);
        }
        catch (error) {
            next(error);
        }
    }

    getPermissionsByRoleInternal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const role = req.query.role as string;
            if (!role) {
                return res.status(400).json({error: "Role query param is required"});
            }
            const permissions = await this.memberService.getPermissionsByRoleInternal(role);
            sendSuccess(res, {permissions});
        }
        catch (error) {
            next(error);
        }
    }
}

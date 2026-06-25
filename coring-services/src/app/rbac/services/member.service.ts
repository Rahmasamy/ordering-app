import { db } from "../../../lib/knex/knex.js";
import { UserAlreadyExistsError } from "../../auth/error.js";
import { createPasswordReset } from "../../auth/repo/auth.repo.js";
import { generateOTP, hashOTP } from "../../auth/utils.js";
import { SystemRole } from "../../user/entity/enum.js";
import { createUserIfNotExists, selectUserByEmail } from "../../user/repo/user.repo.js";
import type { CreateMemberDTO } from "../dto/member.dto.js";
import { MemberBranch } from "../entity/member-branch.entity.js";
import { MemberStatus } from "../enums.js";
import { CannotCreateOwnerUserError, RoleNotFoundError } from "../errors.js";
import { setMemberBranches } from "../repo/member-branch.repo.js";
import { createRestaurantMember } from "../repo/restaurant_member.repo.js";
import { findRoleByName } from "../repo/role.repo.js";
import { injectable } from "tsyringe";


@injectable()
export class MemberService{
    async createMember(restaurantId: number, data: CreateMemberDTO){
        // dont accept owner role creation
        if(data.role == 'owner') {
            throw CannotCreateOwnerUserError
        }
        // check if user alr exists
        const existingUser = await selectUserByEmail(data.email);
        if(existingUser){
            throw UserAlreadyExistsError
        }

        // find roleId by role name
        const roleId = await findRoleByName(data.role);
        if(!roleId){
            throw RoleNotFoundError
        }
        // create user, member, assign branches
        const trx = await db.transaction();
        try {
            const now = new Date();
            const user = await createUserIfNotExists({
                email: data.email,
                name: data.name,
                phone: data.phoneNumber,
                password_hash: '',
                system_role: SystemRole.RESTAURANT_USER,
                created_at: now,
                updated_at: now,
            }, trx);

            const member = await createRestaurantMember(
                {
                    restaurantId,
                    userId: Number(user.id),
                    roleId,
                    createdAt: now,
                    updatedAt: now,
                    status: MemberStatus.INACTIVE
                }, trx
            )
            // check that those branches belong to that restaurant
            const rows = data.branchIds.map(branchId => new MemberBranch({
                branchId: branchId,
                memberId: member.id,
                createdAt: now,
            }))

            
            await setMemberBranches(member.id, rows, trx)

            // generate otp, create password reset record and send email
            const { otp } = await createPasswordReset(user.id, trx);
            // TODO: send email
            console.log(`mocked email sent ${otp}`)

            await trx.commit()
        }
        catch (err) {
            await trx.rollback();
            throw err;
        }
    }
}

export const memberService = new MemberService();
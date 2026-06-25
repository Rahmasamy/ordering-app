import type { User } from "../entity/user.entity.js";
import { NoUserFounderror } from "../error.js";
import { findUserById, updateUser } from "../repo/user.repo.js";
import type { UpdateUserDTO } from "../dto/user.dto.js";
import { injectable } from "tsyringe";

@injectable()
export class UserService {
    async getUserById(id: bigint) : Promise<Partial<User> | undefined> {
        const user = await findUserById(id)
        if(!user) {
            throw NoUserFounderror
        }
        return {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            system_role: user.system_role,
            created_at: user.created_at,
            updated_at: user.updated_at
        }
    }

    async updateUserProfile(id: bigint, updates: UpdateUserDTO): Promise<Partial<User>> {
        // Verify user exists
        const user = await findUserById(id)
        if(!user) {
            throw NoUserFounderror
        }

        // Update only allowed fields (name and phone)
        const updatePayload: { name?: string; phone?: string } = {};
        if (updates.name !== undefined) updatePayload.name = updates.name;
        if (updates.phone !== undefined) updatePayload.phone = updates.phone;

        const updatedUser = await updateUser(id, updatePayload);

        return {
            id: updatedUser.id,
            email: updatedUser.email,
            phone: updatedUser.phone,
            name: updatedUser.name,
            system_role: updatedUser.system_role,
            created_at: updatedUser.created_at,
            updated_at: updatedUser.updated_at
        }
    }

}

export const userService = new UserService()
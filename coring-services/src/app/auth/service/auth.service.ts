import { SystemRole } from "../../user/entity/enum.js";
import {  createUserIfNotExists, findIfUserExists } from "../../user/repo/user.repo.js";
import type { RegisterDTO } from "../dto/auth.dto.js";
import { unAuthorizedRegisterationError, UserAlreadyExistsError } from "../error.js";
import { generateRefreshToken, generateToken, hashPassword } from "../utils.js";

export class AuthService {
    register = async (data : RegisterDTO) => {
        // check if user exists
        if(data.SystemRole === SystemRole.SYSTEM_ADMIN) {
            throw unAuthorizedRegisterationError;
        }
        const userExists = await findIfUserExists(data.email, data.phone);
        if(userExists) {
            throw UserAlreadyExistsError;
        }
        // hash password 
        const hashedPassword = await hashPassword(data.password);
        // create user
        const now = new Date();
        const user = await createUserIfNotExists({
            email:data.email,
            phone:data.phone,
            name:data.name,
            password_hash: hashedPassword,
            system_role: data.SystemRole,
            created_at: now,
            updated_at: now
        })
        // generate token and refresh token 
        const tokenPayload = {
            userId: user.id,
            SystemRole: user.system_role,
            email: user.email
        };
        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);
        return {
            token,
            refreshToken,
            user : {
                id: user.id,
                email: user.email,
                phone: user.phone,
                name: user.name,
                system_role: user.system_role
            }
        };
    }
}
export const authService = new AuthService();
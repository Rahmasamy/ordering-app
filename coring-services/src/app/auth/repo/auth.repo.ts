import { db } from "../../../lib/knex/knex.js";
import  { PasswordReset } from "../entity/password-reset.entity.js"
import { generateOTP, hashOTP } from "../utils.js";

const PASSWORD_RESET_COLUMNS = [
    "id",
    "user_id",
    "otp_hash",
    "expires_at",
    "created_at",
    "consumed_at"

]
export function toPasswordResetEntity(raw:any):PasswordReset {
    return new PasswordReset({
        id:raw.id,
        user_id:raw.user_id,
        otp_hash:raw.otp_hash,
        expires_at:raw.expires_at,
        created_at:raw.created_at,
        consumed_at:raw.consumed_at
    })
}

import type { Knex } from "knex";

export async function createPasswordReset(userId: bigint, conn: Knex = db) {
    // Generate OTP
    const otp = generateOTP();
    
    // Hash OTP
    const hashedOtp = await hashOTP(otp);
    
    // Calculate expiration (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    // Insert password reset record
    const result = await conn("password_resets").insert({
        user_id: userId,
        otp_hash: hashedOtp,
        expires_at: expiresAt,
        created_at: new Date(),
        consumed_at: null
    }).returning(PASSWORD_RESET_COLUMNS);
    
    // Return OTP to send to user (not the hash)
    return { otp, expiresAt, result };
}


export async function findPasswordResetByUserId(userId : bigint): Promise<PasswordReset | undefined>
{
    const result = await db("password_resets")
    .where({user_id : userId})
    .whereNull("consumed_at")
    .orderBy("id","desc")
    .first();
    return toPasswordResetEntity(result)
}

export async function consumePasswordReset(id : bigint): Promise<void> {
    await db("password_resets")
    .where({id})
    .update({consumed_at : new Date()})
}

export async function updatePassword(userId: bigint, newPasswordHash: string): Promise<void> {
    await db("users")
    .where({ id: userId })
    .update({ password_hash: newPasswordHash });
}
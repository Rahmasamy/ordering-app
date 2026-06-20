import { email } from "zod"
import { db } from "../../../common/knex/knex.js"
import { User } from "../entity/user.entity.js"
import type { Knex } from "knex"

const USER_COLUMNS = [
    "id",
    "email",
    "phone",
    "name",
    "password_hash",
    "system_role",
    "created_at",
    "updated_at",
    "deleted_at"
]

function toEntity(raw:any):User {
    return new User( {
        id:raw.id,
        email:raw.email,
        phone:raw.phone,
        name:raw.name,
        password_hash:raw.password_hash,
        system_role:raw.system_role,
        created_at:raw.created_at,
        updated_at:raw.updated_at,
        deleted_at:raw.deleted_at
    } )
}
export async function selectUserByEmail(email: string) : Promise<User | undefined> {


   const user= await db("users").select(USER_COLUMNS)
    .where({
        email
    }).whereNull("deleted_at").first()
   
   return user? toEntity(user):undefined;
}

export async function findUserById(id: bigint) : Promise<User | undefined> {
    const user= await db("users").select(USER_COLUMNS)
    .where({
        id
    }).whereNull("deleted_at").first()

    return user? toEntity(user):undefined;
}
export async function findIfUserExists(email: string,phone:string ): Promise<boolean> {
   const raw = await db.raw(`SELECT EXISTS (SELECT 1 FROM users where email = ? and deleted_at is null OR phone = ?  and deleted_at is null) As exists`, [email, phone])

   return raw.rows[0].exists
}
export async function createUserIfNotExists(user:Partial<User>,conn:Knex = db) : Promise<User> {
    const [createdUser] = await conn("users").insert({
        email:user.email,
        phone:user.phone,
        name:user.name,
        password_hash:user.password_hash,
        system_role:user.system_role
    }).returning(USER_COLUMNS)
    return toEntity(createdUser)
}

export async function updateUser(id: bigint, updates: { name?: string; phone?: string }): Promise<User> {
    const [updatedUser] = await db("users")
        .where({ id })
        .update({
            ...updates,
            updated_at: new Date()
        })
        .returning(USER_COLUMNS);
    
    return toEntity(updatedUser);
}
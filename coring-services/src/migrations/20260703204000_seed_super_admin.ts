import type { Knex } from "knex";
import bcrypt from "bcrypt";

export async function up(knex: Knex): Promise<void> {
    const now = new Date();

    // 1. Seed Super Admin
    const superEmail = "superadmin@ogmail.com";
    const existingSuper = await knex("users").where({ email: superEmail }).first();
    if (!existingSuper) {
        const superHash = await bcrypt.hash("SuperAdmin123", 10);
        await knex("users").insert({
            email: superEmail,
            phone: "0000000000",
            name: "Super Admin",
            password_hash: superHash,
            system_role: "system_admin",
            created_at: now,
            updated_at: now
        });
    }

    // 2. Seed Restaurant User
    const restEmail = "restaurant@ogmail.com";
    let restUser = await knex("users").where({ email: restEmail }).first();
    if (!restUser) {
        const restHash = await bcrypt.hash("Restaurant123", 10);
        const [insertedUser] = await knex("users").insert({
            email: restEmail,
            phone: "0000000001",
            name: "Restaurant Owner",
            password_hash: restHash,
            system_role: "restaurant_user",
            created_at: now,
            updated_at: now
        }).returning("*");
        restUser = insertedUser;
    }

    // Ensure we have a valid restUser ID
    if (restUser) {
        // Seed Restaurant if none exists for this owner
        let restaurant = await knex("restaurants").where({ owner_id: restUser.id }).first();
        if (!restaurant) {
            const [insertedRest] = await knex("restaurants").insert({
                owner_id: restUser.id,
                name: "Gourmet Kitchen",
                logo_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
                status: "active",
                primary_country: "EG",
                created_at: now,
                updated_at: now,
                status_updated_at: now
            }).returning("*");
            restaurant = insertedRest;
        }

        if (restaurant) {
            // Seed Restaurant Member role association (Owner role)
            const ownerRole = await knex("roles").where({ name: "owner" }).first();
            if (ownerRole) {
                const existingMember = await knex("restaurant_members").where({
                    restaurant_id: restaurant.id,
                    user_id: restUser.id
                }).first();

                if (!existingMember) {
                    await knex("restaurant_members").insert({
                        restaurant_id: restaurant.id,
                        user_id: restUser.id,
                        role_id: ownerRole.id,
                        status: "active",
                        created_at: now,
                        updated_at: now
                    });
                }
            }
        }
    }

    // 3. Seed Customer User
    const custEmail = "customer@ogmail.com";
    const existingCust = await knex("users").where({ email: custEmail }).first();
    if (!existingCust) {
        const custHash = await bcrypt.hash("Customer123", 10);
        await knex("users").insert({
            email: custEmail,
            phone: "0000000002",
            name: "Customer User",
            password_hash: custHash,
            system_role: "customer",
            created_at: now,
            updated_at: now
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    const emails = ["superadmin@ogmail.com", "restaurant@ogmail.com", "customer@ogmail.com"];
    
    // Fetch users to clean up associations
    const users = await knex("users").whereIn("email", emails);
    const userIds = users.map(u => u.id);

    if (userIds.length > 0) {
        // Delete member branches and members
        const members = await knex("restaurant_members").whereIn("user_id", userIds);
        const memberIds = members.map(m => m.id);
        if (memberIds.length > 0) {
            await knex("member_branches").whereIn("member_id", memberIds).del();
            await knex("restaurant_members").whereIn("id", memberIds).del();
        }

        // Delete restaurants owned by these users
        await knex("restaurants").whereIn("owner_id", userIds).del();

        // Delete users
        await knex("users").whereIn("id", userIds).del();
    }
}

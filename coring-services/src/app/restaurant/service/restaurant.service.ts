import type { Knex } from "knex"
import type { RestaurantUserRegisterDTO } from "../../auth/dto/auth.dto.js"
import { Resturnat } from "../entity/resturant.entity.js"
import { ResturnatStatus } from "../entity/resturant.enum.js"
import { createResturant, getAllRestaurants, findRestaurantById, updateRestaurant, updateRestaurantStatus } from "../repo/restaurant.repo.js"
import type { CreateRestaurantDTO, UpdateRestaurantDTO } from "../dto/restaurant.dto.js"
import { SystemRole } from "../../user/entity/enum.js"
import { findIfUserExists, createUserIfNotExists } from "../../user/repo/user.repo.js"
import { hashPassword } from "../../auth/utils.js"
import { unAuthorizedError } from "../../auth/error.js"
import { db } from "../../../lib/knex/knex.js"
import { injectable } from "tsyringe";
import { buildPaginateResponse, type filterParams, type PaginationCursorParams } from "../../../pkg/pagination/pagination-cursor.js"


@injectable()
export class RestaurantService {
    getAllRestaurants = async (params:PaginationCursorParams,filters:filterParams[]) => {
          const raws= await getAllRestaurants(params,filters)
        
          return buildPaginateResponse(raws,params.limit,params.orderBy)
    }
    
    findById = async (id: number) => {
        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw new Error("Restaurant not found"); // Custom error could be thrown here
        }
        return restaurant;
    }

    create = async (userId : number, resturnat : RestaurantUserRegisterDTO,trx:Knex) => {
      const now = new Date()
      const restaurant = await createResturant(
        new Resturnat({
          owner_id: userId,
          name: resturnat.restaurantName,
          primary_country: resturnat.primaryCountry,
          status: ResturnatStatus.PENDING,
          logo_url: resturnat.logoUrl ?? "",
          created_at: now,
          updated_at: now,
          status_updated_at: now,
        }),
        trx
      );
      return restaurant;
    }

    createWithOwner = async (payload: CreateRestaurantDTO, userRole: string) => {
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw unAuthorizedError;
        }

        const userExists = await findIfUserExists(payload.owner.email, payload.owner.phone);
        if (userExists) {
            throw new Error("User already exists with this email or phone");
        }

        const hashedPassword = await hashPassword(payload.owner.password);

        return await db.transaction(async (trx) => {
            const user = await createUserIfNotExists({
                email: payload.owner.email,
                phone: payload.owner.phone,
                name: payload.owner.name,
                password_hash: hashedPassword,
                system_role: SystemRole.RESTAURANT_USER
            }, trx);

            const now = new Date();
            const restaurant = await createResturant(
                new Resturnat({
                    owner_id: Number(user.id),
                    name: payload.name,
                    primary_country: payload.primaryCountry,
                    status: ResturnatStatus.PENDING,
                    logo_url: payload.logoUrl ?? "",
                    created_at: now,
                    updated_at: now,
                    status_updated_at: now,
                }),
                trx
            );

            return { restaurant, owner: user };
        });
    }

    update = async (id: number, payload: UpdateRestaurantDTO, userId: number, userRole: string) => {
        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }

        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
            throw unAuthorizedError;
        }

        const updatePayload: Partial<Resturnat> = {};
        if (payload.name !== undefined) updatePayload.name = payload.name;
        if (payload.logoUrl !== undefined) updatePayload.logo_url = payload.logoUrl;
        if (payload.primaryCountry !== undefined) updatePayload.primary_country = payload.primaryCountry;

        const updatedRestaurant = await updateRestaurant(id, updatePayload);
        return updatedRestaurant;
    }

    updateStatus = async (id: number, status: string, userRole: string) => {
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw unAuthorizedError;
        }

        const restaurant = await findRestaurantById(id);
        if (!restaurant) {
            throw new Error("Restaurant not found");
        }

        const updatedRestaurant = await updateRestaurantStatus(id, status);
        return updatedRestaurant;
    }

}
export const restaurantService = new RestaurantService()
import type { NextFunction, Request, Response } from "express";
import { restaurantService, type RestaurantService } from "../service/restaurant.service.js";
import { CreateRestaurantDTO, UpdateRestaurantDTO, UpdateRestaurantStatusDTO } from "../dto/restaurant.dto.js";
import { validateBody } from "../../../common/validation/validate.js";

export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {
    }

    getAllRestaurants = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurants = await this.restaurantService.getAllRestaurants()
            return res.status(200).json({
                success: true,
                data: restaurants,
            })
        } catch (error) {
            next(error)
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const restaurant = await this.restaurantService.findById(Number(id));
            return res.status(200).json({
                id: restaurant.id,
                ownerId: restaurant.owner_id,
                name: restaurant.name,
                logoURL: restaurant.logo_url,
                primaryCountry: restaurant.primary_country,
                status: restaurant.status,
                createdAt: restaurant.created_at,
                updatedAt: restaurant.updated_at
            });
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateRestaurantDTO, req.body);
            const result = await this.restaurantService.createWithOwner(data, req.user!.role);
            return res.status(201).json({
                message: "Restaurant and owner created successfully",
                restaurant: {
                    id: result.restaurant.id,
                    ownerId: result.restaurant.owner_id,
                    name: result.restaurant.name,
                    logoURL: result.restaurant.logo_url,
                    primaryCountry: result.restaurant.primary_country,
                    status: result.restaurant.status,
                    createdAt: result.restaurant.created_at
                },
                owner: {
                    id: result.owner.id,
                    email: result.owner.email,
                    phone: result.owner.phone,
                    name: result.owner.name,
                    systemRole: result.owner.system_role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await validateBody(UpdateRestaurantDTO, req.body);
            const restaurant = await this.restaurantService.update(Number(id), data, Number(req.user!.userId), req.user!.role);
            
            return res.status(200).json({
                message: "Restaurant updated successfully",
                restaurant: {
                    id: restaurant.id,
                    name: restaurant.name,
                    logoURL: restaurant.logo_url,
                    primaryCountry: restaurant.primary_country,
                    status: restaurant.status,
                    updatedAt: restaurant.updated_at
                }
            });
        } catch (error) {
            next(error);
        }
    }

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = await validateBody(UpdateRestaurantStatusDTO, req.body);
            const restaurant = await this.restaurantService.updateStatus(Number(id), data.status, req.user!.role);
            
            return res.status(200).json({
                message: "Restaurant status updated successfully",
                restaurant: {
                    id: restaurant.id,
                    status: restaurant.status
                }
            });
        } catch (error) {
            next(error);
        }
    }

}

export const restaurantController = new RestaurantController(restaurantService)

import type { NextFunction, Request, Response } from "express";
import { unAuthorizedError } from "../../app/auth/error.js";
import { SystemRole } from "../../app/user/entity/enum.js";
import { permissionCacheService } from "../../app/rbac/services/permisssion-cache.service.js";

export interface rbacOptions {
    resource: string;
    action: string;
    allowSystemAdmin?: boolean;
    isOwnership?: boolean;
}

export const rbac = (options: rbacOptions) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (!req.user) {
                throw unAuthorizedError;
            }
            const { resource, action, allowSystemAdmin } = options;
            if (allowSystemAdmin && req.user?.role === SystemRole.SYSTEM_ADMIN) {
                return next()
            }
            if (req.user.role === SystemRole.RESTAURANT_USER) {
                const permissions = await permissionCacheService.getCachePermissions(req.user.restaurantRoleName as string)
                if (!permissions || !permissionCacheService.hasPermission(permissions, resource, action)) {
                    throw unAuthorizedError;
                }
                return next()

            }
            throw unAuthorizedError
        } catch (error) {
            next(error)
        }


    }
}

export function requireRestaurantMember(paramName: string= 'restaurantId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        const restaurantId = parseInt(req.params[paramName] as string); // req.params.restaurantId
        if (!restaurantId) {
            return res.status(500).json({"message": "something went wrong"});
        }

        if(Number(req.user?.restaurantId) !== Number(restaurantId)) {
            if(req.user?.role == SystemRole.SYSTEM_ADMIN) {
                next();
            }
            return res.status(403).json({
                error: "Permission denied",
            })
        }
        next();
    }
}

export async function requireBranchAccess(paramName: string= 'branchId') {
    return async(req: Request, res: Response, next: NextFunction) => {
        // check if the user has access to the branch
        next();
    }
} {}



import { unAuthorizedError } from "../../auth/error.js";
import { findRestaurantById } from "../../restaurant/repo/restaurant.repo.js";
import { SystemRole } from "../../user/entity/enum.js";
import type { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto.js";
import { addBranch, getNearByBranches, findBranchesByRestaurant, findBranchById, updateBranch, updateBranchStatus } from "../repo/branch.repo.js";
import { injectable } from "tsyringe";

@injectable()
export class BranchService {

    findNearby = async (lat:number, lng:number) => {
        const rows = await getNearByBranches(lat, lng);
        return rows;
    }

    findByRestaurant = async (restaurantId: number) => {
        const branches = await findBranchesByRestaurant(restaurantId);
        return { data: branches };
    }

    create = async (restaurantId: number, userId: number, userRole: SystemRole, data: CreateBranchDTO) => {
        const restaurant = await findRestaurantById(restaurantId);

        // if the logged in user is nto system admin and not the owner of restaurant then throw unauthorised err
        if(userRole != SystemRole.SYSTEM_ADMIN && (Number(restaurant.owner_id) !== Number(userId)) ){
            throw unAuthorizedError;
        }

        const now = new Date();
        const branch = await addBranch({
            restaurantId: restaurantId,
            label: data.label,
            countryCode: data.countryCode,
            lat: data.lat,
            lng: data.lng,
            addressText: data.addressText,
            isActive: false,
            opensAt: data.opensAt,
            closesAt: data.closesAt,
            currency: data.currency,
            deliveryRadius: data.deliveryRadius,
            commission: 0,
            createdAt: now,
            updatedAt: now,
            acceptOrders: true,
        });

        return branch;
    }

    update = async (id: number, payload: UpdateBranchDTO, userId: number, userRole: SystemRole) => {
        const branch = await findBranchById(id);
        if (!branch) {
            throw new Error("Branch not found");
        }

        const restaurant = await findRestaurantById(branch.restaurantId);
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.owner_id) !== Number(userId)) {
            throw unAuthorizedError;
        }

        const updatedBranch = await updateBranch(id, payload);
        return updatedBranch;
    }

    updateStatus = async (id: number, payload: UpdateBranchStatusDTO, userRole: SystemRole) => {
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw unAuthorizedError;
        }

        const branch = await findBranchById(id);
        if (!branch) {
            throw new Error("Branch not found");
        }

        const updatedBranch = await updateBranchStatus(id, payload);
        return updatedBranch;
    }
}

export const branchService = new BranchService();
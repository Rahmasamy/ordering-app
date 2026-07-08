import {injectable} from "tsyringe";
import {UnAuthorisedError} from "../../../lib/auth/errors";
import {RestaurantNotFoundError} from "../../restaurant/errors";
import {findRestaurantById} from "../../restaurant/repository/restaurant.repo";
import {BranchNotFoundError} from "../errors";
import {SystemRole} from "../../user/enums";
import {CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO} from "../dto/branch.dto";
import {findNearbyBranches, createBranch, findBranchesByRestaurant, findBranchById, findBranchesByIds, updateBranch, updateBranchStatus, findBranchMetadataById, findBranchMetadataByIds} from "../repository/branch.repository";

@injectable()
export class BranchService {

    findById = async (id: number) => {
        const branch = await findBranchById(id);
        if (!branch) throw BranchNotFoundError;
        return branch;
    }

    findMetadataById = async (id: number) => {
        const metadata = await findBranchMetadataById(id);
        if (!metadata) throw BranchNotFoundError;
        return metadata;
    }

    findByIds = async (ids: number[]) => {
        return await findBranchesByIds(ids);
    }

    findMetadataByIds = async (ids: number[]) => {
        return await findBranchMetadataByIds(ids);
    }

    findNearby = async (lat:number, lng:number) => {
        const rows = await findNearbyBranches(lat, lng);
        return rows;
    }

    findByRestaurant = async (restaurantId: number) => {
        return await findBranchesByRestaurant(restaurantId);
    }

    create = async (restaurantId: number, userId: number, userRole: SystemRole, data: CreateBranchDTO) => {
        const restaurant = await findRestaurantById(restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;

        if(userRole != SystemRole.SYSTEM_ADMIN && (Number(restaurant.ownerId) !== Number(userId)) ){
            throw UnAuthorisedError
        }

        const now = new Date();
        const branch = await createBranch({
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

    update = async (branchId: number, userId: number, userRole: SystemRole, data: UpdateBranchDTO) => {
        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }

        const restaurant = await findRestaurantById(branch.restaurantId);
        if (!restaurant) throw RestaurantNotFoundError;
        if (userRole !== SystemRole.SYSTEM_ADMIN && Number(restaurant.ownerId) !== Number(userId)) {
            throw UnAuthorisedError;
        }

        return await updateBranch(branchId, data);
    }

    updateStatus = async (branchId: number, userRole: SystemRole, data: UpdateBranchStatusDTO) => {
        if (userRole !== SystemRole.SYSTEM_ADMIN) {
            throw UnAuthorisedError;
        }

        const branch = await findBranchById(branchId);
        if (!branch) {
            throw BranchNotFoundError;
        }

        return await updateBranchStatus(branchId, data);
    }
}
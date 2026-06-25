import { sendSuccessResponse } from "../../../lib/http/response.js";
import { branchService, type BranchService } from "../service/branch.service.js";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto.js";
import type { NextFunction, Request, Response } from "express";
import type { SystemRole } from "../../user/entity/enum.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class BranchController {
    constructor(@inject(TOKENS.BranchService) private readonly branchService: BranchService) {
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.create(Number(req.params.restaurantId),Number(req.user?.userId!), req.user?.role! as SystemRole, data);
            sendSuccessResponse(res, {message: "Branch added", branch}, 201);
        } catch (err) {
            next(err);
        }
    }

    findNearby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.branchService.findNearby( Number(req.query.lat), Number(req.query.lng))
            sendSuccessResponse(res, results);
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.branchService.findByRestaurant(Number(req.params.restaurantId));
            sendSuccessResponse(res, results.data);
        } catch (err) {
            next(err);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchDTO, req.body);
            const branch = await this.branchService.update(Number(req.params.id), data, Number(req.user?.userId!), req.user?.role! as SystemRole);
            sendSuccessResponse(res, { message: "Branch updated successfully", branch });
        } catch (err) {
            next(err);
        }
    }

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchStatusDTO, req.body);
            const branch = await this.branchService.updateStatus(Number(req.params.id), data, req.user?.role! as SystemRole);
            sendSuccessResponse(res, { message: "Branch status updated successfully", branch });
        } catch (err) {
            next(err);
        }
    }
}

export const branchController = new BranchController(branchService)
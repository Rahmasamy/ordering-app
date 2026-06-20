import { validateBody } from "../../../common/validation/validate.js";
import { branchService, type BranchService } from "../service/branch.service.js";
import { CreateBranchDTO, UpdateBranchDTO, UpdateBranchStatusDTO } from "../dto/branch.dto.js";
import type { NextFunction, Request, Response } from "express";
import type { SystemRole } from "../../user/entity/enum.js";

export class BranchController {
    constructor(private readonly branchService: BranchService) {
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateBranchDTO, req.body);
            const branch = await this.branchService.create(Number(req.params.restaurantId),Number(req.user?.userId!), req.user?.role! as SystemRole, data);
            res.status(201).json({message: "Branch added", branch});
        } catch (err) {
            next(err);
        }
    }

    findNearby = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.branchService.findNearby( Number(req.query.lat), Number(req.query.lng))
            res.status(200).json({data :results});
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const results = await this.branchService.findByRestaurant(Number(req.params.restaurantId));
            res.status(200).json(results);
        } catch (err) {
            next(err);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchDTO, req.body);
            const branch = await this.branchService.update(Number(req.params.id), data, Number(req.user?.userId!), req.user?.role! as SystemRole);
            res.status(200).json({ message: "Branch updated successfully", branch });
        } catch (err) {
            next(err);
        }
    }

    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateBranchStatusDTO, req.body);
            const branch = await this.branchService.updateStatus(Number(req.params.id), data, req.user?.role! as SystemRole);
            res.status(200).json({ message: "Branch status updated successfully", branch });
        } catch (err) {
            next(err);
        }
    }
}

export const branchController = new BranchController(branchService)
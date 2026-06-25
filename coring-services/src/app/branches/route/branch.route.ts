import {Router} from "express";
import { withCache } from "../../../lib/cache/withCache.js";
import { BranchController } from "../controller/branch.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";

export const branchRouter = Router();
const branchController = container.resolve<BranchController>(TOKENS.BranchController);

branchRouter.get('/branches/nearby', withCache(false, 300), branchController.findNearby)
branchRouter.post('/restaurants/:restaurantId/branches',Auth, branchController.create)

branchRouter.get('/restaurants/:restaurantId/branches', withCache(false, 300), branchController.findByRestaurant)
branchRouter.patch('/branches/:id', Auth, branchController.update)
branchRouter.patch('/branches/:id/status', Auth, branchController.updateStatus)
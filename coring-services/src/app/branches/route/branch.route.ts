import {Router} from "express";
import { branchController } from "../controller/branch.controller.js";
import { Auth } from "../../../common/auth/guard.js";

export const branchRouter = Router();

branchRouter.get('/branches/nearby', branchController.findNearby)
branchRouter.post('/restaurants/:restaurantId/branches',Auth, branchController.create)

branchRouter.get('/restaurants/:restaurantId/branches', branchController.findByRestaurant)
branchRouter.patch('/branches/:id', Auth, branchController.update)
branchRouter.patch('/branches/:id/status', Auth, branchController.updateStatus)
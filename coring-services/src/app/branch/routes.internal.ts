import {Router} from "express";
import {requireInternalApiKey} from "../../lib/auth/api-key";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {BranchController} from "./controller/branch.controller";

export const internalBranchRouter = Router();

const branchController = container.resolve<BranchController>(TOKENS.BranchController);

internalBranchRouter.use(requireInternalApiKey);

// Order is important: literal /branches first, then /branches/:id
internalBranchRouter.get("/branches", branchController.findByIdsInternal);
internalBranchRouter.get("/branches/:id", branchController.findByIdInternal);

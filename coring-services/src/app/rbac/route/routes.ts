import {Router} from "express";
import { MemberController } from "../controller/member.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";
import { rbac, requireRestaurantMember } from "../../../lib/auth/rbac.js";

export const membersRouter = Router();
const memberController = container.resolve<MemberController>(TOKENS.MemberController);

membersRouter.post('/restaurants/:restaurantId/members',
    Auth,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'create'}),
    memberController.createMember
);
import {Router} from "express";
import {requireInternalApiKey} from "../../lib/auth/api-key";
import {container} from "../../lib/di/container";
import {TOKENS} from "../../lib/di/tokens";
import {MemberController} from "./controller/member.controller";

export const internalRbacRouter = Router();

const memberController = container.resolve<MemberController>(TOKENS.MemberController);

internalRbacRouter.use(requireInternalApiKey);

internalRbacRouter.get("/rbac/permissions", memberController.getPermissionsByRoleInternal);

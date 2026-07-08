import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import {requireRestaurantMember, rbac} from "../../lib/auth/rbac";
import {TOKENS} from "../../lib/di/tokens";
import {container} from "../../lib/di/container";
import {MemberController} from "./controller/member.controller";

export const rbacRouter = Router();

const memberController = container.resolve<MemberController>(TOKENS.MemberController);

// GET /roles/:role/permissions — public
rbacRouter.get('/roles/:role/permissions', memberController.getRolePermissions);

// GET /roles — list roles and all permissions
rbacRouter.get('/roles', authenticate, memberController.listRoles);

// POST /roles — create custom role
rbacRouter.post('/roles', authenticate, memberController.createRole);

// POST /roles/:roleId/permissions/toggle — toggle permission for role
rbacRouter.post('/roles/:roleId/permissions/toggle', authenticate, memberController.toggleRolePermission);

// POST /restaurants/:restaurantId/members — create/invite member
rbacRouter.post('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'create'}),
    memberController.createMember
);

// GET /restaurants/:restaurantId/members — list members
rbacRouter.get('/restaurants/:restaurantId/members',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'read'}),
    memberController.listMembers
);

// PATCH /restaurants/:restaurantId/members/:memberId — update member
rbacRouter.patch('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update'}),
    memberController.updateMember
);

// DELETE /restaurants/:restaurantId/members/:memberId — delete member
rbacRouter.delete('/restaurants/:restaurantId/members/:memberId',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'delete'}),
    memberController.deleteMember
);

// PUT /restaurants/:restaurantId/members/:memberId/branches — update branch assignments
rbacRouter.put('/restaurants/:restaurantId/members/:memberId/branches',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource:"core:member", action:'update'}),
    memberController.updateMemberBranches
);

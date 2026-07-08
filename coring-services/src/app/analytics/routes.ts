import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { requireRestaurantMember } from "../../lib/auth/rbac";
import { TOKENS } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { AnalyticsController } from "./controller/analytics.controller";

export const analyticsRouter = Router();

const analyticsController = container.resolve<AnalyticsController>(TOKENS.AnalyticsController);

// GET /restaurants/:restaurantId/analytics/overview
analyticsRouter.get('/restaurants/:restaurantId/analytics/overview',
    authenticate,
    requireRestaurantMember('restaurantId'),
    analyticsController.getOverview
);

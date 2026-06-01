import { Router } from "express";
import { healthRoutes } from "./app/health/health.routes.js";
import { authRoute } from "./app/auth/route/auth.route.js";
export const routes = Router();
routes.use("/health",healthRoutes);
routes.use("/auth",authRoute);
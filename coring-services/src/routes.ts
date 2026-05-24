import { Router } from "express";
import { healthRoutes } from "./app/health/health.routes.js";
export const routes = Router();
routes.use("/health",healthRoutes);
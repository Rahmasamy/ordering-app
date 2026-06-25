import { Router } from "express";
import { healthRoutes } from "./app/health/health.routes.js";
import { authRoute } from "./app/auth/route/auth.route.js";
import { userRoute } from "./app/user/routes/user.route.js";
import { customerAddressRoute } from "./app/customer-address/routes/customeAddresses.routes.js";
import { restaurantRouter } from "./app/restaurant/routes/restaurant.routes.js";
import { branchRouter } from "./app/branches/route/branch.route.js";
import { productRouter } from "./app/product/route/routes.js";
import { membersRouter } from "./app/rbac/route/routes.js";

export const routes = Router();

routes.use("/health",healthRoutes);
routes.use("/auth",authRoute);
routes.use("/user",userRoute);
routes.use("/customer/addresses", customerAddressRoute);
routes.use("/restaurant",restaurantRouter);
routes.use("/",branchRouter);
routes.use("/",productRouter);
routes.use("/",membersRouter);

import {Router} from "express";
import {authRouter} from "./app/auth/routes";
import {branchRouter} from "./app/branch/routes";
import {healthRouter} from "./app/health/health.routes";
import {rbacRouter} from "./app/rbac/routes";
import {restaurantRouter} from "./app/restaurant/routes";
import {cartRouter} from "./app/cart/routes";
import {userRouter} from "./app/user/routes";
import {customerAddressRouter} from "./app/customer-address/routes";
import {productRouter} from "./app/product/routes";
import {contentRouter} from "./app/content/routes";
import {offerRouter} from "./app/offer/routes";
import {analyticsRouter} from "./app/analytics/routes";
import {internalBranchRouter} from "./app/branch/routes.internal";
import {internalProductRouter} from "./app/product/routes.internal";
import {internalRbacRouter} from "./app/rbac/routes.internal";

export const routes = Router();

routes.use("/health", healthRouter);
// user
routes.use('/user', userRouter)
// auth
routes.use('/auth', authRouter);
// customer addresses
routes.use('/customer/addresses', customerAddressRouter);
// restaurant
routes.use('/restaurants',restaurantRouter)
routes.use('/',branchRouter)
// products
routes.use('/', productRouter)
routes.use('/', contentRouter)
routes.use('/', offerRouter)
routes.use('/', rbacRouter)
routes.use('/', analyticsRouter)
// cart
routes.use('/cart', cartRouter)

// internal (inter-service sync)
routes.use('/internal', internalBranchRouter)
routes.use('/internal', internalProductRouter)
routes.use('/internal', internalRbacRouter)


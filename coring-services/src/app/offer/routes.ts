import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import {rbac, requireRestaurantMember} from "../../lib/auth/rbac";
import {TOKENS} from "../../lib/di/tokens";
import {container} from "../../lib/di/container";
import {OfferController} from "./controller/offer.controller";

export const offerRouter = Router();

const offerController = container.resolve<OfferController>(TOKENS.OfferController);

// Public read endpoints
offerRouter.get('/offers', offerController.getAll);
offerRouter.get('/offers/:id', offerController.findById);
offerRouter.get('/products/:productId/offers', offerController.findByProduct);
offerRouter.get('/restaurants/:restaurantId/offers', offerController.findByRestaurant);

// Protected write endpoints
offerRouter.post('/restaurants/:restaurantId/offers',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:restaurant", action: 'update'}),
    offerController.createForRestaurant
);
offerRouter.post('/products/:productId/offers',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    offerController.createForProduct
);
offerRouter.patch('/offers/:id',
    authenticate,
    rbac({resource: "core:restaurant", action: 'update'}),
    offerController.update
);

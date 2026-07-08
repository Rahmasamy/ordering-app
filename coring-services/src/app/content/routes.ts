import {Router} from "express";
import {authenticate} from "../../lib/auth/guard";
import {rbac, requireRestaurantMember} from "../../lib/auth/rbac";
import {TOKENS} from "../../lib/di/tokens";
import {container} from "../../lib/di/container";
import {ContentController} from "./controller/content.controller";

export const contentRouter = Router();

const contentController = container.resolve<ContentController>(TOKENS.ContentController);

// Public read endpoints
contentRouter.get('/products/:productId/content', contentController.getProductDetails);
contentRouter.get('/products/:productId/story', contentController.getProductStory);
contentRouter.get('/products/:productId/ingredients', contentController.getProductIngredients);
contentRouter.get('/products/:productId/testimonials', contentController.getProductTestimonials);
contentRouter.get('/restaurants/:restaurantId/story', contentController.getRestaurantStory);
contentRouter.get('/restaurants/:restaurantId/testimonials', contentController.getRestaurantTestimonials);

// Protected write endpoints
contentRouter.post('/products/:productId/story',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.createProductStory
);
contentRouter.post('/restaurants/:restaurantId/story',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:restaurant", action: 'update'}),
    contentController.createRestaurantStory
);
contentRouter.patch('/stories/:storyId',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.updateStory
);
contentRouter.post('/products/:productId/ingredients',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.createProductIngredient
);
contentRouter.post('/products/:productId/ingredients/batch',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.createProductIngredientsBatch
);
contentRouter.patch('/ingredients/:ingredientId',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.updateIngredient
);
contentRouter.delete('/ingredients/:ingredientId',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.deleteIngredient
);
contentRouter.post('/products/:productId/testimonials',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.createProductTestimonial
);
contentRouter.post('/restaurants/:restaurantId/testimonials',
    authenticate,
    requireRestaurantMember('restaurantId'),
    rbac({resource: "core:restaurant", action: 'update'}),
    contentController.createRestaurantTestimonial
);
contentRouter.patch('/testimonials/:testimonialId',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.updateTestimonial
);
contentRouter.delete('/testimonials/:testimonialId',
    authenticate,
    rbac({resource: "core:product", action: 'update'}),
    contentController.deleteTestimonial
);

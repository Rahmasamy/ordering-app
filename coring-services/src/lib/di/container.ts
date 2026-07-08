import {container} from "tsyringe";
import {cacheProvider} from "../cache/init";
import {emailProvider} from "../email/init";
import {TOKENS} from "./tokens";
import {Logger} from "../logger/logger";

// Infrastructure
container.registerSingleton<Logger>(TOKENS.Logger, Logger);

// Services
import {AuthService} from "../../app/auth/service/auth.service";
import {UserService} from "../../app/user/service/user.service";
import {RestaurantService} from "../../app/restaurant/service/restaurant.service";
import {BranchService} from "../../app/branch/service/branch.service";
import {ProductService} from "../../app/product/service/product.service";
import {MemberService} from "../../app/rbac/service/member.service";
import {CustomerAddressService} from "../../app/customer-address/service/customer-address.service";
import {PermissionCacheService} from "../../app/rbac/service/permission-cache.service";
import {CartService} from "../../app/cart/service/cart.service";
import {ContentService} from "../../app/content/service/content.service";
import {OfferService} from "../../app/offer/service/offer.service";
import {AnalyticsService} from "../../app/analytics/service/analytics.service";

// Controllers
import {AuthController} from "../../app/auth/controller/auth.controller";
import {UserController} from "../../app/user/controller/user.controller";
import {RestaurantController} from "../../app/restaurant/controller/restaurant.controller";
import {BranchController} from "../../app/branch/controller/branch.controller";
import {ProductController} from "../../app/product/controller/product.controller";
import {MemberController} from "../../app/rbac/controller/member.controller";
import {CustomerAddressController} from "../../app/customer-address/controller/customer-address.controller";
import {CartController} from "../../app/cart/controller/cart.controller";
import {ContentController} from "../../app/content/controller/content.controller";
import {OfferController} from "../../app/offer/controller/offer.controller";
import {AnalyticsController} from "../../app/analytics/controller/analytics.controller";

container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<RestaurantService>(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton<BranchService>(TOKENS.BranchService, BranchService);
container.registerSingleton<ProductService>(TOKENS.ProductService, ProductService);
container.registerSingleton<MemberService>(TOKENS.MemberService, MemberService);
container.registerSingleton<CustomerAddressService>(TOKENS.CustomerAddressService, CustomerAddressService);
container.registerSingleton<PermissionCacheService>(TOKENS.PermissionCacheService, PermissionCacheService);
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);
container.registerSingleton<CartService>(TOKENS.CartService, CartService);
container.registerSingleton<ContentService>(TOKENS.ContentService, ContentService);
container.registerSingleton<OfferService>(TOKENS.OfferService, OfferService);
container.registerSingleton<AnalyticsService>(TOKENS.AnalyticsService, AnalyticsService);

container.registerSingleton<AuthController>(TOKENS.AuthController, AuthController);
container.registerSingleton<UserController>(TOKENS.UserController, UserController);
container.registerSingleton<RestaurantController>(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton<BranchController>(TOKENS.BranchController, BranchController);
container.registerSingleton<ProductController>(TOKENS.ProductController, ProductController);
container.registerSingleton<MemberController>(TOKENS.MemberController, MemberController);
container.registerSingleton<CustomerAddressController>(TOKENS.CustomerAddressController, CustomerAddressController);
container.registerSingleton<CartController>(TOKENS.CartController, CartController);
container.registerSingleton<ContentController>(TOKENS.ContentController, ContentController);
container.registerSingleton<OfferController>(TOKENS.OfferController, OfferController);
container.registerSingleton<AnalyticsController>(TOKENS.AnalyticsController, AnalyticsController);

container.registerInstance(TOKENS.CacheProvider, cacheProvider)
container.registerInstance(TOKENS.EmailProvider, emailProvider)

export {container};
import { container } from "tsyringe";
import { UserService } from "../../app/user/service/user.service.js";
import { TOKENS } from "./tokens.js";
import { Logger } from "../logger/logger.js";
import { RestaurantService } from "../../app/restaurant/service/restaurant.service.js";
import { BranchService } from "../../app/branches/service/branch.service.js";
import { ProductService } from "../../app/product/services/product.service.js";
import { MemberService } from "../../app/rbac/services/member.service.js";
import { CustomerAddressService } from "../../app/customer-address/services/customeAddresses.services.js";
import { AuthService } from "../../app/auth/service/auth.service.js";
import { AuthController } from "../../app/auth/controller/auth.controller.js";
import { UserController } from "../../app/user/controllers/userController.js";
import { RestaurantController } from "../../app/restaurant/controllers/restaurant.controller.js";
import { BranchController } from "../../app/branches/controller/branch.controller.js";
import { MemberController } from "../../app/rbac/controller/member.controller.js";
import { CustomerAddressController } from "../../app/customer-address/controllers/customeAddresses.controller.js";
import { ProductController } from "../../app/product/controller/product.controller.js";
import { PermissionCacheService } from "../../app/rbac/services/permisssion-cache.service.js";
import { cacheProvider } from "../cache/init.js";

// Infrastructure
container.registerSingleton<Logger>(TOKENS.Logger, Logger);

// Services

container.registerSingleton<UserService>(TOKENS.UserService, UserService);
container.registerSingleton<RestaurantService>(TOKENS.RestaurantService, RestaurantService);
container.registerSingleton<BranchService>(TOKENS.BranchService, BranchService);
container.registerSingleton<ProductService>(TOKENS.ProductService, ProductService);
container.registerSingleton<MemberService>(TOKENS.MemberService, MemberService);
container.registerSingleton<CustomerAddressService>(TOKENS.CustomerAddressService, CustomerAddressService);
container.registerSingleton<PermissionCacheService>(TOKENS.PermissionCacheService, PermissionCacheService);
container.registerSingleton<AuthService>(TOKENS.AuthService, AuthService);

container.registerSingleton<AuthController>(TOKENS.AuthController, AuthController);
container.registerSingleton<UserController>(TOKENS.UserController, UserController);
container.registerSingleton<RestaurantController>(TOKENS.RestaurantController, RestaurantController);
container.registerSingleton<BranchController>(TOKENS.BranchController, BranchController);
container.registerSingleton<ProductController>(TOKENS.ProductController, ProductController);
container.registerSingleton<MemberController>(TOKENS.MemberController, MemberController);
container.registerSingleton<CustomerAddressController>(TOKENS.CustomerAddressController, CustomerAddressController);

container.registerInstance(TOKENS.CacheProvider, cacheProvider)

export {container};
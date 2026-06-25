import { Router } from "express";
import { CustomerAddressController } from "../controllers/customeAddresses.controller.js";
import { TOKENS } from "../../../lib/di/tokens.js";
import { container } from "../../../lib/di/container.js";
import { Auth } from "../../../lib/auth/guard.js";

export const customerAddressRoute = Router();
const customerAddressController = container.resolve<CustomerAddressController>(TOKENS.CustomerAddressController);

customerAddressRoute.get("/", Auth, customerAddressController.getAddresses);
customerAddressRoute.post("/", Auth, customerAddressController.createAddress);
customerAddressRoute.patch("/:addressId", Auth, customerAddressController.updateAddress);
customerAddressRoute.delete("/:addressId", Auth, customerAddressController.deleteAddress);

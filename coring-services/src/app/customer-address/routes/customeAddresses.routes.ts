import { Router } from "express";
import { customerAddressController } from "../controllers/customeAddresses.controller.js";
import { Auth } from "../../../common/auth/guard.js";

export const customerAddressRoute = Router();

customerAddressRoute.get("/", Auth, customerAddressController.getAddresses);
customerAddressRoute.post("/", Auth, customerAddressController.createAddress);
customerAddressRoute.patch("/:addressId", Auth, customerAddressController.updateAddress);
customerAddressRoute.delete("/:addressId", Auth, customerAddressController.deleteAddress);

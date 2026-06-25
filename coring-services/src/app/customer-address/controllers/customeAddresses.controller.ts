import type { NextFunction, Request, Response } from "express";
import { sendSuccessResponse } from "../../../lib/http/response.js";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customeAddresses.dto.js";
import { CustomerAddressService, customerAddressService } from "../services/customeAddresses.services.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class CustomerAddressController {
  constructor(@inject(TOKENS.CustomerAddressService) private readonly addressService: CustomerAddressService) {}

  getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const addresses = await this.addressService.getAddresses(userId);
      sendSuccessResponse(res, addresses.map((addr) => addr.toJSON()));
    } catch (error) {
      return next(error);
    }
  };

  createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const data = await validateBody(CreateCustomerAddressDTO, req.body);
      const created = await this.addressService.createAddress(userId, data);
      sendSuccessResponse(res, {
        message: "Address added",
        address: created.toJSON()
      }, 201);
    } catch (error) {
      return next(error);
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const addressId = BigInt(req.params.addressId as string);
      const data = await validateBody(UpdateCustomerAddressDTO, req.body);
      const updated = await this.addressService.updateAddress(addressId, userId, data);
      sendSuccessResponse(res, {
        message: "Address updated",
        address: updated.toJSON()
      });
    } catch (error) {
      return next(error);
    }
  };

  deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const addressId = BigInt(req.params.addressId as string);
      await this.addressService.deleteAddress(addressId, userId);
      sendSuccessResponse(res, {
        message: "Address deleted"
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const customerAddressController = new CustomerAddressController(customerAddressService);

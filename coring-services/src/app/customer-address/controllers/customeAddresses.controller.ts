import type { NextFunction, Request, Response } from "express";
import { validateBody } from "../../../common/validation/validate.js";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customeAddresses.dto.js";
import { CustomerAddressService, customerAddressService } from "../services/customeAddresses.services.js";

export class CustomerAddressController {
  constructor(private readonly addressService: CustomerAddressService) {}

  getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const addresses = await this.addressService.getAddresses(userId);
      res.status(200).json({
        data: addresses.map((addr) => addr.toJSON())
      });
    } catch (error) {
      return next(error);
    }
  };

  createAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = BigInt(req.user?.userId!);
      const data = await validateBody(CreateCustomerAddressDTO, req.body);
      const created = await this.addressService.createAddress(userId, data);
      res.status(201).json({
        message: "Address added",
        address: created.toJSON()
      });
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
      res.status(200).json({
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
      res.status(200).json({
        message: "Address deleted"
      });
    } catch (error) {
      return next(error);
    }
  };
}

export const customerAddressController = new CustomerAddressController(customerAddressService);

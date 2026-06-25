import type { CustomerAddress } from "../entity/customer-address.entity.js";
import { CreateCustomerAddressDTO, UpdateCustomerAddressDTO } from "../dto/customeAddresses.dto.js";
import {
  findAddressesByUserId,
  findAddressByIdAndUserId,
  createAddress as createAddressRepo,
  updateAddress as updateAddressRepo,
  deleteAddress as deleteAddressRepo,
  clearDefaultAddresses
} from "../repo/customer-address.repo.js";
import { AppError } from "../../../lib/error/AppError.js";
import { injectable } from "tsyringe";

@injectable()
export class CustomerAddressService {
  async getAddresses(userId: bigint): Promise<CustomerAddress[]> {
    return await findAddressesByUserId(userId);
  }

  async createAddress(userId: bigint, data: CreateCustomerAddressDTO): Promise<CustomerAddress> {
    // If setting this address as default, unset other default addresses for this user
    if (data.isDefault) {
      await clearDefaultAddresses(userId);
    }

    return await createAddressRepo({
      user_id: userId,
      label: data.label,
      lat: data.lat,
      lng: data.lng,
      country: data.country,
      city: data.city,
      street: data.street,
      building: data.building,
      apt_number: data.apartmentNumber,
      type: data.type,
      is_default: data.isDefault
    });
  }

  async updateAddress(
    id: bigint,
    userId: bigint,
    data: UpdateCustomerAddressDTO
  ): Promise<CustomerAddress> {
    // Verify that the address exists and belongs to the user
    const address = await findAddressByIdAndUserId(id, userId);
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    // If updating this address to be default, unset other default addresses for this user
    if (data.isDefault) {
      await clearDefaultAddresses(userId);
    }

    return await updateAddressRepo(id, userId, {
      label: data.label,
      lat: data.lat,
      lng: data.lng,
      country: data.country,
      city: data.city,
      street: data.street,
      building: data.building,
      apt_number: data.apartmentNumber,
      type: data.type,
      is_default: data.isDefault
    });
  }

  async deleteAddress(id: bigint, userId: bigint): Promise<void> {
    // Verify that the address exists and belongs to the user
    const address = await findAddressByIdAndUserId(id, userId);
    if (!address) {
      throw new AppError("Address not found", 404);
    }

    await deleteAddressRepo(id, userId);
  }
}

export const customerAddressService = new CustomerAddressService();

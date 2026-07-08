import { injectable } from "tsyringe";
import { findProductById } from "../../product/repository/product.repository";
import { ProductNotFoundError } from "../../product/errors";
import { AddToCartDTO } from "../dto/cart.dto";
import { 
    findActiveCartByUserId, 
    createCart, 
    findCartItem, 
    addCartItem, 
    updateCartItemQuantity, 
    removeCartItem, 
    getCartItemsWithProductDetails,
    clearCartItems
} from "../repository/cart.repository";

@injectable()
export class CartService {
    
    async getOrCreateActiveCart(userId: number) {
        let cart = await findActiveCartByUserId(userId);
        if (!cart) {
            cart = await createCart(userId);
        }
        return cart;
    }

    async getCartDetails(userId: number) {
        const cart = await this.getOrCreateActiveCart(userId);
        const items = await getCartItemsWithProductDetails(cart.id);
        
        const total = items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
        
        return {
            id: cart.id,
            userId: cart.userId,
            status: cart.status,
            items,
            total: Number(total.toFixed(2))
        };
    }

    async addItemToCart(userId: number, data: AddToCartDTO) {
        const cart = await this.getOrCreateActiveCart(userId);
        
        const product = await findProductById(data.productId);
        if (!product) {
            throw ProductNotFoundError;
        }

        const quantity = data.quantity || 1;
        const selectedAddons = data.selectedAddons || [];
        const selectedDoneness = data.selectedDoneness;

        // Calculate unit price: base price (or branch price? We use base price 
        // from some logic or assume product.price exists if branch logic isn't strictly enforced for this mock cart)
        // Wait, product entity doesn't have base price directly, it relies on branch details. 
        // For simplicity in cart, let's assume we can fetch price from product_branch_details 
        // or we use a fallback base price. Let's get the price from the DB or mock it if undefined.
        // I'll fetch the base price using a quick DB query or assume 10.0 for now if it's missing in product.
        const db = require('../../../lib/knex/knex').db;
        const branchDetail = await db('product_branch_details').where('product_id', data.productId).first();
        let basePrice = branchDetail ? branchDetail.price : 10;

        // Calculate addons cost
        let addonsCost = 0;
        if (product.addons && Array.isArray(product.addons)) {
            for (const addonName of selectedAddons) {
                const addonDef = product.addons.find((a: any) => a.name === addonName);
                if (addonDef && addonDef.price) {
                    addonsCost += addonDef.price;
                }
            }
        }
        
        const unitPrice = basePrice + Math.round(addonsCost * 100);

        // Check if item already exists with exact same customizations
        const existingItem = await findCartItem(cart.id, data.productId, selectedDoneness, selectedAddons);
        
        if (existingItem) {
            await updateCartItemQuantity(existingItem.id, existingItem.quantity + quantity);
        } else {
            await addCartItem(cart.id, data.productId, quantity, unitPrice, selectedDoneness, selectedAddons);
        }

        return this.getCartDetails(userId);
    }

    async removeItemFromCart(userId: number, productId: number) {
        const cart = await findActiveCartByUserId(userId);
        if (cart) {
            await removeCartItem(cart.id, productId);
        }
        return this.getCartDetails(userId);
    }

    async clearUserCart(userId: number) {
        const cart = await findActiveCartByUserId(userId);
        if (cart) {
            await clearCartItems(cart.id);
        }
        return this.getCartDetails(userId);
    }
}

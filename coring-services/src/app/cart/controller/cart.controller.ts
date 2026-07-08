import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";
import { validateBody } from "../../../lib/validation/validate";
import { AddToCartDTO } from "../dto/cart.dto";
import { CartService } from "../service/cart.service";

@injectable()
export class CartController {
    constructor(@inject(TOKENS.CartService) private readonly cartService: CartService) {}

    getCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cart = await this.cartService.getCartDetails(req.user?.userId!);
            sendSuccess(res, cart);
        } catch (err) {
            next(err);
        }
    }

    addItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(AddToCartDTO, req.body);
            const cart = await this.cartService.addItemToCart(req.user?.userId!, data);
            sendSuccess(res, { message: "Item added to cart", cart });
        } catch (err) {
            next(err);
        }
    }

    removeItem = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const productId = Number(req.params.productId);
            const cart = await this.cartService.removeItemFromCart(req.user?.userId!, productId);
            sendSuccess(res, { message: "Item removed from cart", cart });
        } catch (err) {
            next(err);
        }
    }

    clearCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const cart = await this.cartService.clearUserCart(req.user?.userId!);
            sendSuccess(res, { message: "Cart cleared", cart });
        } catch (err) {
            next(err);
        }
    }
}

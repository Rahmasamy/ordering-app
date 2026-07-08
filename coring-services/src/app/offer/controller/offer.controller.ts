import {Request, Response, NextFunction} from "express";
import {injectable, inject} from "tsyringe";
import {TOKENS} from "../../../lib/di/tokens";
import {sendSuccess, sendPaginated} from "../../../lib/http/response";
import {parsePaginationQuery, parseFilters} from "../../../lib/http/pagination/parse-query";
import {validateBody} from "../../../lib/validation/validate";
import {CreateOfferDTO, UpdateOfferDTO} from "../dto/offer.dto";
import {OfferService} from "../service/offer.service";

@injectable()
export class OfferController {
    constructor(@inject(TOKENS.OfferService) private readonly offerService: OfferService) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const params = parsePaginationQuery(req.query, ['createdAt', 'expiresAt']);
            const filters = parseFilters(req.query, ['id', 'restaurantId', 'productId', 'isActive']);
            const result = await this.offerService.findAll(params, filters);
            sendPaginated(res, result.data, result.meta);
        } catch (err) {
            next(err);
        }
    }

    findById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offer = await this.offerService.findById(Number(req.params.id));
            sendSuccess(res, offer);
        } catch (err) {
            next(err);
        }
    }

    findByProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offers = await this.offerService.findByProduct(Number(req.params.productId));
            sendSuccess(res, offers);
        } catch (err) {
            next(err);
        }
    }

    findByRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offers = await this.offerService.findByRestaurant(Number(req.params.restaurantId));
            sendSuccess(res, offers);
        } catch (err) {
            next(err);
        }
    }

    createForRestaurant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateOfferDTO, req.body);
            const offer = await this.offerService.createForRestaurant(Number(req.params.restaurantId), data);
            sendSuccess(res, {message: "Offer created", offer}, 201);
        } catch (err) {
            next(err);
        }
    }

    createForProduct = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateOfferDTO, req.body);
            const offer = await this.offerService.createForProduct(Number(req.params.productId), data);
            sendSuccess(res, {message: "Offer created", offer}, 201);
        } catch (err) {
            next(err);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(UpdateOfferDTO, req.body);
            const offer = await this.offerService.update(Number(req.params.id), data);
            sendSuccess(res, {message: "Offer updated", offer});
        } catch (err) {
            next(err);
        }
    }
}

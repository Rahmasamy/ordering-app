import { NextFunction, Response, Request } from "express";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";
import { AnalyticsService } from "../service/analytics.service";

@injectable()
export class AnalyticsController {
    constructor(
        @inject(TOKENS.AnalyticsService) private readonly analyticsService: AnalyticsService
    ) {}

    getOverview = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const restaurantId = Number(req.params.restaurantId);
            const result = await this.analyticsService.getOverview(restaurantId);
            sendSuccess(res, result);
        } catch (error) {
            next(error);
        }
    }
}

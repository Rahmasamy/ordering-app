import type {NextFunction, Response, Request} from "express";
import { sendSuccessResponse } from "../../../lib/http/response.js";
import { memberService, type MemberService } from "../services/member.service.js";
import { CreateMemberDTO } from "../dto/member.dto.js";
import { validateBody } from "../../../lib/validation/validate.js";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens.js";

@injectable()
export class MemberController {
    constructor(@inject(TOKENS.MemberService) private readonly memberService: MemberService) {}
    createMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = await validateBody(CreateMemberDTO,req.body);
            const result = await this.memberService.createMember(Number(req.params.restaurantId), data);
            sendSuccessResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
}

export const memberController = new MemberController(memberService);
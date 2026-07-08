import {NextFunction, Request, Response} from "express";
import {env} from "../config/env";
import {UnAuthorisedError} from "./errors";

export function requireInternalApiKey(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers["api-key"];
    if (!apiKey || apiKey !== env.internalApiKey) {
        throw UnAuthorisedError;
    }
    next();
}

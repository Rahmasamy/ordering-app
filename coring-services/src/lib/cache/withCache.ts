import { container } from "../di/container.js";
import { TOKENS } from "../di/tokens.js";
import type { ICacheProvider } from "../../pkg/cache/ICacheProvider.js";
import type { NextFunction, Request, Response } from "express";

export function withCache(userScope: boolean = true, ttl: number) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);
        let cacheKey = `${req.originalUrl}:${req.method}`
        if (userScope) {
            cacheKey += `:${req.user?.userId}`;
        }

        const cachedValue = await cacheProvider.get<string>(cacheKey);
        if (cachedValue) {
            res.setHeader("X-Cache-Hit", "true");
            return res.status(200).json(JSON.parse(cachedValue))
        }
        // Call the original function and store the result in cache
        const originalJson = res.json.bind(res)
        res.json = ((body: any) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Fire and forget cache set so we don't block the response and return a Promise
                cacheProvider.set(cacheKey, JSON.stringify(body), ttl).catch(console.error);
                res.setHeader("X-Cache-Hit", "false");
            }
            return originalJson(body);
        }) as any;
        return next();




    }
}
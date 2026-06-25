import { RedisProvider } from "../../pkg/cache/redis.js";
import { env } from "../config/env.config.js";

export const cacheProvider = new RedisProvider({
    host:env.cache.host,
    port:Number(env.cache.port),
    password:env.cache.password
});
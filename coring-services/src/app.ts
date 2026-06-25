import express from "express";
import cors from "cors";
import { routes } from "./routes.js";

import cookieParser from "cookie-parser";
import { correlationId } from "./lib/correlation/correlationId.js";
import { errorHandler } from "./lib/error/errorHandler.js";
import { env } from "./lib/config/env.config.js";
import helmet from "helmet";
export function createApp() {
    const app= express();
    app.use(cors({origin:env.cors,credentials:true}))
    app.use(helmet());
    app.set("query parser","extended")
    app.use(express.json());
    app.use(cookieParser())
     app.use(correlationId);
    app.use("/api",routes)
     app.use(errorHandler);
    return app;
}
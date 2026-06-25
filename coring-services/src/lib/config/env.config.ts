// strict config types for env file
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

config({
    path: path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),"../../../.env"
    )
});
const schema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT : z.string().default("5000"),
    DB_HOST : z.string().default("localhost"),
    DB_PORT : z.string().default("5432"),
    DB_USER : z.string().default("postgres"),
    DB_PASSWORD : z.string().default("postgres"),
    DB_NAME : z.string().default("coring_services_db"),
    DB_POOL_MAX : z.string().default("10"),
    DB_MIGRATIONS_DIRECTORY: z.string().default("migrations"),
    DB_MIGRATIONS_EXTENSION: z.string().default("ts"),
    ACCESS_TOKEN_SECRET: z.string(),
    ACCESS_TOKEN_EXPIRATION: z.string().default("1h"),
    ACCESS_REFRESH_TOKEN_SECRET: z.string(),
    ACCESS_REFRESH_TOKEN_EXPIRATION: z.string().default("7d"),
    CORS_ORIGINS: z.string().default("http://localhost:3000"),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.string().default("6379"),
    REDIS_PASSWORD: z.string().default(""),
    


})
const paredSchema = schema.parse(process.env);
export const env ={
    nodeEnv: paredSchema.NODE_ENV,
    PORT : Number(paredSchema.PORT),
    db : {
        host : paredSchema.DB_HOST,
        port : Number(paredSchema.DB_PORT),
        user : paredSchema.DB_USER,
        password : paredSchema.DB_PASSWORD,
        poolMax : Number(paredSchema.DB_POOL_MAX),
        name : paredSchema.DB_NAME,
        migrationsDirectory: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../" + paredSchema.DB_MIGRATIONS_DIRECTORY),
        migrationsExtension: paredSchema.DB_MIGRATIONS_EXTENSION
    },
    auth : {
        accessTokenSecret : paredSchema.ACCESS_TOKEN_SECRET,
        accessTokenExpiration : paredSchema.ACCESS_TOKEN_EXPIRATION,
        refreshTokenSecret : paredSchema.ACCESS_REFRESH_TOKEN_SECRET,
        refreshTokenExpiration : paredSchema.ACCESS_REFRESH_TOKEN_EXPIRATION
    },
    cors: paredSchema.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    cache : {
        host : paredSchema.REDIS_HOST,
        port : Number(paredSchema.REDIS_PORT),
        password : paredSchema.REDIS_PASSWORD
    } 
}
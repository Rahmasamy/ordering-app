// strict config types for env file
import { config } from "dotenv";
import { z } from "zod";

config();
const schema = z.object({
    PORT : z.string().default("5000"),
    DB_HOST : z.string().default("localhost"),
    DB_PORT : z.string().default("5432"),
    DB_USER : z.string().default("postgres"),
    DB_PASSWORD : z.string().default("postgres"),
    DB_NAME : z.string().default("coring_services_db"),
    DB_POOL_MAX : z.string().default("10")
})
const paredSchema = schema.parse(process.env);
export const env ={
    PORT : Number(paredSchema.PORT),
    db : {
        host : paredSchema.DB_HOST,
        port : Number(paredSchema.DB_PORT),
        user : paredSchema.DB_USER,
        password : paredSchema.DB_PASSWORD,
        name : paredSchema.DB_NAME,
        poolMax : Number(paredSchema.DB_POOL_MAX)
    }
}
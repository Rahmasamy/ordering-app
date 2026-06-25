import knex from "knex";
import { knexConfig } from "./knexConfig.js";

export const db = knex(knexConfig);
export async function PingDB() {
    await db.raw('SELECT 1');
}

import { env } from '../config/env';
import type { Knex } from "knex";

const knexConfig:Knex.Config = {
    client: "pg",
    connection : {
        host : env.db.host,
        port : env.db.port,
        user : env.db.username,
        password : env.db.password,
        database : env.db.name
    },
    pool : {
        max : env.db.poolMax
    },
    migrations : {
        directory : env.db.migrationDirectory,
        extension : env.db.migrationExtension
    },
    seeds : {
        directory : "./src/seeds",
        extension : "ts"
    }
}

export default knexConfig;
export { knexConfig };
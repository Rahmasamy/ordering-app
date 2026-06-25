import "reflect-metadata";
import { createApp } from "./app.js";
import http from "http";
import { env } from "./lib/config/env.config.js";
import { db } from "./lib/knex/knex.js";


const app = createApp()
const server = http.createServer(app)
server.listen(env.PORT,( ) => {
    console.log(`server is listening on port ${env.PORT}`)
})
async function gracefulShutdown() {
    server.close(async() => {
    console.log("server shuttdown")
      await db.destroy()
      process.exit(0);
    })
}
process.on("SIGINT",gracefulShutdown);
process.on("SIGTERM",gracefulShutdown);
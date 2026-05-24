import { Router } from "express";
import { PingDB } from "../../common/knex/knex.js";
export const healthRoutes = Router();
healthRoutes.get("/", async (req,res) => {
    try {
        await PingDB()
        res.status(200).json({
            status: "ok",
            message: "DB is up and running!"
        })
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message : "DB Down!"
        })
    }
})
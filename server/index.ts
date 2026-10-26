import express from "express";
import pool from "./db.js";
import authRouter from "./routes/auth.js";
import sessionMiddleware from "./session.js";
import transactionsRouter from "./routes/transactions.js";

const app = express();
const PORT = 3000;

app.use(express.json({limit: "10kb" }));
app.use(sessionMiddleware);
app.use("/api/auth", authRouter);
app.use("/api/transactions", transactionsRouter);

app.get("/api/health", function(request, response) {
    response.json({
        message: "MoneyMap server is running"
    });
});

app.get("/api/health/db", async function(request, response){
    try{
        const result = await pool.query(
            "SELECT current_database() AS database"
        );
        response.json({
            database: result.rows[0].database
        });
    } catch(error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error("Database connection failed:", errorMessage);

        response.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.listen(PORT, "127.0.0.1", function() {
    console.log(`MoneyMap server: http://127.0.0.1:${PORT}`);
});
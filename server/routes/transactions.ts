import express from "express";
import pool from "../db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

type Transaction = {
    id: number;
    date: string;
    description: string;
    category: string;
    type: "income" | "expense";
    amountCents: number;
};

router.use(requireAuth);

router.get("/", async function(request, response) {
    try{
        const result = await pool.query<Transaction>(
             `SELECT
                id,
                to_char(transaction_date, 'YYYY-MM-DD') AS date,
                description,
                category,
                type,
                amount_cents AS "amountCents"
             FROM public.transactions
             WHERE user_id = $1
             ORDER BY transaction_date DESC, id DESC`,
            [request.session.userId]
        );

        return response.status(200).json({
            transactions: result.rows
        });
    } catch(error){
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Loading transactions failed.", errorMessage);

        return response.status(500).json({
            message: "Could not load transactions."
        });
    }
});


type CreateTransactionBody = {
    date?: unknown;
    description?: unknown;
    category?: unknown;
    type?: unknown;
    amountCents?: unknown;
};

router.post("/", async function(request, response){
    const body: CreateTransactionBody = request.body ?? {};

    const { date, description, category, type, amountCents} = body;

    if(typeof date !== "string" || typeof description !== "string" || typeof category !== "string") {
        return response.status(400).json({
            message: "Date, description and category must be text."
        });
    }
    if(type !== "income" && type !== "expense"){
        return response.status(400).json({
            message: "Type must be income or expense."
        });
    }

    if (
        typeof amountCents !== "number" ||
        !Number.isInteger(amountCents) ||
        amountCents <= 0 ||
        amountCents > 2147483647
    ) {
        return response.status(400).json({
            message: "Amount must be a positive whole number of cents within the supported range."
        });
    }

    const cleanDescription = description.trim();
    const cleanCategory = category.trim();

    if (
        cleanDescription.length < 1 ||
        cleanDescription.length > 255 ||
        cleanCategory.length < 1 ||
        cleanCategory.length > 50
    ) {
        return response.status(400).json({
            message: "Description must have 1–255 characters and category 1–50."
        });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return response.status(400).json({
            message: "Date must use YYYY-MM-DD."
        });
    }

    try {
        const result = await pool.query<Transaction>(
            `INSERT INTO public.transactions
                (
                    user_id,
                    type,
                    amount_cents,
                    description,
                    category,
                    transaction_date
                )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING
                id,
                to_char(transaction_date, 'YYYY-MM-DD') AS date,
                description,
                category,
                type,
                amount_cents AS "amountCents"`,
            [
                request.session.userId,
                type,
                amountCents,
                cleanDescription,
                cleanCategory,
                date
            ]
        );

        return response.status(201).json({
            transaction: result.rows[0]
        });
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            (error.code === "22007" || error.code === "22008")
        ) {
            return response.status(400).json({
                message: "Enter a valid calendar date."
            });
        }

        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error("Creating transaction failed:", errorMessage);

        return response.status(500).json({
            message: "Could not create transaction."
        });
    }
});

export default router;
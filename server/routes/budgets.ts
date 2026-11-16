import express from "express";
import pool from "../db.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

type BudgetRow = {
    id: number;
    category: number;
    month: string;
    limitCents: number;
    spentCents: string;
};

router.use(requireAuth);

router.get("/", async function (request, response) {
    const month = request.query.month;

    if(
        typeof month !== "string" ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
        month.startsWith("0000")
    ) {
        return response.status(400).json({
            message: "Month must be YYYY-MM."
        });
    }

    try {
        const result = await pool.query<BudgetRow>(
            `SELECT
                b.id,
                b.category,
                to_char(b.budget_month, 'YYYY-MM') AS month,
                b.limit_cents AS "limitCents",
                COALESCE(SUM(t.amount_cents), 0)::text AS "spentCents"
             FROM public.budgets AS b
             LEFT JOIN public.transactions AS t
                ON t.user_id = b.user_id
                AND t.type = 'expense'
                AND lower(btrim(t.category)) = lower(btrim(b.category))
                AND t.transaction_date >= b.budget_month
                AND t.transaction_date <
                    b.budget_month + INTERVAL '1 month'
             WHERE b.user_id = $1
                AND b.budget_month = $2::date
             GROUP BY b.id
             ORDER BY b.category, b.id`,
            [request.session.userId, `${month}-01`]
        );

        const budgets = result.rows.map((row) => {
            const spentCents = Number(row.spentCents);

            if(!Number.isSafeInteger(spentCents)) {
                throw new Error("Budget spending exceeds the supported range.");
            }

            return{
                ...row,
                spentCents
            };
        });

        return response.status(200).json({
            budgets
        });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        console.error("Loading budgets failed", errorMessage);
        return response.status(500).json({
            message: "Could not load budgets."
        });
    }
});

type CreateBudgetBody = {
    category?: unknown;
    month?: unknown;
    limitCents?: unknown;
};

type CreateBudget = {
    id: number;
    category: string;
    month: string;
    limitCents: number;
};

router.post("/", async function(request, response) {
    const body: CreateBudgetBody = request.body ?? {};
    const {category, month, limitCents} = body;

    if(typeof category !== "string") {
        return response.status(400).json({
            message: "Category must be text."
        });
    }

    const cleanCategory = category.trim();

    if(cleanCategory.length < 1 || cleanCategory.length > 50) {
        return response.status(400).json({
            message: "Category must have 1-50 characters."
        });
    }
     if(typeof month !== "string" ||
        !/^\d{4}-(0[1-9]|1[0-2])$/.test(month) ||
        month.startsWith("0000")
    ) {
        return response.status(400).json({
            message: "Month must be YYYY-MM."
        });
    }

    if(typeof limitCents !== "number" ||
        !Number.isInteger(limitCents) ||
        limitCents <= 0 ||
        limitCents > 2147483647
    ) {
        return response.status(400).json({
            message: "Budget limit must be a positive whole number of cents within the supported range."
        });
    } 
    try {
        const result = await pool.query<CreateBudget>(
            `INSERT INTO public.budgets (
                user_id,
                category,
                budget_month,
                limit_cents
             )
             VALUES ($1, $2, $3, $4)
             RETURNING
                id,
                category,
                to_char(budget_month, 'YYYY-MM') AS month,
                limit_cents AS "limitCents"`,
                [
                    request.session.userId,
                    cleanCategory,
                    `${month}-01`,
                    limitCents
                ]
        );
        return response.status(201).json({
            budget: result.rows[0]
        });
    } catch(error) {
        if(error instanceof Error && "code" in error && error.code === "23505") {
            return response.status(409).json({
                message: "A budget for this category and month already exists."
            });
        }

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Creating budget failed:", errorMessage);

        return response.status(500).json({
            message: "Could not create budget."
        });
    }
});

router.delete("/:id", async function(request,response) {
    const rawId = request.params.id;

    if(typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
        return response.status(400).json({
            message: "Invalid budget ID."
        });
    }

    const budgetId = Number(rawId);

    if(!Number.isSafeInteger(budgetId) || budgetId > 2147483647){
        return response.status(400).json({
            message: "Invalid budget ID."
        });
    }

    try{
        const result = await pool.query(
            `DELETE FROM public.budgets
            WHERE id = $1 AND user_id  = $2`,
            [budgetId, request.session.userId]
        );

        if(result.rowCount === 0){
            return response.status(404).json({
                message: "Budget not found."
            });
        }

        return response.status(204).send();
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error.";
        console.error("Deleting budget failed:", errorMessage);

        return response.status(500).json({
            message: "Could not delete budget."
        });
    }
});

type UpdateBudgetBody = {
    limitCents?: unknown;
};

router.patch("/:id", async function (request, response) {
    const rawId = request.params.id;

    if(typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
        return response.status(400).json({
            message: "Invalid budget ID."
        });
    }

    const budgetId = Number(rawId);

    if(!Number.isSafeInteger(budgetId) || budgetId > 2147483647) {
        return response.status(400).json({
            message: "Invalid budget ID."
        });
    } 

    const body: UpdateBudgetBody = request.body ?? {};
    const {limitCents} = body;

    if(typeof limitCents !== "number" || !Number.isInteger(limitCents) || limitCents <=0 || limitCents > 2147483647) {
        return response.status(400).json({
            message: "Budget limit must be a positive whole number of cents within the supported range."
        });
    }

    try{
        const result = await pool.query<CreateBudget>(
            `UPDATE public.budgets
            SET limit_cents = $1
            WHERE id = $2 AND user_id = $3
            RETURNING
                id,
                category,
                to_char(budget_month, 'YYYY-MM') AS month,
                limit_cents AS "limitCents"`,
            [
                limitCents,
                budgetId,
                request.session.userId
            ]
        );

        if(result.rowCount === 0) {
            return response.status(404).json({
                message: "Budget not found."
            });
        }
        return response.status(200).json({
            budget: result.rows[0]
        });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error.";
        console.error("Updating budget failed:", errorMessage);

        return response.status(500).json({
            message: "Could not update budget."
        });
    }
});

export default router;
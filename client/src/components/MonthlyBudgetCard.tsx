import {useEffect, useState} from "react";
import {Link, useNavigate, useOutletContext} from "react-router-dom";
import {ArrowRight, Wallet} from "lucide-react";

import type {
    Budget,
    BudgetsResponse
} from "../types/budgets-type";

import {
    formatMoney,
    formatMonthLabel
} from "../utils/dashboard";

type MonthlyBudgetCardProps = {
    month: string;
};

function MonthlyBudgetCard({month}: MonthlyBudgetCardProps) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const {transactionsVersion} = useOutletContext<{
        transactionsVersion: number
    }>();

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadBudgets() {
            setIsLoading(true);
            setError("");

            try{
                const response = await fetch(
                    `/api/budgets?month=${encodeURIComponent(month)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if(controller.signal.aborted) {
                    return;
                }

                if(response.status === 401){
                    navigate("/login", {replace: true});
                    return;
                }

                if(!response.ok){
                    throw new Error("Could not load budgets.");
                }

                const data: BudgetsResponse = await response.json();

                if(!controller.signal.aborted) {
                    setBudgets(data.budgets);
                }
            } catch{
                if(!controller.signal.aborted) {
                    setError("Could not load your budget.");
                }
            } finally {
                if(!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        } 
        loadBudgets();

        return () => {
            controller.abort();
        };
    }, [month, navigate, refreshKey, transactionsVersion]);

    const totalLimitCents = budgets.reduce(
        (total, budget) => total + budget.limitCents,
        0
    );

    const totalSpentCents = budgets.reduce(
        (total, budget) => total + budget.spentCents,
        0
    );

    const remainingCents = totalLimitCents - totalSpentCents;
    const isOverBudget = remainingCents < 0;

    const percentage = totalLimitCents > 0 ? Math.round((totalSpentCents / totalLimitCents) * 100) : 0;

    return(
        <section
            aria-labelledby="dashboard-budget-title"
            className="
                min-w-0 rounded-2xl border border-solid
                border-[#dce3e8] bg-white p-5 shadow-sm"
        > 
            <h2
                id="dashboard-budget-title"
                className="
                    m-0 flex items-center gap-3
                    text-lg font-bold text-[#17324d]"
            >
                <Wallet
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-[#16734b]"
                />
                Monthly budget
            </h2>

            <p className="mb-0 mt-2 text-sm text-[#607286]">
                {formatMonthLabel(month)}
            </p>

            {isLoading && (
                <p role="status" className="mb-0 mt-5 text-sm">Loading budget...</p>
            )}

            {error && (
                <div className="mt-5">
                    <p className="m-0 text-sm text-red-700" role="alert">{error}</p>

                    <button
                        type="button"
                        onClick={() => 
                            setRefreshKey((current) => current + 1)
                        }
                        className="
                            mt-3 cursor-pointer rounded-lg border-0
                            bg-[#0f4d3c] px-3 py-2
                            text-sm text-white [font-family:inherit]
                            hover:bg-[#16734b]
                            focus-visible:outline-2
                            focus-visible:outline-offset-2
                            focus-visible:outline-[#0f4d3c]"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && !error && budgets.length === 0 && (
                <p className="mb-0 mt-5 text-sm text-[#607286]">No budgets set for this month.</p>
            )}

            {!isLoading && !error && budgets.length > 0 && (
                <div className="mt-5">
                    <p
                        className="
                            m-0 text-[#17324d] tabular-nums
                            [overflow-wrap:anywhere]"
                    >
                        <span className="text-xl font-bold">{formatMoney(totalSpentCents)}</span>
                        {" of "}
                        {formatMoney(totalLimitCents)}
                        {" used "}
                    </p>

                    <progress
                        max={totalLimitCents}
                        value={Math.min(totalSpentCents, totalLimitCents)}
                        aria-label="Monthly budget usage"
                        className={`mt-4 block h-3 w-full ${
                            isOverBudget
                            ? "accent-red-600"
                            : "accent-emerald-700"
                        }`}
                    />

                    <div 
                        className="
                            mt-3 flex flex-wrap justify-between
                            gap-2 text-sm tabular-nums"
                    >
                        <p
                            className={`m-0 ${
                                isOverBudget
                                ? "text-red-700"
                                : "text-[#607286]"
                            }`}
                        >
                            {isOverBudget
                                ? "Over budget by "
                                : "Remaining "}
                            {formatMoney(Math.abs(remainingCents))}
                        </p>

                        <p 
                            className={`m-0 font-semibold ${
                                isOverBudget
                                ? "text-red-700"
                                : "text-[#16734b]"
                            }`}
                        >
                            {percentage}%used
                        </p>
                    </div>
                    
                    <p className="mb-0 mt-3 text-xs text-[#607286]">Accross categories with a budget.</p>
                </div>
            )}

            <Link
                to="/budgets"
                className="
                    mt-5 inline-flex items-center gap-2
                    text-sm font-semibold text-[#0f4d3c]
                    no-underline hover:underline"
            >
                View budgets
                <ArrowRight aria-hidden="true" className="h-4 w-4"/>
            </Link>
        </section>
    );
}

export default MonthlyBudgetCard;
import {useEffect, useState} from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Wallet} from "lucide-react";
import AddBudgetForm from "../components/AddBudgetForm";
import DeleteBudgetButton from "../components/DeleteBudgetButton";
import EditBudgetButton from "../components/EditBudgetButton";
import BudgetProgress from "../components/BudgetProgress";

import type {
    Budget,
    BudgetsResponse
} from "../types/budgets-type";

function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const today = new Date();

        return `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, "0")}`;
    });

    const {transactionsVersion} = useOutletContext<{
        transactionsVersion: number;
    }>();

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadBudgets() {
            setIsLoading(true);
            setError("");

            try{
                const response = await fetch(`/api/budgets?month=${encodeURIComponent(selectedMonth)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if(controller.signal.aborted){
                    return;
                }

                if(response.status === 401) {
                    navigate("/login", {replace: true});
                    return;
                }

                if(!response.ok) {
                    throw new Error("Could not load budgets.");
                }

                const data: BudgetsResponse = await response.json();

                if(!controller.signal.aborted) {
                    setBudgets(data.budgets);
                }
            } catch {
                if(!controller.signal.aborted) {
                    setError("Could not load budgets. Please try again.");
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
    }, [navigate, selectedMonth, refreshKey, transactionsVersion]);

    return(
        <section className="mx-auto w-full max-w-[1480px]">
            <div
                className="
                    mb-6 flex flex-wrap items-end
                    justify-between gap-4"
                >
                    <div>
                        <h1 className="m-0 text-3xl font-bold text-[#17324d]">Budgets</h1>

                        <p className="mb-0 mt-2 text-[#607286]">
                            Plan your monthly spending and track your progress
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="budgets-month"
                            className="text-sm font-semibold text-[#17324d]">Budget month</label>

                            <input
                                id="budgets-month"
                                type="month"
                                min="0001-01"
                                max="9999-12"
                                value={selectedMonth}
                                onChange={(event) => {
                                    if(event.target.value && event.target.validity.valid) {
                                        setSelectedMonth(event.target.value);
                                    }
                                }}
                                className="
                                    rounded-lg border border-solid
                                    border-[#dce3e8] bg-white px-4 py-3
                                    text-sm text-[#17324d]
                                    [font-family:inherit]
                                    focus-visible:outline-2
                                    focus-visible:outline-[#0f4d3c]
                                    "
                            />
                    </div>
                </div>

                <AddBudgetForm
                    month={selectedMonth}
                    onSaved={(savedMonth: string) => {
                        setSelectedMonth(savedMonth);
                        setRefreshKey((current) => current + 1);
                    }}
                />

                {isLoading && (
                    <p role="status">Loading budgets...</p>
                )}

                {error && (
                    <div
                        className="
                            rounded-2xl border border-solid
                            border-[#dce3e8]
                            bg-white p-6"
                        >
                            <p className="m-0 text-red-700" role="alert">{error}</p>

                            <button
                                type="button"
                                onClick={() => setRefreshKey((current) => current + 1)}
                                className="
                                    mt-4 cursor-pointer rounded-lg border-0
                                    bg-[#0f4d3c] px-4 py-2 text-white
                                    [font-family:inherit]
                                    focus-visible:outline-2
                                    focus-visible:outline-offset-2
                                    focus-visible:outline-[#0f4d3c]"
                                >
                                        Try again
                                </button>
                        </div>
                )}

                {!isLoading && !error && (budgets.length === 0 ? (
                    <div
                        className="
                            rounded-2xl border border-solid
                            border-[#dce3e8] bg-white p-6"
                        >
                            <p
                                className="m-0 text-[#607286]"
                                role="status">
                                    No budgets for this month.
                                </p>
                        </div>
                ): (
                    <div
                        className="
                            grid min-w-0 gap-5
                            md:grid-cols-2 xl:grid-cols-3"
                    >
                        {budgets.map((budget) => {
                            

                            return(
                                <article
                                    key={budget.id}
                                    aria-labelledby={`budget-title-${budget.id}`}
                                    className="
                                        min-w-0 rounded-2xl
                                        border border-solid border-[#dce3e8]
                                        bg-white p-6 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className="
                                                    flex h-11 w-11 shrink-0
                                                    items-center justify-center
                                                    rounded-full bg-emerald-50
                                                    text-[#16734b]"
                                            >
                                                <Wallet
                                                    aria-hidden="true"
                                                    className="h-5 w-5"/>
                                            </span>

                                            <h2
                                                id={`budget-title-${budget.id}`}
                                                className="
                                                    m-0 min-w-0 text-lg
                                                    font-bold capitalize
                                                    text-[#17324d]
                                                    [overflow-wrap:anywhere]"
                                                >
                                                    {budget.category}
                                                </h2>
                                        </div>

                                        <BudgetProgress
                                            limitCents={budget.limitCents}
                                            spentCents={budget.spentCents}
                                            label={`${budget.category} budget usage`}
                                            className="mt-6"
                                        />

                     

                                            <div className="mt-5 flex flex-wrap items-end justify-end gap-2">
                                                <EditBudgetButton
                                                    budgetId={budget.id}
                                                    category={budget.category}
                                                    limitCents={budget.limitCents}
                                                    onSaved={() =>
                                                        setRefreshKey((current) => current + 1)
                                                }/>

                                                <DeleteBudgetButton
                                                    budgetId={budget.id}
                                                    category={budget.category}
                                                    onDeleted={() =>
                                                        setRefreshKey((current) => current + 1)
                                                    }
                                                />
                                            </div>
                                    </article>
                            );
                        })}
                    </div>
                ))}
        </section>
    );
}

export default BudgetsPage;
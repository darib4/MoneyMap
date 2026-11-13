import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowDown,
    ArrowUp,
    ArrowDownLeft,
    ArrowUpRight,
    ArrowRight,
    Target,
    Wallet
} from "lucide-react";

import DashboardMetricCard from "../components/DashboardMetricCard";

import type {
    Transaction,
    TransactionsResponse
} from "../types/transaction-types";

import {
    buildCashFlow,
    formatMoney,
    formatMonthLabel,
    formatTransactionDate,
    getAvailableMonths,
    getMonthKey,
    sumByType
} from "../utils/dashboard";

const IncomeExpenseChart = lazy(
    () => import("../components/IncomeExpenseChart")
);

function DashboardPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const currentMonth = getMonthKey(new Date());

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [chartMonths, setChartMonths] = useState<3 | 6 | 12>(6);

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadDashboard() {
            setIsLoading(true);
            setError("");

            try {
                const response = await fetch("/api/transactions", {
                    credentials: "include",
                    signal: controller.signal
                });

                if (controller.signal.aborted) {
                    return;
                }

                if (response.status === 401) {
                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error("Could not load dashboard.");
                }

                const data: TransactionsResponse = await response.json();

                if (!controller.signal.aborted) {
                    setTransactions(data.transactions);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setError(
                        "Could not load your dashboard. Please try again."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadDashboard();

        return () => {
            controller.abort();
        };
    }, [navigate, refreshKey]);

    const availableMonths = getAvailableMonths(
        transactions,
        currentMonth,
        selectedMonth
    );

    const visibleTransactions =
        selectedMonth === "all"
            ? transactions
            : transactions.filter(
                (transaction) =>
                    transaction.date.slice(0, 7) === selectedMonth
            );

    const totalIncomeCents = sumByType(
        visibleTransactions,
        "income"
    );

    const totalExpenseCents = sumByType(
        visibleTransactions,
        "expense"
    );

    const balanceCents = totalIncomeCents - totalExpenseCents;

    const recentTransactions = visibleTransactions.slice(0, 5);

    const chartEndMonth =
        selectedMonth === "all" ? currentMonth : selectedMonth;

    const chartData = buildCashFlow(
        transactions,
        chartEndMonth,
        chartMonths
    );

    const periodLabel =
        selectedMonth === "all"
            ? "All time"
            : formatMonthLabel(selectedMonth);

    if (isLoading) {
        return <p role="status">Loading your dashboard…</p>;
    }

    if (error) {
        return (
            <section
                className="
                    rounded-2xl border border-solid
                    border-[#dce3e8] bg-white p-6
                "
            >
                <p className="m-0 text-red-700" role="alert">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() =>
                        setRefreshKey((current) => current + 1)
                    }
                    className="
                        mt-4 cursor-pointer rounded-lg border-0
                        bg-[#0f4d3c] px-4 py-2 text-white
                        hover:bg-[#0b3a2e]
                    "
                >
                    Try again
                </button>
            </section>
        );
    }

    return (
        <section className="mx-auto w-full max-w-[1480px]">
            <div
                className="
                    mb-6 flex flex-wrap items-center
                    justify-between gap-4
                "
            >
                <h1 className="m-0 text-3xl font-bold text-[#17324d]">
                    Dashboard
                </h1>

                <div className="flex items-center gap-3">
                    <label
                        htmlFor="dashboard-month"
                        className="sr-only"
                    >
                        Dashboard period
                    </label>

                    <select
                        id="dashboard-month"
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(event.target.value)
                        }
                        className="
                            cursor-pointer rounded-lg
                            border border-solid border-[#dce3e8]
                            bg-white px-4 py-3 text-sm text-[#17324d]
                            focus-visible:outline-2
                            focus-visible:outline-[#0f4d3c]
                        "
                    >
                        <option value="all">All time</option>

                        {availableMonths.map((month) => (
                            <option key={month} value={month}>
                                {month === currentMonth
                                    ? "This month"
                                    : formatMonthLabel(month)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className="
                    grid min-w-0 items-start gap-6
                    xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]
                "
            >
                <div className="grid min-w-0 gap-6">
                    <div
                        className="
                            grid min-w-0 gap-4
                            md:grid-cols-2 xl:grid-cols-3
                        "
                    >
                        <DashboardMetricCard
                            title="Total income"
                            value={formatMoney(totalIncomeCents)}
                            icon={ArrowDown}
                            tone="income"
                        />

                        <DashboardMetricCard
                            title="Total expenses"
                            value={formatMoney(totalExpenseCents)}
                            icon={ArrowUp}
                            tone="expense"
                        />

                        <DashboardMetricCard
                            title="Net balance"
                            value={formatMoney(balanceCents)}
                            icon={Wallet}
                            tone="balance"
                        />
                    </div>

                    <section
                        aria-labelledby="cash-flow-title"
                        className="
                            min-w-0 rounded-2xl border border-solid
                            border-[#dce3e8] bg-white p-5 shadow-sm
                        "
                    >
                        <div
                            className="
                                mb-5 flex flex-wrap items-center
                                justify-between gap-3
                            "
                        >
                            <h2
                                id="cash-flow-title"
                                className="
                                    m-0 text-xl font-bold text-[#17324d]
                                "
                            >
                                Income vs Expenses
                            </h2>

                            <label
                                htmlFor="chart-range"
                                className="sr-only"
                            >
                                Chart period
                            </label>

                            <select
                                id="chart-range"
                                value={chartMonths}
                                onChange={(event) => {
                                    const value = Number(event.target.value);

                                    if (
                                        value === 3 ||
                                        value === 6 ||
                                        value === 12
                                    ) {
                                        setChartMonths(value);
                                    }
                                }}
                                className="
                                    cursor-pointer rounded-lg
                                    border border-solid border-[#dce3e8]
                                    bg-white px-3 py-2
                                    text-sm text-[#17324d]
                                    focus-visible:outline-2
                                    focus-visible:outline-[#0f4d3c]
                                "
                            >
                                <option value={3}>Last 3 months</option>
                                <option value={6}>Last 6 months</option>
                                <option value={12}>Last 12 months</option>
                            </select>
                        </div>

                        <Suspense
                            fallback={
                                <p
                                    role="status"
                                    className="
                                        m-0 flex h-72 items-center
                                        justify-center text-[#607286]
                                    "
                                >
                                    Loading chart…
                                </p>
                            }
                        >
                            <IncomeExpenseChart data={chartData} />
                        </Suspense>
                    </section>

                    <div className="grid gap-4 md:grid-cols-2">
                        <section
                            className="
                                rounded-2xl border border-solid
                                border-[#dce3e8] bg-white p-5 shadow-sm
                            "
                        >
                            <h2
                                className="
                                    m-0 flex items-center gap-3
                                    text-lg font-bold text-[#17324d]
                                "
                            >
                                <Wallet
                                    aria-hidden="true"
                                    className="h-5 w-5 text-[#16734b]"
                                />
                                Monthly budget
                            </h2>

                            <p
                                className="
                                    mb-2 mt-5 font-semibold text-[#243b53]
                                "
                            >
                                No monthly budget set.
                            </p>

                            <p
                                className="
                                    m-0 text-sm leading-relaxed
                                    text-[#607286]
                                "
                            >
                                Plan your spending by category.
                            </p>

                            <Link
                                to="/budgets"
                                className="
                                    mt-5 inline-flex items-center gap-2
                                    text-sm font-semibold text-[#0f4d3c]
                                    no-underline hover:underline
                                "
                            >
                                View budgets
                                <ArrowRight
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                            </Link>
                        </section>

                        <section
                            className="
                                rounded-2xl border border-solid
                                border-[#dce3e8] bg-white p-5 shadow-sm
                            "
                        >
                            <h2
                                className="
                                    m-0 flex items-center gap-3
                                    text-lg font-bold text-[#17324d]
                                "
                            >
                                <Target
                                    aria-hidden="true"
                                    className="h-5 w-5 text-[#16734b]"
                                />
                                Savings goal
                            </h2>

                            <p
                                className="
                                    mb-2 mt-5 font-semibold text-[#243b53]
                                "
                            >
                                No savings goal set.
                            </p>

                            <p
                                className="
                                    m-0 text-sm leading-relaxed
                                    text-[#607286]
                                "
                            >
                                Give your next purchase a savings target.
                            </p>

                            <Link
                                to="/goals"
                                className="
                                    mt-5 inline-flex items-center gap-2
                                    text-sm font-semibold text-[#0f4d3c]
                                    no-underline hover:underline
                                "
                            >
                                View goals
                                <ArrowRight
                                    aria-hidden="true"
                                    className="h-4 w-4"
                                />
                            </Link>
                        </section>
                    </div>
                </div>

                <aside
                    className="grid min-w-0 gap-6"
                    aria-label="Balance and recent transactions"
                >
                    <section
                        className="
                            relative overflow-hidden rounded-2xl
                            bg-linear-to-br
                            from-[#0f4d3c] via-[#158359] to-[#349e6f]
                            p-6 text-white shadow-sm
                        "
                    >
                        <div
                            className="
                                relative z-10 flex flex-wrap
                                items-center justify-between gap-3
                            "
                        >
                            <h2 className="m-0 text-lg font-semibold">
                                Balance overview
                            </h2>

                            <span
                                className="
                                    inline-flex items-center gap-2
                                    text-sm font-semibold
                                "
                            >
                                <img
                                    src="/assets/logo.png"
                                    alt=""
                                    className="h-6 w-6 object-contain"
                                />
                                MoneyMap
                            </span>
                        </div>

                        <p
                            className="
                                relative z-10 mb-2 mt-6
                                text-4xl font-bold tabular-nums
                                [overflow-wrap:anywhere]
                            "
                        >
                            {formatMoney(balanceCents)}
                        </p>

                        <p
                            className="
                                relative z-10 m-0 text-sm text-white/90
                            "
                        >
                            Income − expenses
                        </p>

                        <p
                            className="
                                relative z-10 mb-8 mt-2
                                text-xs text-white/80
                            "
                        >
                            {periodLabel}
                        </p>

                        <svg
                            aria-hidden="true"
                            viewBox="0 0 400 100"
                            preserveAspectRatio="none"
                            className="
                                absolute inset-x-0 bottom-0 h-24 w-full
                            "
                        >
                            <path
                                d="M0 55C80 0 150 100 240 45S350 10 400 25V100H0Z"
                                fill="white"
                                opacity="0.12"
                            />
                            <path
                                d="M0 80C90 35 150 100 260 65S350 45 400 60V100H0Z"
                                fill="white"
                                opacity="0.09"
                            />
                        </svg>
                    </section>

                    <section
                        aria-labelledby="recent-transactions-title"
                        className="
                            overflow-hidden rounded-2xl
                            border border-solid border-[#dce3e8]
                            bg-white shadow-sm
                        "
                    >
                        <div
                            className="
                                flex flex-wrap items-center
                                justify-between gap-3 p-5
                            "
                        >
                            <h2
                                id="recent-transactions-title"
                                className="
                                    m-0 text-xl font-bold text-[#17324d]
                                "
                            >
                                Recent transactions
                            </h2>

                            <Link
                                to="/transactions"
                                className="
                                    text-sm font-semibold text-[#0f4d3c]
                                    no-underline hover:underline
                                "
                            >
                                View all
                            </Link>
                        </div>

                        {recentTransactions.length === 0 ? (
                            <p
                                className="
                                    m-0 px-5 pb-5 text-sm
                                    leading-relaxed text-[#607286]
                                "
                            >
                                No transactions for this period.
                            </p>
                        ) : (
                            <ul className="m-0 list-none px-5 pb-2 pt-0">
                                {recentTransactions.map((transaction) => {
                                    const isIncome =
                                        transaction.type === "income";

                                    const Icon = isIncome
                                        ? ArrowDownLeft
                                        : ArrowUpRight;

                                    return (
                                        <li
                                            key={transaction.id}
                                            className="
                                                flex min-w-0 items-center gap-3
                                                border-0 border-b border-solid
                                                border-[#e5e7eb] py-4
                                                last:border-b-0
                                            "
                                        >
                                            <span
                                                className={`
                                                    flex h-10 w-10 shrink-0
                                                    items-center justify-center
                                                    rounded-full
                                                    ${
                                                        isIncome
                                                            ? "bg-emerald-100 text-emerald-700"
                                                            : "bg-red-100 text-red-700"
                                                    }
                                                `}
                                            >
                                                <Icon
                                                    aria-hidden="true"
                                                    className="h-5 w-5"
                                                />
                                            </span>

                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="
                                                        m-0 text-sm font-semibold
                                                        text-[#243b53]
                                                        [overflow-wrap:anywhere]
                                                    "
                                                >
                                                    {transaction.description}
                                                </p>

                                                <p
                                                    className="
                                                        mb-0 mt-1
                                                        text-xs text-[#607286]
                                                    "
                                                >
                                                    {formatTransactionDate(
                                                        transaction.date
                                                    )}
                                                </p>
                                            </div>

                                            <p
                                                className={`
                                                    m-0 shrink-0 whitespace-nowrap
                                                    text-sm font-semibold
                                                    tabular-nums
                                                    ${
                                                        isIncome
                                                            ? "text-emerald-700"
                                                            : "text-red-700"
                                                    }
                                                `}
                                            >
                                                {isIncome ? "+" : "-"}
                                                {formatMoney(
                                                    transaction.amountCents
                                                )}
                                            </p>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default DashboardPage;
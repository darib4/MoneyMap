import {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import AddTransactionForm from "../components/AddTransactionForm";
import DeleteTransactionButton from "../components/DeleteTransactionButton";
import {Plus} from "lucide-react";
import SummaryCard  from "../components/SummaryCard";

type Transaction = {
    id: number;
    date: string;
    description: string;
    category: string;
    type: "income" | "expense";
    amountCents: number;
};

type TransactionsResponse = {
    transactions: Transaction[];
};

const currencyFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
});

function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [typeFilter, setTypeFilter] = useState("all");
    const addFormRef = useRef<HTMLDetailsElement>(null);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

    useEffect(() => {
        const controller = new AbortController();

        async function loadTransactions() {
            setIsLoading(true);
            setError("");

            try{
                const response = await fetch("/api/transactions", {
                    credentials: "include",
                    signal: controller.signal
                });

                if(response.status === 401) {
                    navigate("/login", {replace: true});
                    return;
                }

                if(!response.ok) {
                    throw new Error("Could not load transactions.");
                }

                const data:  TransactionsResponse = await response.json();

                if(!controller.signal.aborted) {
                    setTransactions(data.transactions);
                }
            } catch {
                if(!controller.signal.aborted) {
                    setError("Could not load transactions. Please refresh to try again.");
                }
            } finally {
                if(!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        loadTransactions();

        return () => {
            controller.abort();
        };
    }, [navigate, refreshKey]);

    const filteredTransactions = transactions.filter((transaction) => {
        const description = transaction.description.toLowerCase();
        const category = transaction.category.toLowerCase();

        const matchesSearch = description.includes(searchQuery) || category.includes(searchQuery);
        const matchesType = typeFilter === "all" || transaction.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const totalIncomeCents = transactions.reduce(
    (total, transaction) =>
        transaction.type === "income"
            ? total + transaction.amountCents
            : total,
    0
);

    const totalExpenseCents = transactions.reduce(
        (total, transaction) =>
            transaction.type === "expense"
                ? total + transaction.amountCents
                : total,
        0
    );

    const balanceCents = totalIncomeCents - totalExpenseCents;

    return (
        <section className="transactions-page">
            <h1>Transactions</h1>
            <p>Track and manage all your income and expenses.</p>

            <div className="my-5 flex flex-wrap items-center gap-3">
                <label
                    htmlFor="transaction-type-filter"
                    className="text-sm font-semibold text-[#17324d]"
                >
                    Transaction type
                </label>

                <select
                    id="transaction-type-filter"
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="
                        cursor-pointer rounded-lg
                        border border-solid border-[#d1d5db]
                        bg-white px-4 py-3
                        text-sm text-[#17324d]
                        focus-visible:outline-2
                        focus-visible:outline-[#0f4d3c]
                        "
                    >
                        <option value="all">All types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                </select>
            </div>

            {!isLoading && !error && (
                <dl className="
                    my-7 grid grid-cols-1 gap-3
                    min-[601px]:grid-cols-2
                    min-[601px]:gap-5
                    min-[1001px]:grid-cols-4
                    ">
                    
                    <SummaryCard
                        label="Total transactions"
                        value={transactions.length}
                    />

                    <SummaryCard
                        label="Total income"
                        value={currencyFormatter.format(totalIncomeCents / 100)}
                        tone="income"
                    />

                    <SummaryCard
                        label="Total expenses"
                        value={currencyFormatter.format(totalExpenseCents / 100)}
                        tone="expense"
                    />

                    <SummaryCard
                        label="Net balance"
                        value={currencyFormatter.format(balanceCents / 100)}
                    />
                </dl>
            )}
            <details ref={addFormRef} className="group mt-6">
                <summary 
                    className="
                        inline-flex cursor-pointer list-none items-center gap-2
                        bg-[#0f4d3c] px-4 py-3
                        text-sm font-semibold text-white
                        transition-colors hover:bg-[#0b3a2e]
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-[#0f4d3c]
                        [&::-webkit-details-marker]:hidden
                        "   
                >
                    <Plus
                        aria-hidden="true"
                        className="h-4 w-4 transition-transform group-open:rotate-45"
                    />

                    <span className="group-open:hidden">Add transaction</span>
                    <span className="hidden group-open:inline">Close form</span>
                </summary>

                <AddTransactionForm
                    onSaved={() => {
                        setRefreshKey((current) => current + 1);

                        if(addFormRef.current) {
                            addFormRef.current.open = false;
                            addFormRef.current.querySelector("summary")?.focus();
                        }
                    }}
                />
            </details>

            {isLoading && (
                <p role="status">Loading transactions...</p>)}

            {error && (
                <p className="form-error" role="alert"> {error} </p>
            )}

            {!isLoading && !error && (
                filteredTransactions.length === 0 ? (
                    <p role="status">
                        {transactions.length === 0 ? "No transactions yet.": "No matching transactions."}
                    </p>
                ) : (
                    <div
                        className="
                            mt-6 overflow-x-auto rounded-xl
                            border border-solid border-[#dce3e8]
                            bg-white
                        "
                    >
                        <table className="w-full min-w-[760px] border-collapse text-sm text-[#243b53]">
                            <caption className="p-5 text-left text-xl font-bold text-[#17324d]">
                                {searchQuery ? "Search results" : "All transactions"}
                            </caption>

                            <thead>
                                <tr
                                    className="
                                        border-0 border-b border-solid border-[#e5e7eb]
                                        bg-[#f3f6f5] text-[#607286]
                                    "
                                >
                                    <th scope="col" className="p-4 text-left font-semibold">
                                        Date
                                    </th>
                                    <th scope="col" className="p-4 text-left font-semibold">
                                        Description
                                    </th>
                                    <th scope="col" className="p-4 text-left font-semibold">
                                        Category
                                    </th>
                                    <th scope="col" className="p-4 text-left font-semibold">
                                        Type
                                    </th>
                                    <th scope="col" className="p-4 text-right font-semibold">
                                        Amount
                                    </th>
                                    <th scope="col" className="p-4 text-right font-semibold">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr
                                        key={transaction.id}
                                        className="
                                            border-0 border-b border-solid border-[#e5e7eb]
                                            transition-colors
                                            last:border-b-0 hover:bg-[#f5faf7]
                                        "
                                    >
                                        <td className="whitespace-nowrap p-4">
                                            {transaction.date}
                                        </td>

                                        <td className="p-4 [overflow-wrap:anywhere]">
                                            {transaction.description}
                                        </td>

                                        <td className="p-4">
                                            {transaction.category}
                                        </td>

                                        <td className="p-4">
                                            <span
                                                className={`
                                                    inline-flex rounded-full px-3 py-1
                                                    text-xs font-semibold
                                                    ${
                                                        transaction.type === "income"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-red-100 text-red-800"
                                                    }
                                                `}
                                            >
                                                {transaction.type === "income"
                                                    ? "Income"
                                                    : "Expense"}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap p-4 text-right tabular-nums">
                                            <span
                                                className={
                                                    transaction.type === "income"
                                                        ? "font-semibold text-emerald-700"
                                                        : "font-semibold text-red-700"
                                                }
                                            >
                                                {transaction.type === "income" ? "+" : "-"}
                                                {currencyFormatter.format(
                                                    transaction.amountCents / 100
                                                )}
                                            </span>
                                        </td>

                                        <td className="p-4 text-right">
                                            <DeleteTransactionButton
                                                transactionId={transaction.id}
                                                description={transaction.description}
                                                onDeleted={() =>
                                                    setRefreshKey((current) => current + 1)
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </section>
    );
}

export default TransactionsPage;
import {useEffect, useRef, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import AddTransactionForm from "../components/AddTransactionForm";
import DeleteTransactionButton from "../components/DeleteTransactionButton";
import {Plus} from "lucide-react";

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
                <dl className="transaction-summary">
                    <div className="summary-card">
                        <dt>Total transactions</dt>
                        <dd>{transactions.length}</dd>
                    </div>

                    <div className="summary-card summary-card-income">
                        <dt>Total income</dt>
                        <dd>
                            {currencyFormatter.format(totalIncomeCents / 100)}
                        </dd>
                    </div>

                    <div className="summary-card summary-card-expense">
                        <dt>Total expenses</dt>
                        <dd>
                            {currencyFormatter.format(totalExpenseCents / 100)}
                        </dd>
                    </div>

                    <div className="summary-card">
                        <dt>Net balance</dt>
                        <dd>
                            {currencyFormatter.format(balanceCents / 100)}
                        </dd>
                    </div>
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
                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <caption>{searchQuery ? "Search results: " : "All transactions."}</caption>

                            <thead>
                                <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Amount</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td>{transaction.date}</td>
                                        <td>{transaction.description}</td>
                                        <td>{transaction.category}</td>
                                        <td>
                                            {transaction.type === "income" ? "Income" : "Expense"}
                                        </td>
                                        <td>
                                            {transaction.type === "income"
                                                ? "+"
                                                : "-"}
                                            {currencyFormatter.format(
                                                transaction.amountCents / 100
                                            )}
                                        </td>

                                        <td>
                                            <DeleteTransactionButton
                                                transactionId={transaction.id}
                                                description={transaction.description}
                                                onDeleted={() => setRefreshKey((current) => current + 1)}
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
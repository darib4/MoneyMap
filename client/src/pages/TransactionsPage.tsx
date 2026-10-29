import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import AddTransactionForm from "../components/AddTransactionForm";

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

    const navigate = useNavigate();

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
            <AddTransactionForm
                onSaved={() => setRefreshKey((current) => current + 1)}
            />

            {isLoading && (
                <p role="status">Loading transactions...</p>)}

            {error && (
                <p className="form-error" role="alert"> {error} </p>
            )}

            {!isLoading && !error && (
                transactions.length === 0 ? (
                    <p>No transactions yet.</p>
                ) : (
                    <div className="transactions-table-wrapper">
                        <table className="transactions-table">
                            <caption>All transactions</caption>

                            <thead>
                                <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col">Description</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transactions.map((transaction) => (
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
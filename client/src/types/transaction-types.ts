export type Transaction = {
    id: number;
    date: string;
    description: string;
    category: string;
    type: "income" | "expense";
    amountCents: number;
};

export type TransactionsResponse = {
    transactions: Transaction[];
};
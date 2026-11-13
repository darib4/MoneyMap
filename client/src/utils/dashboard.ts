import type { Transaction } from "../types/transaction-types";

export type CashFlowPoint = {
    monthKey: string;
    monthLabel: string;
    income: number;
    expenses: number;
};

export const euroFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
});

export function formatMoney(cents: number): string {
    return euroFormatter.format(cents/100);
}

export function getMonthKey(date: Date): string {
    return  `${String(date.getFullYear()).padStart(4, "0")}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}`;
}

export function formatMonthLabel(monthKey: string): string {
    return new Date(`${monthKey}-01T12:00:00`).toLocaleDateString(
        "en-GB",
        {
            month: "long",
            year: "numeric"
        }
    );
}

export function formatTransactionDate(date: string): string {
    return new Date(`${date}T12:00:00`).toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short"
        }
    );
}

export function getAvailableMonths(
    transactions: Transaction[],
    currentMonth: string,
    selectedMonth = "all"
): string[] {
    const months = new Set([
        currentMonth,
        ...transactions.map((transaction) => transaction.date.slice(0, 7))
    ]);

    if(selectedMonth !== "all") {
        months.add(selectedMonth);
    }

    return [...months].sort().reverse();
}

export function sumByType(
    transactions: Transaction[],
    type: Transaction["type"]
): number {
    return transactions.reduce(
        (total, transaction) =>
            transaction.type === type ? total + transaction.amountCents : total, 0
    );
}

export function buildCashFlow(
    transactions: Transaction[],
    endMonth: string,
    months: 3 | 6 | 12
): CashFlowPoint[] {
    const totals = new Map<
        string, {
            income: number;
            expenses: number;
        }>();
    
        for(const transaction of transactions) {
            const key = transaction.date.slice(0, 7);
            const total = totals.get(key) ?? {
                income: 0,
                expenses: 0
            };

            if(transaction.type === "income") {
                total.income += transaction.amountCents;
            } else {
                total.expenses += transaction.amountCents;
            }

            totals.set(key, total);
        }

        return Array.from({length: months}, (_, index) => {
            const date = new Date(`${endMonth}-01T12:00:00`);

            date.setMonth(
                date.getMonth() - (months-1-index)
            );

            const monthKey = getMonthKey(date);
            const total = totals.get(monthKey);

            return {
                monthKey,
                monthLabel: date.toLocaleDateString("en-GB", {
                    month: "short"
                }),
                income: (total?.income ?? 0) / 100,
                expenses: (total?.expenses ?? 0) / 100,
            };
        });
}
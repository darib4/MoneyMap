export type Budget = {
    id:number;
    category: string;
    month: string;
    limitCents: number;
    spentCents: number;
};

export type BudgetsResponse = {
    budgets: Budget[];
};
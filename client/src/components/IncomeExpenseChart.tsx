import {useId} from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import { euroFormatter } from "../utils/dashboard";
import type { CashFlowPoint } from "../utils/dashboard";

type IncomeExpenseChartProps = {
    data: CashFlowPoint[];
};

const axisFormatter = new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    maximumFractionDigits: 2
});

function IncomeExpenseChart({
    data
}: IncomeExpenseChartProps) {
    const chartId = useId().replace(/:/g, "");

    const incomeGradient = `${chartId}-income`;
    const expenseGradient = `${chartId}-expense`;

    const hasTransactions = data.some(
        (point) =>
            point.income !== 0 ||
        point.expenses !== 0
    );

    if(!hasTransactions){
        return(
            <div
                className="
                    flex h-72 items-center justify-center
                    rounded-xl bg-[#f7f9f8]
                    p-6 text-center text-[#607286]"
                    >
                        <p className="m-0">No transactions in this chart period.</p>
                    </div>
        );
    }

    return(
        <div
            role="group"
            aria-label="Monthly income and expenses chart">

                <div className="mb-4 flex flex-wrap gap-5 text-sm text-[#243b53]">
                    <span className="inline-flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="h-3 w-3 rounded-full bg-[#16734b]"
                        />
                        Income
                    </span>

                    <span className="inline-flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="h-3 w-3 rounded-full bg-[#b42318]"
                        />
                        Expenses
                    </span>
                </div>

                <div className="h-72 min-w-0">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                        >
                            <AreaChart
                                data={data}
                                margin={{top:8, right: 12, bottom: 0, left: 0}}
                                accessibilityLayer
                            >
                                <defs>
                                    <linearGradient
                                        id={incomeGradient}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#16734b"
                                            stopOpacity={0.22}
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#16734b"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>

                                    <linearGradient
                                        id={expenseGradient}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="0%"
                                            stopColor="#b42318"
                                            stopOpacity={0.14}
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#b42318"
                                            stopOpacity={0.02}
                                        />
                                    </linearGradient>
                                </defs>

                                <CartesianGrid
                                    vertical={false}
                                    stroke="#e7ecef"
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="monthLabel"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fill: "#607286", fontSize: 12}}
                                    minTickGap={12}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    width={68}
                                    tick={{fill: "#607286", fontSize: 12}}
                                    tickFormatter={(value)=> axisFormatter.format(Number(value))}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        euroFormatter.format(
                                            Number(value ?? 0)
                                        )
                                    }
                                    contentStyle={{
                                        borderRadius: 12,
                                        border: "1px solid #dce3e8",
                                        color: "#17324d"
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Income"
                                    stroke="#16734b"
                                    strokeWidth={2.5}
                                    fill={`url(#${incomeGradient})`}
                                    isAnimationActive={false}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#b42318"
                                    strokeWidth={2.5}
                                    fill={`url(#${expenseGradient})`}
                                    isAnimationActive={false}
                                />

                            </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
    );
}

export default IncomeExpenseChart;
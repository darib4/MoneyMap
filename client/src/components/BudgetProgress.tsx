import {formatMoney} from "../utils/dashboard";

type BudgetProgressProps = {
    limitCents: number;
    spentCents: number;
    label?: string;
    className?: string;
};

function BudgetProgress({
    limitCents,
    spentCents,
    label = "Budget usage",
    className = ""
}: BudgetProgressProps) {
    if(limitCents <= 0) {
        return null;
    }

    const remainingCents = limitCents = spentCents;
    const percentage = Math.round((spentCents/limitCents) * 100);

    const isOverBudget = remainingCents < 0; 
    const barColors = isOverBudget
        ? "[&::-webkit-progress-value]:bg-red-600 [&::-moz-progress-bar]:bg-red-600"
        : "[&::-webkit-progress-value]:bg-emerald-700 [&::-moz-progress-bar]:bg-emerald-700";
    
    return(
        <div className={className}>
            <p
                className="
                    m-0 text-[#607286] tabular-nums
                    [overflow-wrap:anywhere]"
            >
                <span className="text-xl font-bold text-[#17324d]">
                    {formatMoney(spentCents)}
                </span>
                {" of "}
                {formatMoney(limitCents)}
                {" used "}
            </p>

            <progress
                max={limitCents}
                value={Math.min(Math.max(spentCents, 0), limitCents)}
                aria-label={label}
                aria-valuetext={`${percentage}% used`}
                className={`
                    mt-4 block h-3 w-full
                    appearance-none overflow-hidden
                    rounded-full border-0 bg-[#e5eee9]
                    [&::-webkit-progress-bar]:bg-[#e5eee9]
                    ${barColors}`}
            />

            <div
                className="
                    mt-3 flex flex-wrap justify-between
                    gap-2 text-sm tabular-nums"
            >
                <p
                    className={`m-0 ${
                        isOverBudget
                            ? "font-semibold text-red-700"
                            : "text-[#607286]"
                    }`}
                >
                    {isOverBudget
                        ? "Over budget by "
                        : "Remaining "}
                    {formatMoney(Math.abs(remainingCents))}
                </p>

                <p
                    className={`m-0 ${
                        isOverBudget
                            ? "text-red-700"
                            : "text-[#16734b]"
                    }`}
                >
                    {percentage}% used
                </p>
            </div>
        </div>
    );
}

export default BudgetProgress;
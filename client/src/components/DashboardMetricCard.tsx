import type {LucideIcon} from "lucide-react";

type DashboardMetricCardProps = {
    title: string;
    value: string;
    icon: LucideIcon;
    tone: "income" | "expense" | "balance";
};

const iconStyles = {
    income: "bg-emerald-100 text-emerald-700",
    expense: "bg-red-100 text-red-700",
    balance: "bg-[#e6f4ec] text-[#0f4d3c]"
};

function DashboardMetricCard({
    title,
    value,
    icon: Icon,
    tone
}: DashboardMetricCardProps) {
    return(
        <article
            className="
                flex min-w-0 items-center gap-3 rounded-2x1
                border border-solid border-[#dce3e8]
                bg-white p-4 shadow-sm"
        >
            <span
                className={`
                    flex h-10 w-10 shrink-0
                    items-center justify-center rounded-full
                    ${iconStyles[tone]}`}
            >
                <Icon
                    aria-hidden="true"
                    className="h-6 w-6"/>
            </span>

            <div className="min-w-0">
                <h2 className="m-0 text-sm font-normal text-[#607286]">{title}</h2>

                <p
                    className="
                        mb-0 mt-2 text-xl font-bold text-[#17324d]
                        tabular-nums [overflow-wrap:anywhere]
                        2xl:text-2xl">{value}
                </p>
            </div>
        </article>
    );
}

export default DashboardMetricCard;
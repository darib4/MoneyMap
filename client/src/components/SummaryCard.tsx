type SummaryCardProps = {
    label: string;
    value: string | number;
    tone?: "default" | "income" | "expense";
};

const toneClasses = {
    default: "text-[#17324d]",
    income: "text-[#16734b]",
    expense: "text-[#b42318]"
};

function SummaryCard({
    label,
    value,
    tone = "default"
}: SummaryCardProps) {
    return (
        <div className="
            min-w-0 rounded-2x1
            border border-solid border-[#dce3e8]
            bg-white p-6"
        >
            <dt className="mb-4 text-sm leading-normal text-[#607286]">{label}</dt>

            <dd
                className={`
                    m-0 text-[clamp(22px, 2vw, 30px)]
                    font-bold tabular-nums
                    [overflow-wrap:anywhere]
                    ${toneClasses[tone]}
                `}>{value}
            </dd>
        </div>
    );
}

export default SummaryCard;
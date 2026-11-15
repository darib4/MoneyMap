import {Plus} from "lucide-react";

type AddTransactionLinkProps = {
    onClick: () => void;
};

function AddTransactionLink({
    onClick
}: AddTransactionLinkProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
                inline-flex shrink-0 cursor-pointer
                items-center justify-center gap-2
                rounded-lg border-0
                bg-[#0f4d3c] px-4 py-3
                text-sm font-semibold text-white
                [font-family:inherit]
                transition-colors duration-200
                hover:bg-[#16734b]
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-[#0f4d3c]"
        >
            <Plus aria-hidden="true" className="h-5 w-5"/>
            <span>Add transaction</span>
        </button>
    );

}

export default AddTransactionLink;

import type { SubmitEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";

function TransactionSearch() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") ?? "";

    function handleSearch(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const search = String(formData.get("q") ?? "").trim();

        navigate(
            search ? `/transactions?q=${encodeURIComponent(search)}` : "/transactions"
        );
    }

    return (
        <form 
            key={query}
            role="search"
            aria-label="Search transactions"
            onSubmit={handleSearch}
            className="
                order-3 flex w-full min-w-0 items-center
                overflow-hidden rounded-lg
                border border-solid border-[dce3e8]
                bg-white
                focus-within:ring-2
                focus-within:ring-[#0f4d3c]/20
                min-[1100px]:order-none
                min-[1100px]:w-72
                "
            >

            <label htmlFor="transactions-search" className="sr-only">Search transactions by description or category</label>

            <input 
                id="transaction-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search transactions..."
                className="
                    min-w-0 flex-1 border-0
                    bg-transparent px-3 py-2
                    text-sm text-[#17324d] outline-none
                "
            />

            <button 
                type="submit"
                aria-label="Search"
                className="
                    flex shrink-0 cursor-pointer
                    items-center justify-center self-stretch
                    border-0 bg-transparent px-3 text-[#607286]
                    transition-colors
                    hover:bg-emerald-50 hover:text-[#0f4d3c]
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#0f4d3c]
                    "
                >
                    <Search aria-hidden="true" className="h-5 w-5"/>
            </button>

        </form>
    );
}

export default TransactionSearch;
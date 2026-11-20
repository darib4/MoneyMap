import {useState} from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {Pencil} from "lucide-react";
import {toast} from "react-toastify";
import {
    MONEY_INPUT_ERROR,
    parseMoneyToCents
} from "../utils/money";

import Button from "./ui/Button";

type EditBudgetButtonProps = {
    budgetId: number;
    category:string;
    limitCents: number;
    onSaved: () => void;
};

function EditBudgetButton({
    budgetId,
    category,
    limitCents,
    onSaved
} : EditBudgetButtonProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    function openEditor() {
        setAmount((limitCents/100).toFixed(2));
        setError("");
        setIsEditing(true);
    }

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if(isSubmitting) {
            return;
        }

        setError("");

        const updateLimitCents = parseMoneyToCents(amount);

        if(updateLimitCents === null){
            setError(MONEY_INPUT_ERROR);
            return;
        }

        setIsSubmitting(true);

        try{
            const response = await fetch(
                `/api/budgets/${budgetId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        limitCents: updateLimitCents
                    })
                }
            );

            if(response.status === 401){
                navigate("/login", {replace: true});
                return;
            }

            if(response.status === 404) {
                toast.info("This budget no longer exists.");
                setIsEditing(false);
                onSaved();
                return;
            }

            if(!response.ok){
                throw new Error("Could not update budget.");
            }

            setIsEditing(false);
            toast.success("Budget updated.");
            onSaved();
        } catch{
            setError("Could not update budget. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }
    if(!isEditing) {
        return(
            <Button
                variant="secondary"
                size="sm"
                onClick={openEditor}
                aria-label={`Edit ${category} budget limit.`}
            >
                <Pencil aria-hidden="true" className="h-4 w-4"/>
                Edit
            </Button>
        );
    }

    return(
        <form
            onSubmit={handleSubmit}
            aria-label={`Edit ${category} budget limit.`}
            className="min-w-0"
        >
            <fieldset
                disabled={isSubmitting}
                className="
                    m-0 flex min-w-0 flex-wrap
                    items-end gap-2 border-0 p-0"
            >
                <label
                    className="
                        flex flex-col gap-1
                        text-xs font-semibold text-[#17324d]"
                >
                    Monthly limit (€)   

                    <input
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={(event) => 
                            setAmount(event.target.value)
                        }
                        onFocus={(event) =>
                            event.currentTarget.select()
                        }
                        autoFocus
                        required
                        className="
                            w-32 min-w-0 rounded-lg
                            border border-solid border-[#d1d5db]
                            bg-white px-3 py-2
                            text-sm font-normal text-[#17324d]
                            [font-family:inherit]
                            focus-visible:outline-2
                            focus-visible:outline-[#0f4d3c]"
                    />
                </label>

                <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </fieldset>

            {error && (
                <p
                    className="mb-0 mt-2 max-w-xs text-sm text-red-700"
                    role="alert">
                        {error}
                </p>
            )}
        </form>
    );
} 

export default EditBudgetButton;
import {useState} from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-toastify";
import {
    MONEY_INPUT_ERROR,
    parseMoneyToCents
} from "../utils/money";

import Button from "./ui/Button";

type AddBudgetFormProps = {
    month: string;
    onSaved: (savedMonth: string) => void;
};

function AddBudgetForm({
    month,
    onSaved
} : AddBudgetFormProps) {
    const [error, setError] = useState("");
    const[isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(
        event: SubmitEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if(isSubmitting){
            return;
        }

        setError("");

        const form = event.currentTarget;
        const formData = new FormData(form);

        const category = String(formData.get("category") ?? "").trim();
        const amount = String(formData.get("amount") ?? "");

        if(category.length < 1 || category.length > 50){
            setError("Category must have 1-50 characters.");
            return;
        }

        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month.startsWith("0000")) {
            setError("Choose a valid budget month.");
            return;
        }

        const limitCents = parseMoneyToCents(amount);

        if(limitCents === null){
            setError(MONEY_INPUT_ERROR);
            return;
        }

        setIsSubmitting(true);

        try{
            const response = await fetch("/api/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }, 
                credentials: "include",
                body: JSON.stringify({
                    category,
                    month,
                    limitCents
                })
            });

            if(response.status === 401){
                navigate("/login", {replace: true});
                return;
            }

            if(response.status === 409) {
                setError("A budget for this category and month already exists.");
                return;
            }

            if(!response.ok) {
                throw new Error("Could not create budget.");
            }

            form.reset();
            toast.success("Budget crested.");
            onSaved(month);
        } catch {
            setError("Could not create budget. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <form
            onSubmit={handleSubmit}
            className="
                mb-6 rounded-2xl border border-solid
                border-[#dce3e8] bg-white p-6 shadow-sm"
            >
                <h2 className="m-0 text-xl font-bold text-[#17324d]">Add budget</h2>

                <p className="mb-5 mt-2 text-sm text-[#607286]">
                    Budget month: {month}. Choose the month above.
                </p>

                <fieldset
                    disabled={isSubmitting}
                    className="
                        m-0 grid min-w-0 grid-cols-1
                        items-end gap-4 border-0 p-0
                        md:grid-cols-2
                        xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                        <label
                            className="
                                flex min-w-0 flex-col gap-2
                                text-sm font-semibold text-[#17324d]"
                            >
                                Category
                                    <input
                                        name="category"
                                        type="text"
                                        maxLength={50}
                                        placeholder="e.g. groceries"
                                        required
                                        className="
                                            min-w-0 rounded-lg
                                            border border-solid border-[#d1d5db]
                                            bg-white p-3 text-[#17324d]
                                            [font-family:inherit]
                                            focus-visible:outline-2
                                            focus-visible:outline-[#0f4d3c]"
                                    />
                        </label>

                        <label
                            className="
                                flex min-w-0 flex-col gap-2
                                text-sm font-semibold text-[#17324d]"
                            >
                                Monthly limit (€)
                                    <input
                                        name="amount"
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="300.00"
                                        required
                                        className="
                                            min-w-0 rounded-lg
                                            border border-solid border-[#d1d5db]
                                            bg-white p-3 text-[#17324d]
                                            [font-family:inherit]
                                            focus-visible:outline-2
                                            focus-visible:outline-[#0f4d3c]"
                                    />
                        </label>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Add budget"}
                        </Button>
                    </fieldset>

                    {error && (
                        <p className="mb-0 mt-4 text-sm text-red-700" role="alert">{error}</p>
                    )}
            </form>
    );
}

export default AddBudgetForm;
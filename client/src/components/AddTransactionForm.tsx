import {useState} from "react";
import type { SubmitEvent } from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {
    MONEY_INPUT_ERROR,
    parseMoneyToCents
} from "../utils/money";

import Button from "./ui/Button";
import { ApiError, apiRequest } from "../api/client";


const inputStyles =
    "w-full min-w-0 rounded-lg border border-solid border-[#d1d5db] " +
    "bg-white p-3 text-base font-normal text-[#1f2937] " +
    "[font-family:inherit] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[#0f4d3c]";

type AddTransactionFormPage = {
    onSaved: () => void;
};

function AddTransactionForm({onSaved}: AddTransactionFormPage) {
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if(isSubmitting) {
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const date = String(formData.get("date") ?? "");
        const description = String(formData.get("description") ?? "").trim();
        const category = String(formData.get("category") ?? "").trim();
        const type = String(formData.get("type") ?? "").trim();
        const amount = String(formData.get("amount") ?? "");

        setError("");

        const amountCents =parseMoneyToCents(amount);

        if(amountCents === null){
            setError(MONEY_INPUT_ERROR);
            return;
        }

        if(!description || !category) {
            setError("Enter a description and a category.");
            return;
        }

        setIsSubmitting(true);

        try{
            await apiRequest("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                
                body: JSON.stringify({
                    date,
                    description,
                    category,
                    type,
                    amountCents
                })
            });

            form.reset();
            toast.success("Transaction added.");
            onSaved();
        } catch (error) {
            if(error instanceof ApiError && error.status === 401) {
                navigate("/login", {replace: true});
                return;
            }

            setError("Could not save the transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form 
            onSubmit={handleSubmit}
            className="
                mt-6 rounded-[18px]
                border border-solid border-[#dce3e8]
                bg-white p-6
                "
            >
            <h2 className="m-0 mb-5 text-xl font-bold text-[#17324d]">Add transaction</h2>

            <fieldset 
                disabled={isSubmitting}
                className="
                    m-0 grid min-w-0 grid-cols-1 gap-4
                    border-0 p-0
                    md:grid-cols-2 xl:grid-cols-3
                    disabled:opacity-60
                    "
            >
                <label className="flex min-w-0 flex-col gap-2 text-sm text-[#526477]">
                    Date
                    <input name="date" type = "date" className={inputStyles} required />
                </label>

                <label className="flex min-w-0 flex-col gap-2 text-sm text-[#526477]">
                    Description
                    <input name="description" type = "description" maxLength={255} className={inputStyles} required />
                </label>

                <label className="flex min-w-0 flex-col gap-2 text-sm text-[#526477]">
                    Category
                    <input name="category" type = "category" maxLength={50} className={inputStyles} required />
                </label>

                <label className="flex min-w-0 flex-col gap-2 text-sm text-[#526477]">
                    Type
                    <select name="type" defaultValue="expense" className={`${inputStyles} cursor-pointer`}>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </label>

                <label className="flex min-w-0 flex-col gap-2 text-sm text-[#526477]">
                    Amount (€)
                    <input name="amount" type = "amount" inputMode="decimal" className={inputStyles} required />
                </label>

                <Button
                    type="submit"
                    disabled ={isSubmitting}
                    className="self-end">
                        {isSubmitting ? "Saving..." : "Add transaction"}
                    </Button>

            </fieldset>

            {error && (<p className="form-error mb-0 mt-4 text-sm" role="alert">{error}</p>)}
        </form>
    );
}

export default AddTransactionForm;
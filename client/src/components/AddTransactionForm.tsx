import {useState} from "react";
import type { SubmitEvent } from "react";
import {useNavigate} from "react-router-dom";
import "../styles/add-transaction-form.css";

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
        const amount = String(formData.get("amount") ?? "").trim().replace(",", ".");

        setError("");

        if(!/^\d+(\.\d{1,2})?$/.test(amount)) {
            setError("Enter an amount with up to two decimal places.");
            return;
        }

        const [whole, fraction = ""] = amount.split(".");

        const amountCents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

        if(!Number.isSafeInteger(amountCents) || amountCents <=0 || amountCents > 2147483647) {
            setError("Enter an amount between €0.01 and €21,474,836.47.");
            return;
        }

        if(!description || !category){
            setError("Enter a description and a category.");
            return;
        }

        setIsSubmitting(true);

        try{
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    date,
                    description,
                    category,
                    type,
                    amountCents
                })
            });

            if(response.status === 401) {
                navigate("/login", {replace: true});
                return;
            }

            if(!response.ok){
                throw new Error("Could not save the transaction.");
            }

            form.reset();
            onSaved();

        } catch {
            setError("Could not save the transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form className="transaction-form" onSubmit={handleSubmit}>
            <h2>Add transaction</h2>

            <fieldset disabled={isSubmitting}>
                <label>
                    Date
                    <input name="date" type = "date" required />
                </label>

                <label>
                    Description
                    <input name="description" type = "description" required />
                </label>

                <label>
                    Category
                    <input name="category" type = "category" required />
                </label>

                <label>
                    Type
                    <select name="type" defaultValue="expense">
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </label>

                <label>
                    Amount (€)
                    <input name="amount" type = "amount" required />
                </label>

                <button type="submit">{isSubmitting ? "Saving" : "Add transaction"}</button>

            </fieldset>

            {error && (<p className="form-error" role="alert">{error}</p>)}
        </form>
    );
}

export default AddTransactionForm;
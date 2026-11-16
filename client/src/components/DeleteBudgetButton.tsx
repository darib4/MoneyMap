import {useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Trash2} from "lucide-react";
import {toast} from "react-toastify";
import type {ToastContentProps} from "react-toastify";

type DeleteBudgetButtonProps = {
    budgetId: number;
    category: string;
    onDeleted: () => void;
};

function DeleteBudgetButton({
    budgetId,
    category,
    onDeleted
}: DeleteBudgetButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteLock = useRef(false);

    const navigate = useNavigate();
    const confirmationToastId = `delete-budget-${budgetId}`;

    useEffect(() => {
        return () => {
            toast.dismiss(confirmationToastId);
        };
    }, [confirmationToastId]);

    async function handleDelete() {
        if(deleteLock.current) {
            return;
        }
        deleteLock.current = true;
        setIsDeleting(true);

        try{
            const response = await fetch(
                `/api/budgets/${budgetId}`, 
                {
                method: "DELETE",
                credentials: "include"
                }
            );

            if(response.status === 401){
                toast.info("Please log in again.");
                navigate("/login", {replace:true});
                return;
            }

            if(response.status === 404){
                toast.info("This budget no longer exists.");
                onDeleted();
                return;
            }

            if(!response.ok) {
                throw new Error("Could not delete budget.");
            }

            toast.success("Budget deleted.");
            onDeleted();
        } catch {
            toast.error("Could not delete budget. Please try again.");
        } finally {
            deleteLock.current = false;
            setIsDeleting(false);
        }
    }

    function requestConfirmation(){
        if(deleteLock.current || toast.isActive(confirmationToastId)){
            return;
        }

        toast(
            ({closeToast}: ToastContentProps) => (
                <div className="w-full text-[#17324d]">
                    <p className="m-0 text-sm leading-relaxed">
                        Delete the budget for{" "}
                        <strong className="[overflow-wrap:anywhere]">
                            {category}
                        </strong>
                        ?
                    </p>

                    <div className="mt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => closeToast()}
                            className="
                                cursor-pointer rounded-lg
                                border border-solid border-[#d1d5db]
                                bg-white px-3 py-2
                                text-sm text-[#17324d]
                                [font-family:inherit]
                                hover:bg-gray-100
                                focus-visible:outline-2
                                focus-visible:outline-[#0f4d3c]"
                            >
                                Cancel
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                closeToast();
                                void handleDelete();
                            }}
                            className="
                                cursor-pointer rounded-lg border-0
                                bg-red-700 px-3 py-2
                                text-sm font-semibold text-white
                                [font-family:inherit]
                                hover:bg-red-800
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-red-700"
                            >
                                Delete
                        </button>
                    </div>
                </div>
            ),
            {
                toastId: confirmationToastId,
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false
            }
        );
    }

    return(
        <button
            type="button"
            onClick={requestConfirmation}
            disabled={isDeleting}
            aria-label={`Delete ${category} budget`}
            className="
                inline-flex cursor-pointer items-center gap-2
                rounded-lg border border-solid border-red-200
                bg-white px-3 py-2 text-sm font-semibold
                text-red-700 [font-family:inherit]
                transition-colors
                hover:bg-red-700 hover:text-white
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-red-700
                disabled:cursor-wait disabled:opacity-60"
            >
                <Trash2 aria-hidden="true" className="h-4 w-4"/>
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
    );
} 

export default DeleteBudgetButton;
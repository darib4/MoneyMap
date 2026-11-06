import {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Trash2} from "lucide-react";
import {toast} from "react-toastify";
import type { ToastContentProps } from "react-toastify";

type DeleteTransactionButtonProps = {
    transactionId: number;
    description: string;
    onDeleted: () => void;
};

function DeleteTransactionButton({
    transactionId, description, onDeleted}: DeleteTransactionButtonProps) {
        const [isDeleting, setIsDeleting] = useState(false);
        const deleteLock = useRef(false);

        const navigate = useNavigate();
        const confirmationToastId = `delete-confirmation-${transactionId}`;

        useEffect(() => {
            return () => {
                toast.dismiss(confirmationToastId);
            };
        }, [confirmationToastId]);

        async function handleDelete(){
            if(deleteLock.current){
                return;
            }

            deleteLock.current = true;
            setIsDeleting(true);

            try{
                const response = await fetch(
                    `/api/transactions/${transactionId}`, 
                    {
                        method: "DELETE",
                        credentials: "include"
                    }
                );

                if(response.status === 401) {
                    toast.info("Please log in again.");
                    navigate("/login", {replace: true});
                    return;
                } 
                if(response.status === 404) {
                    toast.info("This transaction is no longer available.");
                    onDeleted();
                    return;
                }

                if(!response.ok) {
                    throw new Error("Could not delete transaction.");
                }

                toast.success("Transaction deleted.");
                onDeleted();
            } catch {
                toast.error("Could not delete the transaction. Please try again.");
            } finally {
                deleteLock.current = false;
                setIsDeleting(false);
            }
        }

        function requestConfirmation() {
            if(deleteLock.current || toast.isActive(confirmationToastId)) {
                return;
            }

            toast(
                ({closeToast}: ToastContentProps) => (
                    <div 
                        className="w-full"
                        onKeyDown={(event) => {
                            if(event.key === "Escape") {
                                closeToast();
                            }
                        }}
                    >
                        <p className="m-0 font-semibold">Delete transaction?</p>
                        <p className="mb-4 mt-2 text-sm [overflow-wrap:anywhere]">"{description}" will be permanently deleted.</p>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                autoFocus
                                onClick={() => {closeToast()}}
                                className="
                                    cursor-pointer rounded-lg
                                    border border-solid border-gray-300
                                    bg-white px-3 py-2
                                    text-sm text-gray-700
                                    hover:bg-gray-100"
                                >Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    closeToast()
                                    void handleDelete();
                                }}
                                className="
                                    cursor-pointer rounded-lg
                                    border border-solid border-red-700
                                    bg-red-700 px-3 py-2
                                    text-sm text-white
                                    hover:bg-red-800"
                                >Delete
                            </button>
                        </div>
                    </div>
                ), 
                {
                    toastId: confirmationToastId,
                    autoClose: false,
                    closeOnClick: false,
                    closeButton: false,
                    draggable: false,
                    role: "alert"
                }
            );
        }

        return (
            <button 
                type="button"
                onClick={requestConfirmation}
                disabled={isDeleting}
                aria-label={`Delete transaction: ${description}`}
                className="
                        inline-flex cursor-pointer items-center gap-2
                        rounded-lg border border-solid border-red-200
                        bg-white px-3 py-2 text-sm text-red-700
                        transition-colors hover:bg-red-50
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-red-700
                        disabled:cursor-wait disabled:opacity-60"
            >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete"}
            </button>
        );
}

export default DeleteTransactionButton;
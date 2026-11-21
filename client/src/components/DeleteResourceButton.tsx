import {useEffect, useRef,useState} from "react";
import { useNavigate } from "react-router-dom";
import {Trash2} from "lucide-react";
import {toast} from "react-toastify";
import type { ToastContentProps } from "react-toastify";
import Button from "./ui/Button";
import { ApiError, apiRequest } from "../api/client";

type DeleteResourceButtonProps = {
    endpoint: string;
    resourceName: string;
    itemLabel: string;
    onDeleted: () => void;
};

type DeleteConfirmationProps = {
    resourceName: string;
    itemLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
};

function DeleteConfirmation({
    resourceName,
    itemLabel,
    onConfirm,
    onCancel
}: DeleteConfirmationProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const previousFocus = document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;

        contentRef.current?.querySelector("button")?.focus();

        return () => {
            if(previousFocus?.isConnected) {
                previousFocus.focus();
            }
        };
    }, []);

    return(
        <div
            ref={contentRef}
            className="w-full text-[#17324d]"
            onKeyDown={(event) => {
                if(event.key === "Escape") {
                    event.stopPropagation();
                    onCancel();
                }
            }}
        >
            <p className="m-0 font-semibold">Delete {resourceName}</p>
            <p className="mb-4 mt-2 text-sm [overflow-wrap:anywhere]">{itemLabel}</p>

            <div className="flex justify-end gap-2">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onCancel}
                >
                    Cancel
                </Button>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={onConfirm}
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}

function DeleteResourceButton({
    endpoint,
    resourceName,
    itemLabel,
    onDeleted
}: DeleteResourceButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteLock = useRef(false);

    const navigate = useNavigate();
    const toastId = `delete-confirmation:${endpoint}`;

    useEffect(() => {
        return () => {
            toast.dismiss(toastId);
        };
    }, [toastId]);

    async function handleDelete() {
        if(deleteLock.current){
            return;
        }

        deleteLock.current = true;
        setIsDeleting(true);

        try {
            await apiRequest(endpoint, {
                method: "DELETE"
            });

            const title = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);

            toast.success(`${title} deleted.`);
            onDeleted();
        } catch (error) {
            if(error instanceof ApiError) {
                if(error.status === 401) {
                    toast.info("Please log in again.");
                    navigate("/login", {replace: true});
                    return;
                }

                if(error.status === 404){
                    toast.info(`This ${resourceName} no longer exists.`);
                    onDeleted();
                    return;
                }
            }

            toast.error(`Could not delete ${resourceName}. Please try again.`);
        } finally {
            deleteLock.current = false;
            setIsDeleting(false);
        }
    }

    function requestConfirmation() {
        if(deleteLock.current || toast.isActive(toastId)) {
            return;
        }

        toast(
            ({closeToast}: ToastContentProps) => (
                <DeleteConfirmation
                    resourceName={resourceName}
                    itemLabel={itemLabel}
                    onCancel={() => closeToast()}
                    onConfirm={() => {
                        closeToast();
                        void handleDelete();
                    }}
                />
            ),
            {
                toastId,
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                draggable: false
            }
        );
    }

    return(
        <Button
            variant="danger"
            size="sm"
            onClick={requestConfirmation}
            disabled={isDeleting}
            aria-label={`Delete ${resourceName}: ${itemLabel}`}
        >
            <Trash2
                aria-hidden="true"
                className="h-4 w-4"
            />
            {isDeleting ? "Deleting...": "Delete"}
        </Button>
    );
}

export default DeleteResourceButton;
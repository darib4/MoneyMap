import {useEffect, useRef, useState} from "react";
import {Outlet} from "react-router-dom";
import {X} from "lucide-react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import AddTransactionForm from "./AddTransactionForm";

function AppLayout() {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionsVersion, setTransactionsVersion] = useState(0);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;

        if(!dialog) {
            return;
        }

        if(!isTransactionModalOpen){
            if(dialog.open){
                dialog.close();
            }
            return;
        }

        if(!dialog.open) {
            dialog.showModal();
        }

        dialog.querySelector<HTMLInputElement>(
            'input:not([type="hidden"]):not(:disabled)'
        )
        ?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isTransactionModalOpen]);

    function handleTransactionSaved() {
        setIsTransactionModalOpen(false);
        setTransactionsVersion((current) => current + 1);
    }
    return (
        <div className="flex min-h-screen flex-col min-[601px]:flex-row">
            <Sidebar/>

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    onAddTransaction={() => setIsTransactionModalOpen(true)}/>
                <main className="
                        min-w-0 flex-1 p-5
                        min-[601px]:px-8
                        min-[601px]:py-10
                        [&_h1]:mt-0     
                    "
                >
                    <Outlet context={{ transactionsVersion }}/>
                </main>
            </div>

            <dialog
                ref={dialogRef}
                onClose={() => setIsTransactionModalOpen(false)}
                aria-label="Add transaction"
                className="
                    fixed inset-0 m-auto
                    max-h-[90dvh] w-[92vw] max-w-4xl
                    overflow-y-auto rounded-2xl border-0
                    bg-white p-0 text-[#17324d] shadow-2xl
                    backdrop:bg-black/50
                    backdrop:backdrop-blur-sm"
                >
                    <div className="flex justify-end px-5 pt-5">
                        <button
                            type="button"
                            onClick={() => setIsTransactionModalOpen(false)}
                            aria-label="Close transaction form"
                            className="
                                flex h-10 w-10 cursor-pointer
                                items-center justify-center
                                rounded-full border-0
                                bg-transparent text-[#607286]
                                transition-colors
                                hover:bg-emerald-50
                                hover:text-[#0f4d3c]
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-[#0f4d3c]"
                            >
                                <X aria-hidden="true" className="h-5 w-5"/>
                            </button>
                    </div>

                    <div className="p-5 pt-0">
                        <AddTransactionForm onSaved={handleTransactionSaved} />
                    </div>
                </dialog>
        </div>
    );
}

export default AppLayout;
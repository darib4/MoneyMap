import {useEffect, useState} from "react";
import {Navigate, Outlet} from "react-router-dom";

type SessionStatus = 
    | "loading"
    | "authenticated"
    | "unauthenticated"
    | "error";

function ProtectedRoute() {
    const [status, setStatus] = useState<SessionStatus>("loading");

    useEffect(() => {
        const controller = new AbortController();

        async function checkSession() {
            try{
                const response = await fetch("/api/auth/me", {
                    credentials: "include",
                    signal: controller.signal
                });

                if(controller.signal.aborted) {
                    return;
                }
                if(response.ok){
                    setStatus("authenticated");
                } else if(response.status === 401) {
                    setStatus("unauthenticated");
                } else {
                    setStatus("error");
                }
            }
            catch {
                if(!controller.signal.aborted) {
                    setStatus("error");
                }
            }
        }
        checkSession();

        return () => {
            controller.abort();
        };
    }, []);

    if(status === "loading"){
        return (
            <p role="alert">
                Could not check your session. Please refresh the page to try again.
            </p>
        );
    }

    if(status === "unauthenticated") {
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
}

export default ProtectedRoute;
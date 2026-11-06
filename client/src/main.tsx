import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />

        <ToastContainer
            aria-label="Notifications"
            position="top-right"
            autoClose={4000}
            closeOnClick
            pauseOnHover
            role="status"
        />
    </StrictMode>
);
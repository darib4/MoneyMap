import {useState} from "react";
import { useNavigate } from "react-router-dom";

function Header() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const navigate = useNavigate();

    async function handleLogout() {
        if(isLoggingOut){
            return;
        }

        setLogoutError("");
        setIsLoggingOut(true);

        try{
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });

            if(!response.ok) {
                throw new Error("Logout failed.");
            }

            navigate("/login", {replace:true});

        } catch {
            setLogoutError("Could not log out. Please try again.");

        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <header className="
                    flex flex-col items-end gap-2
                    border-0 border-b border-solid border-[#dce3e8]
                    bg-white px-5 py-4
                    min-[601px]:px-8
                "
        >
            <button type="button" onClick={handleLogout} disabled={isLoggingOut} 
                className="
                    cursor-pointer rounded-lg
                    border border-solid border-[#0f4d3c]
                    bg-white px-4 py-2
                    text-sm font-semibold text-[#0f4d3c]
                    transition-colors duration-200
                    hover:bg-[#0f4d3c] hover:text-white
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#0f4d3c]
                    disabled:cursor-wait disabled:opacity-60
            ">
                {isLoggingOut ? "Logging out..." : "Log out"}
            </button>

            {logoutError && (
                <p className="m-0 text-sm text-red-700" role="alert">{logoutError}</p>
            )}
        </header>
    );
}

export default Header;
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, UserRound } from "lucide-react";
import TransactionSearch from "./TransactionSearch";

type ProfileResponse = {
    user: {
        firstName: string;
    };
};

function Header() {
    const [firstName, setFirstName] = useState("");
    const [profileError, setProfileError] = useState("");

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const accountRef = useRef<HTMLDivElement>(null);
    const profileButtonRef = useRef<HTMLButtonElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        async function loadProfile() {
            try {
                const response = await fetch("/api/auth/me", {
                    credentials: "include",
                    signal: controller.signal
                });

                if (controller.signal.aborted) {
                    return;
                }

                if (response.status === 401) {
                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error("Could not load profile.");
                }

                const data: ProfileResponse = await response.json();

                if (!controller.signal.aborted) {
                    setFirstName(data.user.firstName);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setProfileError("Could not load your profile.");
                }
            }
        }

        loadProfile();

        return () => {
            controller.abort();
        };
    }, [navigate]);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        function handleOutsideClick(event: PointerEvent) {
            if (
                event.target instanceof Node &&
                !accountRef.current?.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsMenuOpen(false);
                profileButtonRef.current?.focus();
            }
        }

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("pointerdown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isMenuOpen]);

    async function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setLogoutError("");
        setIsLoggingOut(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Logout failed.");
            }

            navigate("/login", { replace: true });
        } catch {
            setLogoutError("Could not log out. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;

    const greeting =
        hour < 12
            ? "Good morning"
            : hour < 18
                ? "Good afternoon"
                : "Good evening";

    return (
        <header
            className="
                flex flex-wrap items-center justify-between gap-4
                border-0 border-b border-solid border-[#dce3e8]
                bg-white px-5 py-4
                min-[601px]:px-8
            "
        >
            <div className="flex items-center gap-3">
                {isDaytime ? (
                    <Sun
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 text-amber-500"
                    />
                ) : (
                    <Moon
                        aria-hidden="true"
                        className="h-6 w-6 shrink-0 text-indigo-500"
                    />
                )}

                <div>
                    <p className="m-0 text-lg font-bold text-[#17324d]">
                        {firstName
                            ? `${greeting}, ${firstName}`
                            : "Welcome to MoneyMap"}
                    </p>

                    {profileError ? (
                        <p
                            className="m-0 mt-1 text-sm text-red-700"
                            role="alert"
                        >
                            {profileError}
                        </p>
                    ) : (
                        <p className="m-0 mt-1 text-sm text-[#607286]">
                            Here’s what’s happening with your money today.
                        </p>
                    )}
                </div>
            </div>

            <TransactionSearch/>

            <div ref={accountRef} className="relative">
                <button
                    ref={profileButtonRef}
                    type="button"
                    aria-label="Account options"
                    aria-expanded={isMenuOpen}
                    aria-controls="account-panel"
                    onClick={() => setIsMenuOpen((current) => !current)}
                    className="
                        flex h-10 w-10 cursor-pointer
                        items-center justify-center rounded-full
                        border border-solid border-[#dce3e8]
                        bg-white p-0 text-[#0f4d3c]
                        transition-colors hover:bg-emerald-50
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-[#0f4d3c]
                    "
                >
                    <UserRound
                        aria-hidden="true"
                        className="h-6 w-6"
                    />
                </button>

                {isMenuOpen && (
                    <div
                        id="account-panel"
                        className="
                            absolute right-0 top-full z-20
                            mt-2 w-56 rounded-xl
                            border border-solid border-[#dce3e8]
                            bg-white p-2 shadow-lg
                        "
                    >
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="
                                w-full cursor-pointer rounded-lg
                                border-0 bg-transparent px-4 py-3
                                text-left text-sm font-semibold text-[#0f4d3c]
                                transition-colors duration-200
                                hover:bg-[#0f4d3c] hover:text-white
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-[#0f4d3c]
                                disabled:cursor-wait disabled:opacity-60
                            "
                        >
                            {isLoggingOut ? "Logging out…" : "Log out"}
                        </button>

                        {logoutError && (
                            <p
                                className="mx-2 mb-2 mt-3 text-sm text-red-700"
                                role="alert"
                            >
                                {logoutError}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
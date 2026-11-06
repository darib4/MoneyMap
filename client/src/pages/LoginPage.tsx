import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";

const inputWrapperStyles =
    "flex items-center rounded-lg border border-solid border-[#d1d5db] " +
    "bg-white focus-within:border-[hsl(160,59%,30%)]";

const inputStyles =
    "min-w-0 w-full flex-1 rounded-lg border-0 bg-transparent " +
    "p-3.5 text-[15px] text-[#1f2937] " +
    "[font-family:inherit] outline-none";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error(
                    response.status === 401
                        ? "Invalid email or password."
                        : "Login failed. Please try again."
                );
            }

            navigate("/transactions", { replace: true });
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen">
            <header
                className="
                    border-0 border-b border-solid border-[#d1d5db]
                    bg-white px-8 py-5
                "
            >
                <img
                    src="/assets/logo-text.png"
                    alt="MoneyMap"
                    className="block h-auto w-[140px]"
                />
            </header>

            <main
                className="
                    flex flex-col items-center justify-center
                    gap-8 px-4 py-6
                    min-[761px]:flex-row
                    min-[761px]:gap-20
                    min-[761px]:p-10
                "
            >
                <section
                    className="
                        w-full min-w-0 max-w-[500px] text-center
                        min-[761px]:flex-1 min-[761px]:text-left
                    "
                >
                    <img
                        src="/assets/logo.png"
                        alt=""
                        className="
                            mx-auto mb-[25px] block h-auto w-[100px]
                            min-[761px]:mx-0
                        "
                    />

                    <h1
                        className="
                            mx-auto my-0 max-w-[400px] p-0
                            text-[32px] font-bold leading-[1.1]
                            text-[hsl(160,59%,20%)]
                            min-[761px]:mx-0
                            min-[761px]:text-[42px]
                        "
                    >
                        Never worry about money again.
                    </h1>
                </section>

                <section
                    className="
                        w-full max-w-[430px]
                        rounded-2xl bg-[#74C69D] p-6
                        min-[761px]:p-10
                    "
                >
                    <h2
                        className="
                            mb-5 mt-0 text-center text-2xl font-bold
                            text-[hsl(160,59%,20%)]
                        "
                    >
                        Log In
                    </h2>

                    <form
                        className="flex flex-col gap-5"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="login-email"
                                className="font-semibold text-[#1f2937]"
                            >
                                Email
                            </label>

                            <div className={inputWrapperStyles}>
                                <Mail
                                    aria-hidden="true"
                                    className="ml-3.5 h-5 w-5 shrink-0 text-[#607286]"
                                />

                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(event) =>
                                        setEmail(event.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="login-password"
                                className="font-semibold text-[#1f2937]"
                            >
                                Password
                            </label>

                            <div className={inputWrapperStyles}>
                                <LockKeyhole
                                    aria-hidden="true"
                                    className="ml-3.5 h-5 w-5 shrink-0 text-[#607286]"
                                />

                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    className={inputStyles}
                                    required
                                />

                                <button
                                    type="button"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                    aria-pressed={showPassword}
                                    aria-controls="login-password"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    className="
                                        flex shrink-0 cursor-pointer
                                        items-center justify-center
                                        rounded-md border-0 bg-transparent p-3
                                        text-[#607286] hover:text-[#0f4d3c]
                                        focus-visible:outline-2
                                        focus-visible:outline-offset-2
                                        focus-visible:outline-[#0f4d3c]
                                    "
                                >
                                    {showPassword ? (
                                        <EyeOff
                                            aria-hidden="true"
                                            className="h-5 w-5"
                                        />
                                    ) : (
                                        <Eye
                                            aria-hidden="true"
                                            className="h-5 w-5"
                                        />
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p
                                className="form-error m-0 text-sm"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                cursor-pointer rounded-lg border-0
                                bg-[hsl(160,59%,30%)] p-3.5
                                text-base font-semibold text-white
                                [font-family:inherit]
                                transition-colors
                                hover:bg-[hsl(160,59%,22%)]
                                focus-visible:outline-2
                                focus-visible:outline-offset-2
                                focus-visible:outline-[#0f4d3c]
                                disabled:cursor-wait disabled:opacity-60
                            "
                        >
                            {isSubmitting ? "Logging in…" : "Log In"}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
}

export default LoginPage;
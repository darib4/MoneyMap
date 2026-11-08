import {useState} from "react";
import type { SubmitEvent} from "react";
import {Link, useNavigate} from "react-router-dom";
import {Eye, EyeOff} from "lucide-react";
import {toast} from "react-toastify";

const inputStyles =
    "w-full min-w-0 rounded-lg border border-solid border-[#d1d5db] " +
    "bg-white p-3.5 text-[15px] font-normal text-[#1f2937] " +
    "[font-family:inherit] " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[#0f4d3c]";

const labelStyles =
    "flex min-w-0 flex-col gap-2 text-sm font-semibold text-[#1f2937]";

function RegisterPage() {
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if(isSubmitting){
            return;
        }

        setError("");

        const formData = new FormData(event.currentTarget);

        const firstName = String(formData.get("firstName") ?? "").trim();
        const lastName = String(formData.get("lastName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim().toLowerCase();
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if(!firstName || !lastName){
            setError("Enter your first and last name.");
            return;
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Enter a valid email.");
            return;
        }

        if(password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if(password.length < 8) {
            setError("Use a password with at least 8 characters.");
            return;
        }

        if(new TextEncoder().encode(password).length > 72) {
            setError("Your password is too long. Please use a shorter one.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password
                })
            });

            if(response.status === 409) {
                setError("An account with this email already exists.");
                return;
            }

            if(response.status === 400) {
                setError("Please check your details and try again.");
                return;
            }

            if(!response.ok) {
                setError("Could not create your account. Please try again.");
                return;
            }

            toast.success("Account create. Please log in.");
            navigate("/login", {replace: true});

        } catch {
            setError("Could not connect to the server. Please try again.");

        } finally {
            setIsSubmitting(false);
        }
    }
 

    return(
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
                                mx-auto my-0 max-w-[400px]
                                text-[32px] font-bold leading-[1.1]
                                text-[hsl(160, 59%, 20%)]
                                min-[761px]:mx-0
                                min-[761px]:text-[42px]
                            "
                        >
                            Never worry about your money again.
                        </h1>
                    </section>

                    <section
                        className="
                            w-full max-w-[430px]
                            rounded-2x1 bg-[#74C69D] p-6
                            min-[761px]:p-10
                            "
                        >
                            <h2
                                className="
                                    mb-5 nt-0 text-center text-2x1 font-bold
                                    text-[hsl(160, 59%, 20%)]
                                    "
                                >
                                    Create account
                                </h2>

                                <form
                                    onSubmit={handleSubmit}
                                    className="flex flex-col gap-5"
                                    >
                                    
                                    <fieldset
                                        disabled={isSubmitting}
                                        className="
                                            m-0 flex min-w-0 flex-col gap-5
                                            border-0 p-0 disabled:opacity-60"
                                    >
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <label className={labelStyles}>First name
                                                <input
                                                    name="firstName"
                                                    type="text"
                                                    autoComplete="given-name"
                                                    maxLength={50}
                                                    className={inputStyles}
                                                    required
                                                />
                                            </label>

                                            <label className={labelStyles}>Last name
                                                <input
                                                    name="lastName"
                                                    type="text"
                                                    autoComplete="family-name"
                                                    maxLength={50}
                                                    className={inputStyles}
                                                    required
                                                />
                                            </label>
                                        </div>

                                        <label className={labelStyles}>Email
                                            <input
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                maxLength={254}
                                                className={inputStyles}
                                                required
                                            />
                                        </label>

                                        <label
                                            htmlFor="register-password"
                                            className={labelStyles}
                                        >
                                            Password
                                        </label>

                                        <div className="relative -mt-3">
                                            <input
                                                id="register-password"
                                                name="password"
                                                type={showPasswords ? "text" : "password"}
                                                autoComplete="new-password"
                                                minLength={8}
                                                className={`${inputStyles} pr-12`}
                                                required
                                            />

                                            <button
                                                type="button"
                                                aria-label={
                                                    showPasswords ? "Hide passwords" : "Show passwords"
                                                }
                                                aria-pressed={showPasswords}
                                                aria-controls="register-password register-confirm-password"
                                                onClick={() => 
                                                    setShowPasswords((current) => !current)
                                                }
                                                className="
                                                    absolute right-1.5 top-1/2
                                                    -translate-y-1/2
                                                    flex cursor-pointer items-center
                                                    rounded-md border-0
                                                    bg-transparent p-2 text-[#607286]
                                                    hover:text-[#0f4d3c]
                                                    focus-visible:outline-2
                                                    focus-visible:outline-[#0f4d3c]
                                                "
                                            >
                                                {showPasswords ? (
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

                                        <label className={labelStyles}>
                                            Confirm password

                                            <input
                                                id="register-confirm-password"
                                                name="confirmPassword"
                                                type={showPasswords ? "text" : "password"}
                                                autoComplete="new-password"
                                                minLength={8}
                                                className={inputStyles} 
                                                required
                                            />
                                        </label>

                                    </fieldset>

                                    {error && (
                                        <p
                                            className="m-0 text-sm font-medium text-red-950"
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
                                            {isSubmitting ? "Creating account..." : "Create account"}
                                    </button>
                                </form>

                                <p className="mb-0 mt-3 text-center text-sm text-[#1f2937]">
                                    Already have an account?{" "}
                                    <Link
                                        to="/login"
                                        className="font-semibold text-[#0f4d3c]"
                                        >
                                            Log in
                                    </Link>
                                </p>
                    </section>
            </main>
        </div>
        
    );
}

export default RegisterPage;
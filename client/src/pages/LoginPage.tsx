import {useState} from "react";
import type {SubmitEvent} from "react";
import {useNavigate} from "react-router-dom";
import "../styles/login-register.css";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if(isSubmitting) {
            return;
        }

        setError("");
        setIsSubmitting(true);

        try{
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
            if(!response.ok){
                throw new Error(response.status === 401 ? "Invalid email or password." : "Login failed. Please try again.");
            }
            navigate("/transactions", {replace: true});
        } catch(error) {
            setError(error instanceof Error ? error.message : "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
    <div className="auth-screen">
        <header className="auth-header">
            <img
                src="/assets/logo-text.png"
                alt="MoneyMap"
            />
        </header>

        <main className="auth-page">
            <section className="auth-intro">
                <img
                    src="/assets/logo.png"
                    alt=""
                />

                <h1>Never worry about money again.</h1>
            </section>

            <section className="auth-card">
                <h2>Log In</h2>

                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >
                    <div className="form-group">
                        <label htmlFor="login-email">
                            Email
                        </label>

                        <div className="input-wrapper">
                            <img
                                src="/assets/login-register/mail.svg"
                                alt=""
                                className="input-icon"
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
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="login-password">
                            Password
                        </label>

                        <div className="input-wrapper">
                            <img
                                src="/assets/login-register/lock.svg"
                                alt=""
                                className="input-icon"
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
                                required
                            />

                            <button
                                type="button"
                                className="toggle-password"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                onClick={() =>
                                    setShowPassword((current) => !current)
                                }
                            >
                                <img
                                    src={
                                        showPassword
                                            ? "/assets/login-register/eye-closed.svg"
                                            : "/assets/login-register/eye.svg"
                                    }
                                    alt=""
                                    className="toggle-icon"
                                />
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="btn-register-submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                </form>
            </section>
        </main>
    </div>
);
}

export default LoginPage;
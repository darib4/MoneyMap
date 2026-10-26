import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Sidebar />

                <main className="main-content">
                    <Routes>
                        <Route
                            path="/"
                            element={<Navigate to="/transactions" replace />}
                        />

                        <Route
                            path="/dashboard"
                            element={<h1>Dashboard</h1>}
                        />

                        <Route
                            path="/transactions"
                            element={
                                <section>
                                    <h1>Transactions</h1>
                                    <p>
                                        Track and manage all your income
                                        and expenses.
                                    </p>
                                </section>
                            }
                        />

                        <Route
                            path="/budgets"
                            element={<h1>Budgets</h1>}
                        />

                        <Route
                            path="/analytics"
                            element={<h1>Analytics</h1>}
                        />

                        <Route
                            path="/goals"
                            element={<h1>Goals</h1>}
                        />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
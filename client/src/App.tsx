import {
    BrowserRouter,
    Navigate,
    Route,
    Routes
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import TransactionsPage from "./pages/TransactionsPage";
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/transactions" replace />}
                />

                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route
                            path="/dashboard"
                            element={<h1>Dashboard</h1>}
                        />

                        <Route
                            path="/transactions"
                            element={<TransactionsPage />}
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
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
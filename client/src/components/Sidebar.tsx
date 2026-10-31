import { NavLink } from "react-router-dom";
import "../styles/sidebar.css";

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                MoneyMap
            </div>

            <nav className="sidebar-nav" aria-label="Main navigation">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/transactions">Transactions</NavLink>
                <NavLink to="/budgets">Budgets</NavLink>
                <NavLink to="/analytics">Analytics</NavLink>
                <NavLink to="/goals">Goals</NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;
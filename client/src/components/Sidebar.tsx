import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Wallet,
    ChartNoAxesCombined,
    Target
} from "lucide-react";

const navigationItems = [ 
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
    { path: "/transactions", label: "Transactions", icon: ArrowLeftRight},
    { path: "/budgets", label: "Budgets", icon: Wallet},
    { path: "/analytics", label: "Analytics", icon: ChartNoAxesCombined},
    { path: "/goals", label: "Goals", icon: Target}
];

const linkStyles = `
    flex tems-center gap-3 rounded-xl px-4 py-3.5 
    text-base no-underline transition-colors
    focus-visible:outline-2 focus-visible:outline-offset-2 
    focus-visible:outline:white
`;


function Sidebar() {
    return (
        <aside className="
                    w-full shrink-0 
                    bg-linear-to-b from-[#0f4d3c] to-[#0b3a2e]
                    px-4 py-6
                    min-[601px]:w-60"
        >
            <div className="mb-8 flex items-items-center gap-3 px-2 py-2">
                <img
                    src="/assets/logo.png"
                    alt=""
                    className="h-10 w-10 shrink-0 object-contain"
                />

                <span className="whitespace-nowrap text-2xl font-bold leading-none text-white">MoneyMap</span>
            </div>

            <nav 
                aria-label="Main navigation"
                className="flex flex-wrap gap-2.5 min-[601px]:flex-col
                "
            >
                {navigationItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({isActive}) => `${linkStyles} ${
                                isActive 
                                    ? "bg-[#b7efd5] font-semibold text-[#0f4d3c] hover:bg-[#a3e5c7]"
                                    : "text-emerald-100 hover:bg-white/15 hover:text-white"}`}
                        >
                            <Icon
                                aria-hidden="true"
                                className="h-5 w-5 shrink-0"
                            />

                            <span>{item.label}</span>
                        </NavLink>
                    )
                })}
            </nav>
        </aside>
    );
}

export default Sidebar;
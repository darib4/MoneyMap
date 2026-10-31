import { NavLink } from "react-router-dom";

const navigationItems = [ 
    { path: "/dashboard", label: "Dashboard"},
    { path: "/transactions", label: "Transactions"},
    { path: "/budgets", label: "Budgets"},
    { path: "/analytics", label: "Analytics"},
    { path: "/goals", label: "Goals"}
];

const linkStyles = 
    "block rounded-[10px] px-4 py-3.5 no-underline " + 
    "transition-colors hover:bg-white/15 hover:text-white " + 
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline:white";


function Sidebar() {
    return (
        <aside className="
                    w-full shrink-0 
                    bg-linear-to-b from-[#0f4d3c] to-[#0b3a2e]
                    px-4 py-6
                    min-[601px]:w-60"
        >
            <div className="mb-8 px-4 py-2 text-[26px] font-bold text-white">
                MoneyMap
            </div>

            <nav className="flex flex-wrap gap-2.5 min-[601px]:flex-col" aria-label="Main navigation">
                {navigationItems.map((item) => (
                    <NavLink 
                        key={item.path}
                        to={item.path}
                        className={({isActive}) =>
                            `${linkStyles} ${
                                isActive ? "bg-white/15 text-white" : "text-emerald-100"
                            }`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}

export default Sidebar;
import {Outlet} from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col min-[601px]:flex-row">
            <Sidebar/>

            <div className="flex min-w-0 flex-1 flex-col">
                <Header/>
                <main className="
                        min-w-0 flex-1 p-5
                        min-[601px]:px-8
                        min-[601px]:py-10
                        [&_h1]:mt-0     
                    "
                >
                    <Outlet/>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const isAdmin = location.pathname.includes('admin');

    return (
        <div className="bg-background-light dark:bg-background-dark text-text-main font-display min-h-screen flex flex-col md:flex-row transition-colors duration-300">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined">swords</span>
                    </div>
                    <h1 className="font-bold text-lg text-text-main dark:text-white">YOLO Loot</h1>
                </div>
                <button className="p-2 text-text-muted">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>

            {/* Sidebar (Desktop) - Fixed Position */}
            <aside className="hidden lg:flex w-72 flex-col justify-between border-r border-border-light dark:border-border-dark bg-white dark:bg-[#1e140d] p-6 h-screen fixed top-0 left-0 z-40 overflow-y-auto">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-3 px-2">
                        <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-white shadow-lg shadow-orange-500/30">
                            <span className="material-symbols-outlined">diamond</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold leading-tight dark:text-white">YOLO Loot</h1>
                            <span className="text-xs font-medium text-primary uppercase tracking-wider">v2.0</span>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className="material-symbols-outlined fill-1">dashboard</span>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/history" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className="material-symbols-outlined">history</span>
                            <span>History</span>
                        </NavLink>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-4"></div>
                        <NavLink to="/register" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className="material-symbols-outlined">person_add</span>
                            <span>Players</span>
                        </NavLink>
                        <NavLink to="/items" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className="material-symbols-outlined">add_circle</span>
                            <span>New Item</span>
                        </NavLink>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-2 mx-4"></div>
                        <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}`}>
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                            <span>Admin</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                    <div className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA05cVfzyEIZj7ZKTbBmXOmyHBz1Jz6J6Gh9vv6gycs2tA2M7vRNaC0ynjkoaC6K3l_vjdhiOXBcZ79jMAl8wEJl9Q1YAUGBBScF60CW2EPpQcsbIFdD6tbowuJrSTcKXb4iCl6uvmT9BKs62Y3S8uBSXFm2m1j0o3EJyXyJ0fsvifJES0XV5mVWZBHWJ4NDU5xpioBlo269_TWNn9Ib-eRVSu0We1tDPOULBMKhMTBJn5002wfoY9Hb6d7qK9EYAzWu5oS0zhQp0EK')" }}></div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-bold truncate dark:text-white">Alex Hunter</p>
                        <p className="text-xs text-gray-500 truncate">Lvl 42 Paladin</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content - Added Margin Left for Desktop */}
            <main className="flex-1 w-full overflow-y-auto lg:ml-72">
                {children}
            </main>
        </div>
    );
};

export default Layout;
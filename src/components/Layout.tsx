import { Outlet, NavLink } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
    return (
        <div className="flex flex-col h-screen bg-background text-text overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 p-4">
                <Outlet />
            </main>

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 w-full h-16 bg-background-light/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center z-50">
                <NavLink
                    to="/inicio"
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center p-2 transition-colors duration-300",
                            isActive ? "text-primary" : "text-text-muted hover:text-white"
                        )
                    }
                >
                    <Home size={24} />
                    <span className="text-[10px] mt-1">Início</span>
                </NavLink>

                <NavLink
                    to="/registro"
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center p-2 transition-colors duration-300",
                            isActive ? "text-primary" : "text-text-muted hover:text-white"
                        )
                    }
                >
                    <PlusCircle size={24} />
                    <span className="text-[10px] mt-1">Registro</span>
                </NavLink>

                <NavLink
                    to="/chat"
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center p-2 transition-colors duration-300",
                            isActive ? "text-primary" : "text-text-muted hover:text-white"
                        )
                    }
                >
                    <MessageSquare size={24} />
                    <span className="text-[10px] mt-1">Ayra</span>
                </NavLink>

                <NavLink
                    to="/perfil"
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center justify-center p-2 transition-colors duration-300",
                            isActive ? "text-primary" : "text-text-muted hover:text-white"
                        )
                    }
                >
                    <User size={24} />
                    <span className="text-[10px] mt-1">Perfil</span>
                </NavLink>
            </nav>
        </div>
    );
}

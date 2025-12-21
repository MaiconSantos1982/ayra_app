import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, MessageSquare, User } from 'lucide-react';
import clsx from 'clsx';

import PullToRefresh from './PullToRefresh';

export default function Layout() {
    const location = useLocation();
    const isChat = location.pathname === '/chat';

    return (
        <div className="flex flex-col h-screen bg-background text-text overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {isChat ? (
                    // Chat Layout: Altura calculada descontando Bottom Bar (64px)
                    <div className="w-full overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
                        <Outlet />
                    </div>
                ) : (
                    // Default Layout: Com PullToRefresh, Com Padding
                    <PullToRefresh>
                        <div className="pb-24 p-4 min-h-full">
                            <Outlet />
                        </div>
                    </PullToRefresh>
                )}
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

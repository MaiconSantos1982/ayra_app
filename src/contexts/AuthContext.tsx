import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, isUserLoggedIn, logoutUser, refreshUserPremiumStatus } from '../lib/supabaseAuth';

interface AuthContextType {
    user: {
        id: number;
        email: string;
        nome: string;
        premium: boolean;
    } | null;
    loading: boolean;
    signOut: () => void;
    refreshPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verifica se há usuário logado no localStorage
        if (isUserLoggedIn()) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser(currentUser);

                // Atualiza status premium em background
                refreshUserPremiumStatus().then((isPremium) => {
                    setUser(prev => prev ? { ...prev, premium: isPremium } : null);
                });
            }
        }

        setLoading(false);
    }, []);

    const signOut = () => {
        logoutUser();
        setUser(null);
        window.location.href = '/login';
    };

    const refreshPremium = async () => {
        const isPremium = await refreshUserPremiumStatus();
        setUser(prev => prev ? { ...prev, premium: isPremium } : null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshPremium }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

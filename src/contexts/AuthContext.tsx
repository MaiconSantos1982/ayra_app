import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AyraCadastro } from '../types/database.types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: AyraCadastro | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<AyraCadastro | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for demo mode
        const demoUser = localStorage.getItem('demo_user');
        if (demoUser) {
            const parsed = JSON.parse(demoUser);
            setProfile({
                id: 1,
                id_usuario: 'demo-user-id',
                nome: parsed.nome || 'Demo User',
                restricoes: 'Amendoim',
                plano: parsed.plano || 'free',
                created_at: new Date().toISOString()
            });
            setSession({ user: { id: 'demo-user-id', email: parsed.email } } as any);
            setUser({ id: 'demo-user-id', email: parsed.email } as any);
            setLoading(false);
            return;
        }

        // Get initial session from Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId: string) {
        try {
            const { data, error } = await supabase
                .from('ayra_cadastro')
                .select('*')
                .eq('id_usuario', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        localStorage.removeItem('demo_user');
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

    return (
        <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
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

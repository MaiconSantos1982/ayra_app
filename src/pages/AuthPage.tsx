import { useState } from 'react';
import { Mail, User, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { registerUser, loginUser, saveUserToLocalStorage } from '../lib/supabaseAuth';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

export default function AuthPage() {
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Formulário de Login
    const [loginEmail, setLoginEmail] = useState('');

    // Formulário de Cadastro
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!loginEmail.trim()) {
            setToast({ message: 'Digite seu email', type: 'warning' });
            return;
        }

        setLoading(true);

        try {
            const result = await loginUser(loginEmail);

            if (result.success && result.user) {
                // Salva no localStorage
                saveUserToLocalStorage(result.user);

                // Feedback
                const isPremium = result.user.plano === 'premium';
                setToast({
                    message: `Bem-vindo de volta, ${result.user.nome}! ${isPremium ? '⭐ Premium' : ''}`,
                    type: 'success'
                });

                // Redireciona com reload para atualizar AuthContext
                setTimeout(() => {
                    window.location.href = '/inicio';
                }, 1500);
            } else {
                setToast({ message: result.error || 'Erro ao fazer login', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Erro ao fazer login. Verifique sua conexão.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!registerName.trim() || !registerEmail.trim()) {
            setToast({ message: 'Preencha todos os campos', type: 'warning' });
            return;
        }

        setLoading(true);

        try {
            const result = await registerUser(registerName, registerEmail);

            if (result.success && result.user) {
                // Salva no localStorage
                saveUserToLocalStorage(result.user);

                // Feedback
                setToast({ message: `Conta criada com sucesso! Bem-vindo, ${result.user.nome}!`, type: 'success' });

                // Redireciona para onboarding com reload para atualizar AuthContext
                setTimeout(() => {
                    window.location.href = '/onboarding';
                }, 1500);
            } else {
                setToast({ message: result.error || 'Erro ao criar conta', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Erro ao criar conta. Verifique sua conexão.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-900/20 flex flex-col">
            {/* Header com Logo */}
            <div className="text-center pt-16 pb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-background" />
                    </div>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                    Ayra
                </h1>
                <p className="text-text-muted text-lg">Nutrição Inteligente com IA</p>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-6">
                <div className="glass rounded-2xl p-1 flex gap-1">
                    <button
                        onClick={() => setTab('login')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${tab === 'login'
                            ? 'bg-primary text-background'
                            : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <LogIn className="w-5 h-5 inline mr-2" />
                        Entrar
                    </button>
                    <button
                        onClick={() => setTab('register')}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${tab === 'register'
                            ? 'bg-primary text-background'
                            : 'text-text-muted hover:text-white'
                            }`}
                    >
                        <UserPlus className="w-5 h-5 inline mr-2" />
                        Cadastrar
                    </button>
                </div>
            </div>

            {/* Formulários */}
            <div className="flex-1 px-6 pb-24">
                {/* Login */}
                {tab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Bem-vindo de volta!</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                        <input
                                            type="email"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-background font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-background/20 border-t-background rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <LogIn size={20} />
                                        Entrar
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-text-muted text-sm">
                            Não tem conta?{' '}
                            <button
                                type="button"
                                onClick={() => setTab('register')}
                                className="text-primary font-semibold hover:underline"
                            >
                                Cadastre-se grátis
                            </button>
                        </p>
                    </form>
                )}

                {/* Cadastro */}
                {tab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="glass rounded-2xl p-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Criar conta grátis</h2>
                            <p className="text-text-muted text-sm mb-6">
                                Comece sua jornada de saúde com a Ayra
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Nome completo
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                        <input
                                            type="text"
                                            value={registerName}
                                            onChange={(e) => setRegisterName(e.target.value)}
                                            placeholder="Seu nome"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                        <input
                                            type="email"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            placeholder="seu@email.com"
                                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-gradient-to-r from-primary to-secondary text-background font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-3 border-background/20 border-t-background rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        Criar conta grátis
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-text-muted text-sm">
                            Já tem conta?{' '}
                            <button
                                type="button"
                                onClick={() => setTab('login')}
                                className="text-primary font-semibold hover:underline"
                            >
                                Faça login
                            </button>
                        </p>

                        <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                            <p className="text-sm text-text-muted text-center">
                                ✨ Comece grátis! Upgrade para Premium quando quiser.
                            </p>
                        </div>
                    </form>
                )}
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

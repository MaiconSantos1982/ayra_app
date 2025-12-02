import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Não utilizado - usa window.location.href
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function AuthPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(true);
    // const navigate = useNavigate(); // Não utilizado - usa window.location.href

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Modo de desenvolvimento - permite login sem Supabase
        setTimeout(() => {
            try {
                // Simula um login bem-sucedido
                const demoUser = {
                    email,
                    nome: email.split('@')[0],
                    plano: 'free'
                };
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
                console.log('Demo user saved:', localStorage.getItem('demo_user'));

                // Force page reload to trigger AuthContext
                window.location.href = '/inicio';
            } catch (error) {
                console.error('Error in demo login:', error);
                alert('Erro no login demo');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-2xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-neon transform hover:scale-110 transition-transform duration-300">
                        <Sparkles className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent mb-2">
                        Ayra
                    </h1>
                    <p className="text-text-muted text-lg">Nutrição Inteligente com IA</p>
                </div>

                {/* Demo Mode Notice */}
                <div className="mb-6 bg-primary/10 border border-primary/30 rounded-xl p-3 text-center">
                    <p className="text-primary text-sm font-medium">
                        🚀 Modo Demo - Use qualquer email para testar
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-background-light/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transform hover:scale-[1.02] transition-all duration-300">
                    <form onSubmit={handleAuth} className="space-y-5">
                        {/* Email Input */}
                        <div className="group">
                            <label className="block text-sm font-medium text-text-muted mb-2 group-focus-within:text-primary transition-colors">
                                E-mail
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    placeholder="demo@ayra.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group">
                            <label className="block text-sm font-medium text-text-muted mb-2 group-focus-within:text-primary transition-colors">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-black font-bold text-lg shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? 'Entrar no Demo' : 'Cadastrar'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Auth Mode */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all"
                        >
                            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-text-muted text-sm mt-6">
                    Transforme sua nutrição com inteligência artificial
                </p>
            </div>
        </div>
    );
}

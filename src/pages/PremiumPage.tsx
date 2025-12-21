// @ts-nocheck
import { Check, Crown, Zap, TrendingUp, MessageSquare, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PremiumPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isPremium = profile?.plano === 'premium';

    const features = {
        free: [
            'Registro diário de refeições',
            'Resumo de macronutrientes',
            'Contador de streak',
            '7 consultas com Ayra/dia',
            'Alertas de alergias'
        ],
        premium: [
            'Tudo do plano Free',
            'Gráficos de tendência avançados',
            'Chat ilimitado com Ayra',
            'Análise de progresso semanal',
            'Recomendações personalizadas',
            'Planejamento de refeições',
            'Suporte prioritário',
            'Sem anúncios'
        ]
    };

    if (isPremium) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-neon">
                        <Crown className="w-12 h-12 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Você já é Premium! 🎉</h1>
                    <p className="text-text-muted mb-6">Aproveite todos os recursos exclusivos</p>
                    <button
                        onClick={() => navigate('/inicio')}
                        className="bg-gradient-to-r from-primary to-secondary text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-transform"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10 border-b border-white/10">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-neon">
                        <Crown className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Desbloqueie o <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Premium</span>
                    </h1>
                    <p className="text-text-muted text-lg">Maximize seus resultados com IA avançada</p>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="p-6 space-y-4">
                {/* Free Plan */}
                <div className="glass rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white">Plano Grátis</h3>
                            <p className="text-text-muted text-sm">Recursos básicos</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">R$ 0</div>
                            <div className="text-xs text-text-muted">para sempre</div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {features.free.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-white/10 rounded-full p-1">
                                    <Check size={14} className="text-white" />
                                </div>
                                <span className="text-sm text-text-muted">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/5 rounded-xl p-3 text-center">
                        <span className="text-sm text-text-muted">Plano atual</span>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="relative glass rounded-2xl p-6 border-2 border-primary/50 shadow-neon-lg overflow-hidden">
                    {/* Popular Badge */}
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-secondary text-black text-xs font-bold px-3 py-1 rounded-full">
                        POPULAR
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="text-primary" size={20} />
                                Plano Premium
                            </h3>
                            <p className="text-text-muted text-sm">Recursos ilimitados</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                R$ 29,90
                            </div>
                            <div className="text-xs text-text-muted">por mês</div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        {features.premium.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full p-1">
                                    <Check size={14} className="text-primary" />
                                </div>
                                <span className="text-sm text-white font-medium">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/premium/checkout')}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        Começar Agora
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-xs text-text-muted mt-3">
                        Cancele quando quiser • Sem compromisso
                    </p>
                </div>
            </div>

            {/* Benefits Section */}
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    Por que escolher Premium?
                </h2>

                <div className="grid gap-4">
                    <div className="glass rounded-xl p-4 flex gap-4">
                        <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl h-fit">
                            <TrendingUp className="text-primary" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Análises Avançadas</h4>
                            <p className="text-sm text-text-muted">Gráficos detalhados de progresso e tendências</p>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4 flex gap-4">
                        <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-3 rounded-xl h-fit">
                            <MessageSquare className="text-primary" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Chat Ilimitado</h4>
                            <p className="text-sm text-text-muted">Converse com Ayra quantas vezes quiser</p>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4 flex gap-4">
                        <div className="bg-gradient-to-br from-primary/20 to-secondary/10 p-3 rounded-xl h-fit">
                            <Zap className="text-primary" size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-1">Resultados Mais Rápidos</h4>
                            <p className="text-sm text-text-muted">IA personalizada para otimizar sua nutrição</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guarantee */}
            <div className="p-6">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-full mb-3">
                        <Lock className="text-primary" size={20} />
                    </div>
                    <h4 className="font-bold text-white mb-2">Garantia de 7 dias</h4>
                    <p className="text-sm text-text-muted">
                        Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas.
                    </p>
                </div>
            </div>
        </div>
    );
}

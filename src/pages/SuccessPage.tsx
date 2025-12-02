// import { useNavigate } from 'react-router-dom'; // Não utilizado - usa window.location.href
import { Crown, Check, Sparkles } from 'lucide-react';

export default function SuccessPage() {
    // const navigate = useNavigate(); // Não utilizado - usa window.location.href

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 text-center max-w-md">
                {/* Success Animation */}
                <div className="mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-neon animate-bounce">
                        <Crown className="w-12 h-12 text-black" />
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sparkles className="text-primary animate-pulse" size={24} />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-white to-primary bg-clip-text text-transparent">
                            Bem-vindo ao Premium!
                        </h1>
                        <Sparkles className="text-primary animate-pulse" size={24} />
                    </div>

                    <p className="text-text-muted text-lg mb-8">
                        Sua assinatura foi ativada com sucesso
                    </p>
                </div>

                {/* Benefits */}
                <div className="glass rounded-2xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-white mb-4 text-center">Agora você tem acesso a:</h3>
                    <div className="space-y-3">
                        {[
                            'Gráficos de tendência desbloqueados',
                            'Chat ilimitado com Ayra',
                            'Análises avançadas de progresso',
                            'Recomendações personalizadas',
                            'Suporte prioritário'
                        ].map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full p-1">
                                    <Check size={16} className="text-primary" />
                                </div>
                                <span className="text-sm text-white">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => {
                        // Force reload to update auth context, then navigate
                        window.location.href = '/inicio';
                    }}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mb-4"
                >
                    Explorar Recursos Premium
                </button>

                <p className="text-xs text-text-muted">
                    Um email de confirmação foi enviado para você
                </p>
            </div>
        </div>
    );
}

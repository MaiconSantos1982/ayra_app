import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Check, ArrowLeft, Crown } from 'lucide-react';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.slice(0, 2) + '/' + v.slice(2, 4);
        }
        return v;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate payment processing
        setTimeout(() => {
            // Update user to premium in demo mode
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const user = JSON.parse(demoUser);
                user.plano = 'premium';
                localStorage.setItem('demo_user', JSON.stringify(user));
            }

            setLoading(false);
            navigate('/premium/success');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/premium')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="text-white" size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Finalizar Assinatura</h1>
                        <p className="text-xs text-text-muted">Pagamento seguro</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Crown className="text-primary" size={20} />
                        Resumo do Pedido
                    </h3>

                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Plano Premium</span>
                            <span className="text-white font-semibold">R$ 29,90/mês</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-muted">Desconto (Primeiro mês)</span>
                            <span className="text-primary font-semibold">-R$ 10,00</span>
                        </div>
                        <div className="h-px bg-white/10"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total hoje</span>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                R$ 19,90
                            </span>
                        </div>
                    </div>

                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-3">
                        <p className="text-xs text-primary text-center">
                            🎉 Oferta especial: 33% OFF no primeiro mês!
                        </p>
                    </div>
                </div>

                {/* Payment Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="text-primary" size={20} />
                            Dados do Cartão
                        </h3>

                        <div className="space-y-4">
                            {/* Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    Número do Cartão
                                </label>
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    maxLength={19}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Card Name */}
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-2">
                                    Nome no Cartão
                                </label>
                                <input
                                    type="text"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                    placeholder="NOME COMPLETO"
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Expiry & CVV */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        Validade
                                    </label>
                                    <input
                                        type="text"
                                        value={expiry}
                                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                        maxLength={5}
                                        placeholder="MM/AA"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-2">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                        maxLength={4}
                                        placeholder="123"
                                        className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
                        <Lock className="text-primary" size={20} />
                        <div>
                            <p className="text-sm font-medium text-white">Pagamento 100% Seguro</p>
                            <p className="text-xs text-text-muted">Seus dados são criptografados</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Lock size={20} />
                                Confirmar Pagamento - R$ 19,90
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-text-muted">
                        Ao confirmar, você concorda com nossos{' '}
                        <span className="text-primary">Termos de Uso</span>
                    </p>
                </form>

                {/* Features Reminder */}
                <div className="glass rounded-2xl p-6">
                    <h4 className="font-bold text-white mb-4">O que você ganha:</h4>
                    <div className="space-y-3">
                        {[
                            'Gráficos de tendência avançados',
                            'Chat ilimitado com Ayra',
                            'Análise de progresso semanal',
                            'Recomendações personalizadas'
                        ].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-primary/20 rounded-full p-1">
                                    <Check size={14} className="text-primary" />
                                </div>
                                <span className="text-sm text-text-muted">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

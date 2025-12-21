import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Target, AlertCircle } from 'lucide-react';
import { initializeUserData, getUserData } from '../lib/localStorage';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';

export default function OnboardingSimple() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        objetivo: '',
        restricoes: '',
    });
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Carrega dados existentes para edição
    useEffect(() => {
        const userData = getUserData();
        if (userData?.profile) {
            setFormData({
                nome: userData.profile.nome || '',
                objetivo: userData.profile.objetivo || '',
                restricoes: userData.profile.restricoes || '',
            });
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nome || !formData.objetivo) {
            setToast({ message: 'Por favor, preencha nome e objetivo.', type: 'warning' });
            return;
        }

        // Inicializa/atualiza dados do usuário
        initializeUserData({
            nome: formData.nome,
            objetivo: formData.objetivo,
            restricoes: formData.restricoes || undefined,
        });

        setToast({ message: 'Perfil atualizado com sucesso!', type: 'success' });
        setTimeout(() => navigate('/perfil'), 1500);
    };

    const objetivos = [
        { value: 'emagrecer', label: 'Emagrecer', emoji: '📉' },
        { value: 'ganhar_massa', label: 'Ganhar Massa', emoji: '💪' },
        { value: 'manter', label: 'Manter Peso', emoji: '⚖️' },
        { value: 'saude', label: 'Melhorar Saúde', emoji: '❤️' },
    ];

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/perfil')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="text-white" size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Editar Perfil Básico</h1>
                        <p className="text-xs text-text-muted">Atualize suas informações</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Nome */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-bold text-white">Nome</h3>
                    </div>

                    <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Digite seu nome"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                    />
                </div>

                {/* Objetivo */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-500/20 p-2 rounded-xl">
                            <Target className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="font-bold text-white">Objetivo Principal</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {objetivos.map((objetivo) => {
                            const isSelected = formData.objetivo === objetivo.value;

                            return (
                                <button
                                    key={objetivo.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, objetivo: objetivo.value })}
                                    className={`
                                        p-4 rounded-xl border-2 transition-all
                                        ${isSelected
                                            ? 'border-primary bg-primary/10 scale-105'
                                            : 'border-white/10 bg-card hover:border-white/20'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="text-3xl">{objetivo.emoji}</span>
                                        <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-white'}`}>
                                            {objetivo.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Restrições */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-yellow-500/20 p-2 rounded-xl">
                            <AlertCircle className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white">Restrições Alimentares</h3>
                            <p className="text-xs text-text-muted">Opcional</p>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={formData.restricoes}
                        onChange={(e) => setFormData({ ...formData, restricoes: e.target.value })}
                        placeholder="Ex: Lactose, glúten, vegetariano..."
                        className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
                >
                    <Save size={20} />
                    Salvar Alterações
                </button>

                {/* Cancel Button */}
                <button
                    type="button"
                    onClick={() => navigate('/perfil')}
                    className="w-full bg-card border border-white/10 text-white font-semibold py-3 rounded-xl hover:border-white/20 transition-colors"
                >
                    Cancelar
                </button>
            </form>

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

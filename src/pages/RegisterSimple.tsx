import { useState, useRef } from 'react';
import { Camera, X, Send, Coffee, Sun, Cookie, Moon, Pizza, Sandwich, IceCream } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addMeal, getUserData } from '../lib/localStorage';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const MEAL_TYPES = [
    { id: 'Café da manhã', label: 'Café da manhã', icon: Coffee, color: 'from-yellow-500 to-orange-500' },
    { id: 'Lanche da manhã', label: 'Lanche da manhã', icon: Cookie, color: 'from-orange-400 to-yellow-400' },
    { id: 'Almoço', label: 'Almoço', icon: Sun, color: 'from-orange-500 to-red-500' },
    { id: 'Lanche da tarde', label: 'Lanche da tarde', icon: IceCream, color: 'from-pink-500 to-purple-500' },
    { id: 'Jantar', label: 'Jantar', icon: Moon, color: 'from-purple-500 to-indigo-500' },
    { id: 'Ceia', label: 'Ceia', icon: Sandwich, color: 'from-indigo-500 to-blue-500' },
    { id: 'Outros', label: 'Outros', icon: Pizza, color: 'from-green-500 to-teal-500' },
];

export default function RegisterSimple() {
    const navigate = useNavigate();
    const [selectedMeal, setSelectedMeal] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estados para Toast e Modal
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [showDietModal, setShowDietModal] = useState(false);
    const [pendingMealType, setPendingMealType] = useState('');

    // Verifica se usuário tem dieta personalizada
    const userData = getUserData();
    const hasDiet = userData?.profile?.segueDieta && userData?.profile?.customDiet && userData.profile.customDiet.length > 0;

    // Handler para foto
    const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Handler para remover foto
    const removePhoto = () => {
        setPhoto(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handler para seleção de tipo de refeição
    const handleMealTypeSelect = (mealType: string) => {
        // Se tem dieta personalizada, pergunta se foi a mesma
        if (hasDiet) {
            const dietMeal = userData?.profile?.customDiet?.find(m => m.tipo === mealType);
            if (dietMeal) {
                setPendingMealType(mealType);
                setShowDietModal(true);
                return;
            }
        }

        // Se não tem dieta ou não encontrou refeição correspondente, seleciona normalmente
        setSelectedMeal(mealType);
    };

    // Handler para confirmar uso da dieta personalizada
    const handleUseDietMeal = () => {
        const dietMeal = userData?.profile?.customDiet?.find(m => m.tipo === pendingMealType);
        if (dietMeal) {
            setDescription(dietMeal.descricao);
            setSelectedMeal(pendingMealType);
            setShowDietModal(false);
            setToast({ message: 'Descrição preenchida com sua dieta!', type: 'success' });
        }
    };

    // Handler para NÃO usar dieta personalizada
    const handleCustomMeal = () => {
        setSelectedMeal(pendingMealType);
        setShowDietModal(false);
    };

    // Handler para enviar refeição
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMeal || !description.trim()) {
            setToast({ message: 'Selecione o tipo de refeição e descreva o que comeu.', type: 'warning' });
            return;
        }

        setLoading(true);

        try {
            // Salva refeição no localStorage
            addMeal({
                tipo: selectedMeal,
                descricao: description.trim(),
                foto: photo || undefined,
            });

            // Limpa formulário
            setSelectedMeal('');
            setDescription('');
            setPhoto(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setToast({ message: 'Refeição registrada com sucesso!', type: 'success' });
            setTimeout(() => navigate('/inicio'), 1500);
        } catch (error) {
            console.error('Erro ao registrar refeição:', error);
            setToast({ message: 'Erro ao registrar refeição. Tente novamente.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-b-3xl shadow-lg mb-6">
                <h1 className="text-2xl font-bold text-white">Registrar Refeição 🍽️</h1>
                <p className="text-purple-200 text-sm mt-1">
                    Conte-me o que você comeu
                </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 space-y-6">
                {/* Tipo de Refeição */}
                <div>
                    <label className="block text-white font-semibold mb-3">
                        Tipo de Refeição
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {MEAL_TYPES.map((meal) => {
                            const Icon = meal.icon;
                            const isSelected = selectedMeal === meal.id;

                            return (
                                <button
                                    key={meal.id}
                                    type="button"
                                    onClick={() => handleMealTypeSelect(meal.id)}
                                    className={`
                    relative p-4 rounded-2xl border-2 transition-all
                    ${isSelected
                                            ? 'border-primary bg-primary/10 scale-105'
                                            : 'border-white/10 bg-card hover:border-white/20'
                                        }
                  `}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`
                      p-3 rounded-xl bg-gradient-to-br ${meal.color}
                    `}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`
                      text-sm font-semibold
                      ${isSelected ? 'text-primary' : 'text-white'}
                    `}>
                                            {meal.label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                            <span className="text-background text-xs">✓</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-white font-semibold mb-3">
                        O que você comeu?
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Arroz, feijão, frango grelhado e salada"
                        rows={4}
                        className="w-full bg-card border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                        required
                    />
                    <p className="text-gray-400 text-xs mt-2">
                        Seja específico para a Ayra te ajudar melhor!
                    </p>
                </div>

                {/* Foto (Opcional) */}
                <div>
                    <label className="block text-white font-semibold mb-3">
                        Foto (Opcional)
                    </label>

                    {!photo ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full bg-card border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-primary/50 transition-colors"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-primary/20 p-4 rounded-full">
                                    <Camera className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-white font-semibold">Adicionar Foto</p>
                                <p className="text-gray-400 text-sm">Toque para tirar ou escolher</p>
                            </div>
                        </button>
                    ) : (
                        <div className="relative">
                            <img
                                src={photo}
                                alt="Preview"
                                className="w-full h-64 object-cover rounded-2xl"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute top-3 right-3 bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                    />
                </div>

                {/* Botão de Enviar */}
                <button
                    type="submit"
                    disabled={loading || !selectedMeal || !description.trim()}
                    className="w-full bg-gradient-to-r from-primary to-green-400 text-background font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Registrar Refeição
                        </>
                    )}
                </button>

                {/* Botão Cancelar */}
                <button
                    type="button"
                    onClick={() => navigate('/inicio')}
                    className="w-full bg-card border border-white/10 text-white font-semibold py-3 px-6 rounded-2xl hover:border-white/20 transition-colors"
                >
                    Cancelar
                </button>
            </form>

            {/* Dica */}
            <div className="px-6 mt-6">
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
                    <p className="text-primary font-semibold mb-1">💡 Dica</p>
                    <p className="text-sm text-gray-300">
                        Quanto mais detalhes você fornecer, melhor a Ayra poderá te orientar sobre sua alimentação!
                    </p>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Diet Confirmation Modal */}
            <ConfirmModal
                isOpen={showDietModal}
                title="Usar Dieta Personalizada?"
                message={`Você tem uma refeição cadastrada na sua dieta para "${pendingMealType}". Deseja usar a descrição da sua dieta?`}
                confirmText="Sim, usar dieta"
                cancelText="Não, vou descrever"
                type="info"
                onConfirm={handleUseDietMeal}
                onCancel={handleCustomMeal}
            />
        </div>
    );
}

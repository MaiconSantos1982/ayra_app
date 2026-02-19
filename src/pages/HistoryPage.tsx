import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Droplet, Dumbbell, Moon, Smile, Utensils, Crown, X, Target, ChevronDown } from 'lucide-react';
import { getUserData, getDailyData, getDailyNutrition } from '../lib/localStorage';
import { useNavigate } from 'react-router-dom';
import { getLocalDateKey } from '../lib/dateUtils';

export default function HistoryPage() {
    const navigate = useNavigate();
    const [userData] = useState(getUserData());
    const [selectedDate, setSelectedDate] = useState(getLocalDateKey());
    const [dayData, setDayData] = useState(getDailyData(selectedDate));
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [expanded, setExpanded] = useState({
        nutrition: true,
        summary: false
    });

    // Verifica se usuário é premium (por enquanto sempre false)
    const isPremium = userData?.premium || false;
    const FREE_HISTORY_DAYS = 3; // Free: 3 dias (hoje + 2 anteriores)

    useEffect(() => {
        setDayData(getDailyData(selectedDate));
    }, [selectedDate]);

    // Verifica se pode ver a data
    const canViewDate = (dateStr: string) => {
        if (isPremium) return true;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const targetDate = new Date(dateStr + 'T00:00:00');
        const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

        return diffDays < FREE_HISTORY_DAYS;
    };

    // Navega para o dia anterior
    const goToPreviousDay = () => {
        const date = new Date(selectedDate + 'T00:00:00'); // Garante hora local zerada
        date.setDate(date.getDate() - 1);
        const newDate = getLocalDateKey(date);

        if (!canViewDate(newDate)) {
            setShowUpgradeModal(true);
            return;
        }

        setSelectedDate(newDate);
    };

    // Navega para o próximo dia
    const goToNextDay = () => {
        const date = new Date(selectedDate + 'T00:00:00');
        date.setDate(date.getDate() + 1);
        const today = getLocalDateKey();
        const nextDate = getLocalDateKey(date);

        if (nextDate <= today) {
            setSelectedDate(nextDate);
        }
    };

    // Vai para hoje
    const goToToday = () => {
        setSelectedDate(getLocalDateKey());
    };

    // Verifica se é hoje
    const isToday = selectedDate === getLocalDateKey();

    // Formata data
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    // Emojis de humor
    const moodEmojis = {
        great: '😄',
        good: '🙂',
        ok: '😐',
        bad: '😔',
    };

    const moodLabels = {
        great: 'Ótimo',
        good: 'Bom',
        ok: 'Ok',
        bad: 'Ruim',
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Modal de Upgrade */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-yellow-500/30 relative">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 text-white/70 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="bg-yellow-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-10 h-10 text-yellow-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Upgrade para Premium
                            </h2>
                            <p className="text-slate-300">
                                Acesse histórico ilimitado e muito mais!
                            </p>
                        </div>

                        <div className="bg-white/10 rounded-2xl p-4 mb-6 space-y-2">
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm">Histórico ilimitado</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm">Chat ilimitado com Ayra</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm">Análise nutricional com IA</span>
                            </div>
                            <div className="flex items-center gap-2 text-white">
                                <span className="text-green-400">✓</span>
                                <span className="text-sm">Gráficos de evolução</span>
                            </div>
                        </div>

                        <button
                            onClick={() => window.open('https://www.ayrislife.com/ayra?utm_source=app&utm_medium=gratuito', '_blank')}
                            className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl hover:brightness-110 transition-all"
                        >
                            Fazer Upgrade Agora
                        </button>

                        <p className="text-center text-slate-300 text-xs mt-4">
                            Plano Free: Histórico de {FREE_HISTORY_DAYS} dias
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900/70 to-background p-6 rounded-b-3xl border-b border-white/5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">Histórico 📅</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/historico-nutricional')}
                            className="bg-primary text-black px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-colors"
                        >
                            <Target size={14} />
                            Histórico Nutricional
                        </button>
                        {!isPremium && (
                            <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                                <p className="text-yellow-500 text-xs font-semibold">
                                    {FREE_HISTORY_DAYS} dias
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navegação de Data */}
                <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
                    <button
                        onClick={goToPreviousDay}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-white" />
                    </button>

                    <div className="flex-1 text-center">
                        <p className="text-white font-semibold capitalize">
                            {formatDate(selectedDate)}
                        </p>
                        {!isToday && (
                            <button
                                onClick={goToToday}
                                className="text-primary text-xs mt-1 hover:underline"
                            >
                                Ir para hoje
                            </button>
                        )}
                    </div>

                    <button
                        onClick={goToNextDay}
                        disabled={isToday}
                        className={`p-2 rounded-lg transition-colors ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Nutritional Summary */}
            <div className="px-6 mb-6">
                <div className="glass rounded-2xl p-6">
                    <button
                        onClick={() => setExpanded((prev) => ({ ...prev, nutrition: !prev.nutrition }))}
                        className="w-full flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Target className="text-primary" size={20} />
                            <h2 className="text-lg font-bold text-white">Nutrição do Dia</h2>
                        </div>
                        <ChevronDown className={`text-slate-300 transition-transform ${expanded.nutrition ? 'rotate-180' : ''}`} size={18} />
                    </button>

                    {expanded.nutrition && (() => {
                        const nutrition = getDailyNutrition(selectedDate);
                        const hasNutrition = dayData.meals.length > 0 ||
                            nutrition.calorias > 0 ||
                            nutrition.proteina > 0 ||
                            nutrition.carboidratos > 0 ||
                            nutrition.gorduras > 0;

                        if (!hasNutrition) {
                            return (
                                <p className="text-center text-text-muted text-sm py-4">
                                    Nenhum valor nutricional registrado neste dia
                                </p>
                            );
                        }

                        return (
                            <div className="space-y-3 mt-4">
                                <div className="flex items-center justify-between p-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-gray-400">Calorias</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-primary">{nutrition.calorias.toFixed(0)}</span>
                                        <span className="text-xs text-gray-500">kcal</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-gray-400">Proteína</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-blue-400">{nutrition.proteina.toFixed(0)}</span>
                                        <span className="text-xs text-gray-500">g</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-gray-400">Carboidratos</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-yellow-400">{nutrition.carboidratos.toFixed(0)}</span>
                                        <span className="text-xs text-gray-500">g</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-2 border-b border-white/5 last:border-0">
                                    <span className="text-sm text-gray-400">Gorduras</span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-xl font-bold text-orange-400">{nutrition.gorduras.toFixed(0)}</span>
                                        <span className="text-xs text-gray-500">g</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Resumo do Dia */}
            <div className="px-6 mb-6">
                <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                    <button
                        onClick={() => setExpanded((prev) => ({ ...prev, summary: !prev.summary }))}
                        className="w-full flex items-center justify-between"
                    >
                        <h3 className="text-base font-semibold text-white">Resumo do Dia</h3>
                        <ChevronDown className={`text-slate-300 transition-transform ${expanded.summary ? 'rotate-180' : ''}`} size={18} />
                    </button>
                    {expanded.summary && <div className="space-y-4 mt-4">
                        {/* Água */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/10 p-2 rounded-full">
                                    <Droplet className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-base font-medium text-white">Água</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">{(dayData.water / 1000).toFixed(1)}L</p>
                                <p className="text-xs text-gray-500">Meta: {((userData?.goals.water || 2000) / 1000).toFixed(1)}L</p>
                            </div>
                        </div>

                        {/* Exercício */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-500/10 p-2 rounded-full">
                                    <Dumbbell className="w-5 h-5 text-orange-400" />
                                </div>
                                <span className="text-base font-medium text-white">Exercício</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">{dayData.exercise ? 'Feito' : 'Não'}</p>
                                <p className="text-xs text-gray-500">Meta: {userData?.goals.exercise || 30} min</p>
                            </div>
                        </div>

                        {/* Sono */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500/10 p-2 rounded-full">
                                    <Moon className="w-5 h-5 text-indigo-300" />
                                </div>
                                <span className="text-base font-medium text-white">Sono</span>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-bold text-white">{dayData.sleep}h</p>
                                <p className="text-xs text-gray-500">Meta: {userData?.goals.sleep || 8}h</p>
                            </div>
                        </div>

                        {/* Humor */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-500/10 p-2 rounded-full">
                                    <Smile className="w-5 h-5 text-yellow-400" />
                                </div>
                                <span className="text-base font-medium text-white">Humor</span>
                            </div>
                            <div className="text-right flex items-center gap-2">
                                <span className="text-2xl">{dayData.mood ? moodEmojis[dayData.mood] : '😶'}</span>
                                <span className="text-sm text-gray-400">{dayData.mood ? moodLabels[dayData.mood] : '-'}</span>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>

            {/* Refeições do Dia */}
            <div className="px-6 mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <Utensils className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-white">
                        Refeições ({dayData.meals.length})
                    </h2>
                </div>

                {dayData.meals.length === 0 ? (
                    <div className="bg-slate-900/40 rounded-2xl p-6 text-center border border-white/5">
                        <p className="text-gray-400">Nenhuma refeição registrada neste dia</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayData.meals.map((meal) => (
                            <div
                                key={meal.id}
                                className="bg-slate-900/40 rounded-2xl p-4 border border-white/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-primary font-semibold text-sm">
                                                {meal.tipo}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(meal.timestamp).toLocaleTimeString('pt-BR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-white text-sm">{meal.descricao}</p>
                                    </div>
                                    {meal.foto && (
                                        <img
                                            src={meal.foto}
                                            alt="Refeição"
                                            className="w-20 h-20 rounded-xl object-cover ml-3 cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => window.open(meal.foto, '_blank')}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Peso do Dia (se registrado) */}
            {
                dayData.weight && (
                    <div className="px-6 mb-6">
                        <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-3 rounded-xl">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Peso registrado</p>
                                    <p className="text-2xl font-bold text-white">{dayData.weight} kg</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Botão para voltar */}
            <div className="px-6">
                <button
                    onClick={() => navigate('/inicio')}
                    className="w-full bg-slate-900/40 border border-white/10 text-white font-semibold py-3 px-6 rounded-2xl hover:border-white/20 transition-colors"
                >
                    Voltar ao Início
                </button>
            </div>
        </div >
    );
}

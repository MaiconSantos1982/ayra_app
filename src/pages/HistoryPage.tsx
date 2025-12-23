import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Droplet, Dumbbell, Moon, Smile, Utensils, Crown, X } from 'lucide-react';
import { getUserData, getDailyData } from '../lib/localStorage';
import { useNavigate } from 'react-router-dom';

export default function HistoryPage() {
    const navigate = useNavigate();
    const [userData] = useState(getUserData());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayData, setDayData] = useState(getDailyData(selectedDate));
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        const newDate = date.toISOString().split('T')[0];

        if (!canViewDate(newDate)) {
            setShowUpgradeModal(true);
            return;
        }

        setSelectedDate(newDate);
    };

    // Navega para o próximo dia
    const goToNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        const today = new Date().toISOString().split('T')[0];
        if (date.toISOString().split('T')[0] <= today) {
            setSelectedDate(date.toISOString().split('T')[0]);
        }
    };

    // Vai para hoje
    const goToToday = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
    };

    // Verifica se é hoje
    const isToday = selectedDate === new Date().toISOString().split('T')[0];

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
                    <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-6 max-w-md w-full border border-yellow-500/30 relative">
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
                            <p className="text-purple-200">
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
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-2xl hover:scale-105 transition-transform"
                        >
                            Fazer Upgrade Agora
                        </button>

                        <p className="text-center text-purple-200 text-xs mt-4">
                            Plano Free: Histórico de {FREE_HISTORY_DAYS} dias
                        </p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-b-3xl shadow-lg mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-white">Histórico 📅</h1>
                    {!isPremium && (
                        <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                            <p className="text-yellow-500 text-xs font-semibold">
                                {FREE_HISTORY_DAYS} dias
                            </p>
                        </div>
                    )}
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

            {/* Resumo do Dia */}
            <div className="px-6 mb-6">
                <div className="grid grid-cols-2 gap-3">
                    {/* Água */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplet className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-gray-400">Água</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {(dayData.water / 1000).toFixed(1)}L
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Meta: {((userData?.goals.water || 2000) / 1000).toFixed(1)}L
                        </p>
                    </div>

                    {/* Exercício */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Dumbbell className="w-5 h-5 text-orange-400" />
                            <span className="text-sm text-gray-400">Exercício</span>
                        </div>
                        <p className="text-2xl font-bold text-white">
                            {dayData.exercise ? 'Feito ✓' : 'Não'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Meta: {userData?.goals.exercise || 30} min
                        </p>
                    </div>

                    {/* Sono */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-5 h-5 text-purple-400" />
                            <span className="text-sm text-gray-400">Sono</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{dayData.sleep}h</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Meta: {userData?.goals.sleep || 8}h
                        </p>
                    </div>

                    {/* Humor */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Smile className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Humor</span>
                        </div>
                        <p className="text-3xl mb-1">
                            {dayData.mood ? moodEmojis[dayData.mood] : '😶'}
                        </p>
                        <p className="text-xs text-gray-500">
                            {dayData.mood ? moodLabels[dayData.mood] : 'Não registrado'}
                        </p>
                    </div>
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
                    <div className="bg-card rounded-2xl p-6 text-center border border-white/5">
                        <p className="text-gray-400">Nenhuma refeição registrada neste dia</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {dayData.meals.map((meal) => (
                            <div
                                key={meal.id}
                                className="bg-card rounded-2xl p-4 border border-white/5"
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
            {dayData.weight && (
                <div className="px-6 mb-6">
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-4 border border-purple-500/20">
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
            )}

            {/* Botão para voltar */}
            <div className="px-6">
                <button
                    onClick={() => navigate('/inicio')}
                    className="w-full bg-card border border-white/10 text-white font-semibold py-3 px-6 rounded-2xl hover:border-white/20 transition-colors"
                >
                    Voltar ao Início
                </button>
            </div>
        </div>
    );
}

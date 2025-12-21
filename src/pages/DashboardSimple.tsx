import { Flame, Droplet, Dumbbell, Moon, Smile, TrendingUp, Camera, Plus, Minus, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserData, getDailyData, getStats, updateWater, updateExercise, updateSleep, updateMood } from '../lib/localStorage';

export default function DashboardSimple() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(getUserData());
    const [todayData, setTodayData] = useState(getDailyData());
    const [stats, setStats] = useState(getStats());
    const [showSleepInput, setShowSleepInput] = useState(false);
    const [showMoodSelector, setShowMoodSelector] = useState(false);

    useEffect(() => {
        // Verifica se usuário tem dados, senão redireciona para onboarding
        const data = getUserData();
        if (!data) {
            navigate('/onboarding');
            return;
        }

        // Função para recarregar dados
        const reloadData = () => {
            setUserData(getUserData());
            setTodayData(getDailyData());
            setStats(getStats());
        };

        // Recarrega dados quando a página é focada
        window.addEventListener('focus', reloadData);

        // Recarrega dados a cada 5 segundos (para pegar atualizações de outras abas)
        const interval = setInterval(reloadData, 5000);

        return () => {
            window.removeEventListener('focus', reloadData);
            clearInterval(interval);
        };
    }, [navigate]);

    // Handlers para atualizar hábitos
    const handleAddWater = (amount: number) => {
        const newAmount = Math.max(0, todayData.water + amount);
        updateWater(newAmount);
        setTodayData(getDailyData());
    };

    const handleToggleExercise = () => {
        updateExercise(!todayData.exercise);
        setTodayData(getDailyData());
    };

    const handleUpdateSleep = (hours: number) => {
        updateSleep(hours);
        setTodayData(getDailyData());
        setShowSleepInput(false);
    };

    const handleUpdateMood = (mood: 'great' | 'good' | 'ok' | 'bad') => {
        updateMood(mood);
        setTodayData(getDailyData());
        setShowMoodSelector(false);
    };

    // Calcula progresso de água
    const waterProgress = userData?.goals.water
        ? (todayData.water / userData.goals.water) * 100
        : 0;

    // Calcula progresso de sono
    const sleepProgress = userData?.goals.sleep
        ? (todayData.sleep / userData.goals.sleep) * 100
        : 0;

    // Emoji de humor
    const moodEmojis = {
        great: '😄',
        good: '🙂',
        ok: '😐',
        bad: '😔',
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Olá, {userData?.profile.nome || 'Usuário'}! 👋
                        </h1>
                        <p className="text-purple-200 text-sm mt-1">
                            {new Date().toLocaleDateString('pt-BR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                            })}
                        </p>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-3 rounded-xl">
                                <Flame className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Sequência</p>
                                <p className="text-2xl font-bold text-white">{stats?.streak || 0} dias</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/70 text-sm">Total de refeições</p>
                            <p className="text-xl font-bold text-primary">{stats?.totalMeals || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 -mt-6 mb-6">
                <button
                    onClick={() => navigate('/registro')}
                    className="w-full bg-gradient-to-r from-primary to-green-400 text-background font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                >
                    <Camera className="w-6 h-6" />
                    Registrar Refeição
                </button>
            </div>

            {/* Refeições de Hoje */}
            <div className="px-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-bold text-white">Refeições de Hoje</h2>
                    <button
                        onClick={() => navigate('/historico')}
                        className="text-primary text-sm font-semibold hover:underline"
                    >
                        Ver Histórico →
                    </button>
                </div>

                {todayData.meals.length === 0 ? (
                    <div className="bg-card rounded-2xl p-6 text-center border border-white/5">
                        <p className="text-gray-400">Nenhuma refeição registrada ainda</p>
                        <p className="text-sm text-gray-500 mt-1">Comece registrando sua primeira refeição!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayData.meals.slice(-3).reverse().map((meal) => (
                            <div
                                key={meal.id}
                                className="bg-card rounded-2xl p-4 border border-white/5 hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-primary font-semibold text-sm">{meal.tipo}</p>
                                        <p className="text-white mt-1">{meal.descricao}</p>
                                        <p className="text-gray-500 text-xs mt-2">
                                            {new Date(meal.timestamp).toLocaleTimeString('pt-BR', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    {meal.foto && (
                                        <img
                                            src={meal.foto}
                                            alt="Refeição"
                                            className="w-16 h-16 rounded-xl object-cover ml-3"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lifestyle Tracking */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Hábitos de Hoje</h2>

                <div className="grid grid-cols-2 gap-3">
                    {/* Água */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Droplet className="w-5 h-5 text-blue-400" />
                            <span className="text-sm text-gray-400">Água</span>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-white">
                                {(todayData.water / 1000).toFixed(1)}L
                            </p>
                            <p className="text-xs text-gray-500">
                                Meta: {((userData?.goals.water || 2000) / 1000).toFixed(1)}L
                            </p>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                            <div
                                className="bg-blue-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(waterProgress, 100)}%` }}
                            />
                        </div>
                        {/* Botões de controle */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddWater(-250)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <Minus className="w-4 h-4" />
                                <span className="text-xs">250ml</span>
                            </button>
                            <button
                                onClick={() => handleAddWater(250)}
                                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="text-xs">250ml</span>
                            </button>
                        </div>
                    </div>

                    {/* Exercício */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Dumbbell className="w-5 h-5 text-orange-400" />
                            <span className="text-sm text-gray-400">Exercício</span>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-white">
                                {todayData.exercise ? 'Feito' : 'Não'}
                            </p>
                            <p className="text-xs text-gray-500">
                                Meta: {userData?.goals.exercise || 30} min
                            </p>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                            <div
                                className={`h-2 rounded-full transition-all ${todayData.exercise ? 'bg-orange-400 w-full' : 'bg-white/20 w-0'
                                    }`}
                            />
                        </div>
                        {/* Botão de toggle */}
                        <button
                            onClick={handleToggleExercise}
                            className={`w-full p-2 rounded-lg transition-all flex items-center justify-center gap-2 ${todayData.exercise
                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-white/5 text-white hover:bg-white/10'
                                }`}
                        >
                            {todayData.exercise ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span className="text-xs">Feito!</span>
                                </>
                            ) : (
                                <>
                                    <X className="w-4 h-4" />
                                    <span className="text-xs">Marcar como feito</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Sono */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Moon className="w-5 h-5 text-purple-400" />
                            <span className="text-sm text-gray-400">Sono</span>
                        </div>
                        <div className="mb-2">
                            <p className="text-2xl font-bold text-white">
                                {todayData.sleep}h
                            </p>
                            <p className="text-xs text-gray-500">
                                Meta: {userData?.goals.sleep || 8}h
                            </p>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                            <div
                                className="bg-purple-400 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(sleepProgress, 100)}%` }}
                            />
                        </div>
                        {/* Input de sono */}
                        {showSleepInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="24"
                                    step="0.5"
                                    defaultValue={todayData.sleep}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleUpdateSleep(parseFloat((e.target as HTMLInputElement).value));
                                        }
                                    }}
                                    className="flex-1 bg-white/10 text-white px-2 py-1 rounded-lg text-sm focus:outline-none focus:bg-white/20"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setShowSleepInput(false)}
                                    className="bg-white/5 hover:bg-white/10 text-white px-2 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSleepInput(true)}
                                className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-colors text-xs"
                            >
                                Registrar sono
                            </button>
                        )}
                    </div>

                    {/* Humor */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Smile className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm text-gray-400">Humor</span>
                        </div>
                        <div className="mb-2">
                            <p className="text-3xl">
                                {todayData.mood ? moodEmojis[todayData.mood] : '😶'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {todayData.mood ? 'Registrado' : 'Não registrado'}
                            </p>
                        </div>
                        {/* Seletor de humor */}
                        {showMoodSelector ? (
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => handleUpdateMood('great')}
                                    className="bg-green-500/20 hover:bg-green-500/30 text-2xl p-1 rounded-lg transition-colors"
                                >
                                    😄
                                </button>
                                <button
                                    onClick={() => handleUpdateMood('good')}
                                    className="bg-blue-500/20 hover:bg-blue-500/30 text-2xl p-1 rounded-lg transition-colors"
                                >
                                    🙂
                                </button>
                                <button
                                    onClick={() => handleUpdateMood('ok')}
                                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-2xl p-1 rounded-lg transition-colors"
                                >
                                    😐
                                </button>
                                <button
                                    onClick={() => handleUpdateMood('bad')}
                                    className="bg-red-500/20 hover:bg-red-500/30 text-2xl p-1 rounded-lg transition-colors"
                                >
                                    😔
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowMoodSelector(true)}
                                className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded-lg transition-colors text-xs"
                            >
                                {todayData.mood ? 'Alterar humor' : 'Registrar humor'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Peso Atual */}
            {userData?.profile.peso && (
                <div className="px-6 mb-6">
                    <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-2xl p-4 border border-purple-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-3 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-white/70 text-sm">Peso Atual</p>
                                    <p className="text-2xl font-bold text-white">
                                        {userData.profile.peso} kg
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/progresso')}
                                className="text-primary text-sm font-semibold hover:underline"
                            >
                                Ver Progresso
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Tips */}
            <div className="px-6 mb-6">
                <div className="bg-gradient-to-r from-primary/10 to-green-400/10 rounded-2xl p-4 border border-primary/20">
                    <p className="text-primary font-semibold mb-1">💡 Dica do Dia</p>
                    <p className="text-sm text-gray-300">
                        Beba água regularmente ao longo do dia. Mantenha-se hidratado!
                    </p>
                </div>
            </div>
        </div>
    );
}

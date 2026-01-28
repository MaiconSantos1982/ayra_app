import { Flame, Droplet, Dumbbell, Moon, Smile, TrendingUp, Camera, Plus, Minus, Check, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserData, getDailyData, getStats, updateWater, updateExercise, updateSleep, updateMood, getDailyNutrition } from '../lib/localStorage';

export default function DashboardSimple() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(getUserData());
    const [todayData, setTodayData] = useState(getDailyData());
    const [stats, setStats] = useState(getStats());
    const [showSleepInput, setShowSleepInput] = useState(false);


    useEffect(() => {
        // Verifica se usuário tem dados, senão redireciona para onboarding
        const data = getUserData();
        if (!data) {
            navigate('/onboarding');
            return;
        }

        // Função para recarregar dados
        const loadData = () => {
            setUserData(getUserData());
            setTodayData(getDailyData());
            setStats(getStats());
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
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
    };





    // Emoji de humor
    const moodEmojis = {
        great: '😄',
        good: '🙂',
        ok: '😐',
        bad: '😔',
    };

    // Calcular resumo mensal
    const monthlyOverview = (() => {
        if (!userData) return {
            daysWithinGoal: 0,
            daysExceeded: 0,
            averages: { calories: 0, carbs: 0, protein: 0, fat: 0 },
            goals: { calories: 0, carbs: 0, protein: 0, fat: 0 }
        };

        const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
        const goals = userData.goals;
        const tolerance = 0.1; // 10%

        let daysWithinGoal = 0;
        let daysExceeded = 0;

        let totalStats = {
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0
        };
        let validDaysCount = 0;

        Object.values(userData.dailyRecords).forEach(day => {
            if (day.date.startsWith(currentMonth) && day.meals.length > 0) {
                // Calcular totais do dia
                const dailyTotals = day.meals.reduce((acc, meal) => ({
                    calories: acc.calories + (meal.calorias || 0),
                    carbs: acc.carbs + (meal.carboidratos || 0),
                    protein: acc.protein + (meal.proteina || 0),
                    fat: acc.fat + (meal.gorduras || 0)
                }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

                // Verificação de Dias na Meta (baseado em Calorias)
                const lowerBound = goals.calories * (1 - tolerance);
                const upperBound = goals.calories * (1 + tolerance);

                if (dailyTotals.calories >= lowerBound && dailyTotals.calories <= upperBound) {
                    daysWithinGoal++;
                } else {
                    daysExceeded++;
                }

                // Somar para médias
                totalStats.calories += dailyTotals.calories;
                totalStats.carbs += dailyTotals.carbs;
                totalStats.protein += dailyTotals.protein;
                totalStats.fat += dailyTotals.fat;
                validDaysCount++;
            }
        });

        const averages = {
            calories: validDaysCount ? Math.round(totalStats.calories / validDaysCount) : 0,
            carbs: validDaysCount ? Math.round(totalStats.carbs / validDaysCount) : 0,
            protein: validDaysCount ? Math.round(totalStats.protein / validDaysCount) : 0,
            fat: validDaysCount ? Math.round(totalStats.fat / validDaysCount) : 0
        };

        return {
            daysWithinGoal,
            daysExceeded,
            averages,
            goals: {
                calories: goals.calories,
                carbs: goals.carbs,
                protein: goals.protein,
                fat: goals.fat
            }
        };
    })();

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-6 rounded-b-3xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Olá, {userData?.profile.nome || 'Usuário'} 👋
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
                    className="w-full bg-gradient-to-r from-primary to-green-400 text-background font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform mb-3"
                >
                    <Camera className="w-6 h-6" />
                    Registrar Refeição
                </button>
                <button
                    onClick={() => navigate('/historico-nutricional')}
                    className="w-full bg-[#202C33] border border-white/10 text-white font-bold py-3 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform hover:bg-[#2A3942]"
                >
                    <Target className="w-5 h-5 text-primary" />
                    Histórico Nutricional
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

            {/* Nutrição de Hoje */}
            <div className="px-6 mb-6">
                <div className="bg-card/50 border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-primary/20 p-2 rounded-full">
                            <Target className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Nutrição de Hoje</h2>
                    </div>

                    {(() => {
                        const nutrition = getDailyNutrition(new Date().toISOString().split('T')[0]);
                        const hasNutrition = nutrition.calorias > 0 || nutrition.proteina > 0 || nutrition.carboidratos > 0 || nutrition.gorduras > 0;

                        if (!hasNutrition) {
                            return (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 mb-4">Nenhum dado registrado hoje</p>
                                    <button
                                        onClick={() => navigate('/registro')}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Registrar primeira refeição
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-6">
                                {/* Calorias - Destaque */}
                                <div className="flex items-end justify-between bg-white/5 rounded-2xl p-5 border border-white/5">
                                    <div>
                                        <p className="text-gray-400 font-medium mb-1">Calorias</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-white tracking-tight">
                                                {nutrition.calorias.toFixed(0)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-500">kcal</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-primary" style={{ width: '40%' }}></div> {/* Exemplo de barra visual */}
                                    </div>
                                </div>

                                {/* Macros - Grid Limpo */}
                                {/* Macros - Lista Vertical */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/10 p-2 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            <span className="text-gray-300 font-medium">Proteína</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-blue-400">{nutrition.proteina.toFixed(0)}</span>
                                            <span className="text-xs text-gray-500">g</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-yellow-500/10 p-2 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            </div>
                                            <span className="text-gray-300 font-medium">Carboidratos</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-yellow-400">{nutrition.carboidratos.toFixed(0)}</span>
                                            <span className="text-xs text-gray-500">g</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-500/10 p-2 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                            </div>
                                            <span className="text-gray-300 font-medium">Gorduras</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-bold text-orange-400">{nutrition.gorduras.toFixed(0)}</span>
                                            <span className="text-xs text-gray-500">g</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botão Histórico - Grande e Visível */}
                                <button
                                    onClick={() => navigate('/historico-nutricional')}
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <TrendingUp size={20} className="stroke-[3]" />
                                    VER HISTÓRICO COMPLETO
                                </button>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {/* Resumo Mensal de Metas (Novo) */}
            {monthlyOverview && (monthlyOverview.daysWithinGoal > 0 || monthlyOverview.daysExceeded > 0) && (
                <div className="px-6 mb-6">
                    <div className="bg-card/50 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-purple-500/20 p-2 rounded-full">
                                <Target className="text-purple-400 w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Resumo do Mês</h2>
                        </div>

                        {/* Card Inicial: Dias na Meta */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 text-center bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                                <span className="text-3xl font-bold text-green-500 block">{monthlyOverview.daysWithinGoal}</span>
                                <span className="text-xs text-green-300 font-medium uppercase tracking-wide">Dias na Meta</span>
                            </div>
                            <div className="flex-1 text-center bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                                <span className="text-3xl font-bold text-red-500 block">{monthlyOverview.daysExceeded}</span>
                                <span className="text-xs text-red-300 font-medium uppercase tracking-wide">Dias Fora</span>
                            </div>
                        </div>

                        {/* Novas Barras de Metas (Macros) */}
                        <div className="space-y-5">
                            {[
                                { label: 'Carboidratos', current: monthlyOverview.averages.carbs, goal: monthlyOverview.goals.carbs, unit: 'g' },
                                { label: 'Proteínas', current: monthlyOverview.averages.protein, goal: monthlyOverview.goals.protein, unit: 'g' },
                                { label: 'Gorduras', current: monthlyOverview.averages.fat, goal: monthlyOverview.goals.fat, unit: 'g' },
                                { label: 'Calorias', current: monthlyOverview.averages.calories, goal: monthlyOverview.goals.calories, unit: 'kcal' }
                            ].map((item) => {
                                const percentage = item.goal > 0 ? (item.current / item.goal) * 100 : 0;
                                let colorClass = 'bg-green-500';
                                let textColorClass = 'text-green-500';

                                // Lógica de cores baseada em quão acima da meta está
                                if (percentage > 120) {
                                    colorClass = 'bg-red-500';
                                    textColorClass = 'text-red-500';
                                } else if (percentage > 110) {
                                    colorClass = 'bg-orange-500';
                                    textColorClass = 'text-orange-500';
                                } else if (percentage > 100) {
                                    colorClass = 'bg-yellow-500';
                                    textColorClass = 'text-yellow-500';
                                }

                                return (
                                    <div key={item.label}>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400 font-medium">{item.label}</span>
                                            <span className={textColorClass + " font-bold"}>
                                                {item.current} / {item.goal}{item.unit}
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-gray-700/50 rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className={`h-full ${colorClass} transition-all duration-500`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-xs text-gray-500 mt-6 border-t border-white/5 pt-4">
                            *Médias diárias baseadas nos dias com registros.
                            <br />
                            Cores indicam o nível de desvio da meta.
                        </p>
                    </div>
                </div>
            )}

            {/* Lifestyle Tracking */}
            <div className="px-6 mb-6">
                <h2 className="text-lg font-bold text-white mb-3">Hábitos de Hoje</h2>

                <div className="space-y-3">
                    {/* Água */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/10 p-2 rounded-full">
                                    <Droplet className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <span className="block text-base font-semibold text-white">Água</span>
                                    <span className="text-xs text-gray-500">Meta: {((userData?.goals.water || 2000) / 1000).toFixed(1)}L</span>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white">{(todayData.water / 1000).toFixed(1)}L</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleAddWater(-250)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white p-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleAddWater(250)}
                                className="flex-[2] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Adicionar
                            </button>
                        </div>
                    </div>

                    {/* Exercício */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-500/10 p-2 rounded-full">
                                <Dumbbell className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <span className="block text-base font-semibold text-white">Exercício</span>
                                <span className="text-xs text-gray-500">Meta: {userData?.goals.exercise || 30} min</span>
                            </div>
                        </div>

                        <button
                            onClick={handleToggleExercise}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${todayData.exercise
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {todayData.exercise ? (
                                <> <Check size={16} /> Concluído </>
                            ) : (
                                'Marcar Feito'
                            )}
                        </button>
                    </div>

                    {/* Sono */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500/10 p-2 rounded-full">
                                    <Moon className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <span className="block text-base font-semibold text-white">Sono</span>
                                    <span className="text-xs text-gray-500">Meta: {userData?.goals.sleep || 8}h</span>
                                </div>
                            </div>

                            {!showSleepInput ? (
                                <button
                                    onClick={() => setShowSleepInput(true)}
                                    className="bg-white/5 px-4 py-2 rounded-xl text-white font-bold hover:bg-white/10"
                                >
                                    {todayData.sleep}h
                                </button>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleUpdateSleep(Math.max(0, todayData.sleep - 1))}
                                        className="p-2 bg-white/5 rounded-lg text-white"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-xl font-bold w-8 text-center">{todayData.sleep}</span>
                                    <button
                                        onClick={() => handleUpdateSleep(todayData.sleep + 1)}
                                        className="p-2 bg-white/5 rounded-lg text-white"
                                    >
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => setShowSleepInput(false)}
                                        className="ml-2 text-primary"
                                    >
                                        <Check size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Humor */}
                    <div className="bg-card rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-500/10 p-2 rounded-full">
                                    <Smile className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <span className="block text-base font-semibold text-white">Humor</span>
                                    <span className="text-xs text-gray-500">
                                        {todayData.mood ? 'Registrado' : 'Como você está?'}
                                    </span>
                                </div>
                            </div>

                            {todayData.mood && (
                                <div className="text-3xl animate-in fade-in zoom-in">
                                    {moodEmojis[todayData.mood]}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between gap-2">
                            {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                                <button
                                    key={mood}
                                    onClick={() => handleUpdateMood(mood)}
                                    className={`flex-1 p-3 rounded-xl transition-all ${todayData.mood === mood
                                        ? 'bg-yellow-500/20 border border-yellow-500/50 scale-105 shadow-lg shadow-yellow-500/10'
                                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    <div className="text-2xl text-center mb-1">{moodEmojis[mood]}</div>
                                    <p className={`text-[10px] text-center font-medium ${todayData.mood === mood ? 'text-yellow-400' : 'text-gray-500'}`}>
                                        {mood === 'great' ? 'Ótimo' :
                                            mood === 'good' ? 'Bom' :
                                                mood === 'ok' ? 'Ok' : 'Ruim'}
                                    </p>
                                </button>
                            ))}
                        </div>
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
                                onClick={() => navigate('/historico')}
                                className="text-primary text-sm font-semibold hover:underline"
                            >
                                Ver Histórico
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

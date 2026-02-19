import { Flame, Droplet, Dumbbell, Moon, Smile, TrendingUp, Camera, Plus, Minus, Check, Target, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserData, getDailyData, getStats, updateWater, updateExercise, updateSleep, updateMood, getDailyNutrition } from '../lib/localStorage';
import { getLocalDateKey, getLocalMonthKey } from '../lib/dateUtils';

export default function DashboardSimple() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(getUserData());
    const [todayData, setTodayData] = useState(getDailyData());
    const [stats, setStats] = useState(getStats());
    const [showSleepInput, setShowSleepInput] = useState(false);
    const [sleepDraft, setSleepDraft] = useState(getDailyData().sleep || 0);
    const [expandedSections, setExpandedSections] = useState({
        nutrition: false,
        habits: false,
        monthly: false,
    });

    useEffect(() => {
        const data = getUserData();
        if (!data) {
            navigate('/onboarding');
            return;
        }

        const loadData = () => {
            setUserData(getUserData());
            setTodayData(getDailyData());
            setStats(getStats());
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, [navigate]);

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

    const openSleepEditor = () => {
        setSleepDraft(todayData.sleep || 0);
        setShowSleepInput(true);
    };

    const adjustSleepDraft = (delta: number) => {
        setSleepDraft((prev) => Math.max(0, Math.min(24, prev + delta)));
    };

    const setSleepPreset = (hours: number) => {
        setSleepDraft(hours);
    };

    const confirmSleepDraft = () => {
        handleUpdateSleep(sleepDraft);
    };

    const handleUpdateMood = (mood: 'great' | 'good' | 'ok' | 'bad') => {
        updateMood(mood);
        setTodayData(getDailyData());
    };

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

    const nutrition = getDailyNutrition(getLocalDateKey());
    const hasNutrition = todayData.meals.length > 0 ||
        nutrition.calorias > 0 ||
        nutrition.proteina > 0 ||
        nutrition.carboidratos > 0 ||
        nutrition.gorduras > 0;

    const monthlyOverview = (() => {
        if (!userData) return {
            daysWithinGoal: 0,
            daysExceeded: 0,
            averages: { calories: 0, carbs: 0, protein: 0, fat: 0 },
            goals: { calories: 0, carbs: 0, protein: 0, fat: 0 }
        };

        const currentMonth = getLocalMonthKey();
        const goals = userData.goals;
        const tolerance = 0.1;

        let daysWithinGoal = 0;
        let daysExceeded = 0;
        let totalStats = { calories: 0, carbs: 0, protein: 0, fat: 0 };
        let validDaysCount = 0;

        Object.values(userData.dailyRecords).forEach(day => {
            if (day.date.startsWith(currentMonth) && day.meals.length > 0) {
                const dailyTotals = day.meals.reduce((acc, meal) => ({
                    calories: acc.calories + (meal.calorias || 0),
                    carbs: acc.carbs + (meal.carboidratos || 0),
                    protein: acc.protein + (meal.proteina || 0),
                    fat: acc.fat + (meal.gorduras || 0)
                }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

                const lowerBound = goals.calories * (1 - tolerance);
                const upperBound = goals.calories * (1 + tolerance);

                if (dailyTotals.calories >= lowerBound && dailyTotals.calories <= upperBound) {
                    daysWithinGoal++;
                } else {
                    daysExceeded++;
                }

                totalStats.calories += dailyTotals.calories;
                totalStats.carbs += dailyTotals.carbs;
                totalStats.protein += dailyTotals.protein;
                totalStats.fat += dailyTotals.fat;
                validDaysCount++;
            }
        });

        return {
            daysWithinGoal,
            daysExceeded,
            averages: {
                calories: validDaysCount ? Math.round(totalStats.calories / validDaysCount) : 0,
                carbs: validDaysCount ? Math.round(totalStats.carbs / validDaysCount) : 0,
                protein: validDaysCount ? Math.round(totalStats.protein / validDaysCount) : 0,
                fat: validDaysCount ? Math.round(totalStats.fat / validDaysCount) : 0
            },
            goals: {
                calories: goals.calories,
                carbs: goals.carbs,
                protein: goals.protein,
                fat: goals.fat
            }
        };
    })();

    const toggleSection = (key: 'nutrition' | 'habits' | 'monthly') => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="bg-gradient-to-b from-slate-900/70 to-background p-6 rounded-b-3xl border-b border-white/5">
                <h1 className="text-2xl font-bold text-white">Olá, {userData?.profile.nome || 'Usuário'}</h1>
                <p className="text-text-muted text-sm mt-1">
                    {new Date().toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </p>

                <div className="mt-4 bg-slate-800/60 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/15 p-2 rounded-lg">
                                <Flame className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">Sequência</p>
                                <p className="text-xl font-bold text-white">{stats?.streak || 0} dias</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-xs">Refeições</p>
                            <p className="text-xl font-bold text-white">{stats?.totalMeals || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-4 mb-6 space-y-3">
                <button
                    onClick={() => navigate('/registro')}
                    className="btn-elevated w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Camera className="w-5 h-5" />
                    Registrar Refeição
                </button>
                <button
                    onClick={() => navigate('/historico-nutricional')}
                    className="btn-elevated w-full bg-slate-900/40 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors hover:bg-white/10 flex items-center justify-center gap-2"
                >
                    <Target className="w-4 h-4 text-primary" />
                    Histórico Nutricional
                </button>
            </div>

            <div className="px-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-white">Refeições de Hoje</h2>
                    <button
                        onClick={() => navigate('/historico')}
                        className="text-primary text-sm font-medium hover:underline"
                    >
                        Ver histórico
                    </button>
                </div>

                {todayData.meals.length === 0 ? (
                    <div className="bg-slate-900/40 rounded-2xl p-6 text-center border border-white/5">
                        <p className="text-slate-300">Nenhuma refeição registrada ainda</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayData.meals.slice(-3).reverse().map((meal) => (
                            <div key={meal.id} className="bg-slate-900/40 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-primary font-medium text-sm">{meal.tipo}</p>
                                        <p className="text-white mt-1">{meal.descricao}</p>
                                        <p className="text-slate-500 text-xs mt-2">
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
                                            className="w-14 h-14 rounded-lg object-cover ml-3"
                                        />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6 mb-4">
                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="text-primary w-5 h-5" />
                            <h2 className="text-lg font-semibold text-white">Nutrição de Hoje</h2>
                        </div>
                        <button
                            onClick={() => toggleSection('nutrition')}
                            className="text-slate-300 hover:text-white transition-colors"
                        >
                            <ChevronDown
                                size={18}
                                className={`transition-transform ${expandedSections.nutrition ? 'rotate-180' : ''}`}
                            />
                        </button>
                    </div>

                    {hasNutrition ? (
                        <div className="mt-4">
                            <p className="text-slate-400 text-sm">Calorias</p>
                            <p className="text-4xl font-bold text-white mt-1">
                                {nutrition.calorias.toFixed(0)}
                                <span className="text-lg text-slate-500 ml-1">kcal</span>
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 text-slate-300 text-sm">Nenhum dado registrado hoje.</div>
                    )}

                    {expandedSections.nutrition && hasNutrition && (
                        <div className="mt-5 space-y-2">
                            <div className="flex items-center justify-between text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2">
                                <span>Proteína</span>
                                <span className="text-blue-300 font-semibold">{nutrition.proteina.toFixed(0)}g</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2">
                                <span>Carboidratos</span>
                                <span className="text-yellow-300 font-semibold">{nutrition.carboidratos.toFixed(0)}g</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-slate-300 bg-white/5 rounded-lg px-3 py-2">
                                <span>Gorduras</span>
                                <span className="text-orange-300 font-semibold">{nutrition.gorduras.toFixed(0)}g</span>
                            </div>
                            <button
                                onClick={() => navigate('/historico-nutricional')}
                                className="mt-2 w-full bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-lg transition-colors"
                            >
                                Ver histórico completo
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 mb-4">
                <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                    <button
                        onClick={() => toggleSection('habits')}
                        className="w-full flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                    >
                        <h2 className="text-lg font-semibold text-white">Hábitos de Hoje</h2>
                        <ChevronDown
                            size={18}
                            className={`text-slate-300 transition-transform ${expandedSections.habits ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {!expandedSections.habits && (
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div className="bg-white/5 rounded-lg py-2">
                                <p className="text-slate-400 text-xs">Água</p>
                                <p className="text-white text-sm font-semibold">{(todayData.water / 1000).toFixed(1)}L</p>
                            </div>
                            <div className="bg-white/5 rounded-lg py-2">
                                <p className="text-slate-400 text-xs">Exercício</p>
                                <p className="text-white text-sm font-semibold">{todayData.exercise ? 'Feito' : 'Pendente'}</p>
                            </div>
                            <div className="bg-white/5 rounded-lg py-2">
                                <p className="text-slate-400 text-xs">Sono</p>
                                <p className="text-white text-sm font-semibold">{todayData.sleep}h</p>
                            </div>
                        </div>
                    )}

                    {expandedSections.habits && (
                        <div className="mt-4 space-y-3">
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <Droplet className="w-4 h-4 text-primary" />
                                        Água
                                    </div>
                                    <p className="text-white font-semibold">{(todayData.water / 1000).toFixed(1)}L</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddWater(-250)}
                                        className="flex-1 bg-slate-700/60 hover:bg-slate-600/60 text-white p-2 rounded-lg transition-colors"
                                    >
                                        <Minus className="w-4 h-4 mx-auto" />
                                    </button>
                                    <button
                                        onClick={() => handleAddWater(250)}
                                        className="flex-[2] bg-primary/15 hover:bg-primary/25 text-primary p-2 rounded-lg transition-colors font-medium"
                                    >
                                        Adicionar 250ml
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <Dumbbell className="w-4 h-4 text-primary" />
                                    Exercício
                                </div>
                                <button
                                    onClick={handleToggleExercise}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${todayData.exercise
                                        ? 'bg-primary/20 text-primary'
                                        : 'bg-slate-700/60 text-slate-200'
                                        }`}
                                >
                                    {todayData.exercise ? 'Concluído' : 'Marcar feito'}
                                </button>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-white">
                                        <Moon className="w-4 h-4 text-primary" />
                                        Sono
                                    </div>
                                    {!showSleepInput ? (
                                        <button
                                            onClick={openSleepEditor}
                                            className="bg-slate-700/60 px-3 py-1.5 rounded-lg text-white text-sm"
                                        >
                                            {todayData.sleep}h
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                {[4, 6, 8].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        onClick={() => setSleepPreset(preset)}
                                                        className={`px-2 py-1 rounded-md text-xs transition-colors ${sleepDraft === preset ? 'bg-primary/20 text-primary' : 'bg-slate-700/50 text-slate-300'}`}
                                                    >
                                                        {preset}h
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => adjustSleepDraft(-1)}
                                                className="p-1.5 bg-slate-700/60 rounded-lg text-white"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-white w-8 text-center">{sleepDraft}</span>
                                            <button
                                                onClick={() => adjustSleepDraft(1)}
                                                className="p-1.5 bg-slate-700/60 rounded-lg text-white"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <button onClick={confirmSleepDraft} className="text-primary">
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 text-white">
                                        <Smile className="w-4 h-4 text-primary" />
                                        Humor
                                    </div>
                                    {todayData.mood && <span className="text-2xl">{moodEmojis[todayData.mood]}</span>}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                                        <button
                                            key={mood}
                                            onClick={() => handleUpdateMood(mood)}
                                            className={`rounded-lg py-2 text-xs ${todayData.mood === mood
                                                ? 'bg-primary/20 text-primary'
                                                : 'bg-slate-700/50 text-slate-300'
                                                }`}
                                        >
                                            {moodLabels[mood]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {(monthlyOverview.daysWithinGoal > 0 || monthlyOverview.daysExceeded > 0) && (
                <div className="px-6 mb-6">
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
                        <button
                            onClick={() => toggleSection('monthly')}
                            className="w-full flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                        >
                            <h2 className="text-lg font-semibold text-white">Resumo do Mês</h2>
                            <ChevronDown
                                size={18}
                                className={`text-slate-300 transition-transform ${expandedSections.monthly ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {expandedSections.monthly && (
                            <div className="mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-primary">{monthlyOverview.daysWithinGoal}</p>
                                        <p className="text-xs text-text-muted">Dias na meta</p>
                                    </div>
                                    <div className="bg-rose-500/10 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-rose-300">{monthlyOverview.daysExceeded}</p>
                                        <p className="text-xs text-rose-200">Dias fora</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span>Calorias médias</span>
                                        <span>{monthlyOverview.averages.calories} / {monthlyOverview.goals.calories} kcal</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Proteínas médias</span>
                                        <span>{monthlyOverview.averages.protein} / {monthlyOverview.goals.protein} g</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Carboidratos médios</span>
                                        <span>{monthlyOverview.averages.carbs} / {monthlyOverview.goals.carbs} g</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Gorduras médias</span>
                                        <span>{monthlyOverview.averages.fat} / {monthlyOverview.goals.fat} g</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {userData?.profile.peso && (
                <div className="px-6 mb-6">
                    <div className="bg-slate-900/40 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-slate-400 text-xs">Peso atual</p>
                                <p className="text-white text-lg font-semibold">{userData.profile.peso} kg</p>
                            </div>
                        </div>
                        <button onClick={() => navigate('/historico')} className="text-primary text-sm hover:underline">
                            Ver histórico
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

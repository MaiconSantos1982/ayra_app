import { AlertTriangle, Flame, Lock, TrendingUp, Target, Zap, Droplet, Dumbbell, Moon, Award, Scale, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface DailyProgress {
    calories: number;
    caloriesGoal: number;
    protein: number;
    proteinGoal: number;
    carbs: number;
    carbsGoal: number;
    fat: number;
    fatGoal: number;
    water: number;
    waterGoal: number;
    exercise: boolean;
    exerciseGoal: number;
    sleep: number;
    sleepGoal: number;
    mood: 'great' | 'good' | 'ok' | 'bad' | null;
    weight: number | null;
}

export default function Dashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [metas, setMetas] = useState<any>(null);
    const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
        calories: 1250,
        caloriesGoal: 2200,
        protein: 85,
        proteinGoal: 150,
        carbs: 120,
        carbsGoal: 250,
        fat: 45,
        fatGoal: 70,
        water: 1500,
        waterGoal: 2500,
        exercise: true,
        exerciseGoal: 5,
        sleep: 7,
        sleepGoal: 8,
        mood: 'good',
        weight: null
    });

    useEffect(() => {
        loadMetas();
        loadTodayLifestyle();
    }, []);

    const loadMetas = () => {
        const demoMetas = localStorage.getItem('demo_metas');
        if (demoMetas) {
            const metasData = JSON.parse(demoMetas);
            setMetas(metasData);

            // Update goals from metas
            setDailyProgress(prev => ({
                ...prev,
                caloriesGoal: metasData.calorias_diarias || prev.caloriesGoal,
                proteinGoal: metasData.proteina_g || prev.proteinGoal,
                carbsGoal: metasData.carboidrato_g || prev.carbsGoal,
                fatGoal: metasData.gordura_g || prev.fatGoal,
                waterGoal: metasData.agua_ml || prev.waterGoal,
                exerciseGoal: metasData.dias_exercicio_semana || prev.exerciseGoal,
                sleepGoal: metasData.horas_sono || prev.sleepGoal
            }));
        }
    };

    const loadTodayLifestyle = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayLifestyle = localStorage.getItem(`demo_lifestyle_${today}`);
        if (todayLifestyle) {
            const lifestyleData = JSON.parse(todayLifestyle);
            setDailyProgress(prev => ({
                ...prev,
                water: lifestyleData.agua_ml || 0,
                exercise: lifestyleData.exercicio_feito || false,
                sleep: lifestyleData.horas_sono ? parseFloat(lifestyleData.horas_sono) : prev.sleep,
                mood: lifestyleData.humor || null,
                weight: lifestyleData.peso_kg ? parseFloat(lifestyleData.peso_kg) : null
            }));
        }
    };

    const streakDays = 12;
    const isPremium = profile?.plano === 'premium';
    const hasAllergy = profile?.restricoes?.toLowerCase().includes('amendoim');

    const getProgress = (current: number, goal: number) => Math.min((current / goal) * 100, 100);

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'from-primary to-primary/60';
        if (percentage >= 70) return 'from-yellow-400 to-yellow-500';
        if (percentage >= 50) return 'from-orange-400 to-orange-500';
        return 'from-red-400 to-red-500';
    };

    const weeklyConsistency = 5; // Mock: dias que bateu as metas esta semana
    const consistencyGoal = metas?.meta_consistencia_dias || 5;

    return (
        <div className="space-y-6 pb-6">
            {/* Header */}
            <header className="animate-fade-in">
                <h1 className="text-3xl font-bold text-white mb-1">
                    Olá, <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{profile?.nome || 'Atleta'}</span>
                </h1>
                <p className="text-text-muted flex items-center gap-2">
                    <Zap size={16} className="text-primary" />
                    Vamos bater a meta hoje?
                </p>
            </header>

            {/* Allergy Warning */}
            {(hasAllergy || true) && (
                <div className="glass rounded-2xl p-4 flex items-center gap-3 text-primary border-primary/30 animate-slide-up shadow-lg">
                    <div className="bg-primary/20 p-2 rounded-xl">
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Alerta de Alergia</p>
                        <p className="text-xs text-primary/80">Amendoim - Checar rótulos</p>
                    </div>
                </div>
            )}

            {/* Weekly Consistency - RAINHA DAS MÉTRICAS */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up border-2 border-primary/30">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                            <Award className="text-primary" size={20} />
                            Consistência Semanal
                        </h3>
                        <p className="text-xs text-text-muted">A rainha das métricas 👑</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{weeklyConsistency}/{consistencyGoal}</div>
                        <div className="text-xs text-text-muted">dias</div>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-3">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                        <div key={index} className="text-center">
                            <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${index < weeklyConsistency
                                ? 'bg-gradient-to-br from-primary to-secondary text-black shadow-neon'
                                : 'bg-white/5 text-text-muted'
                                }`}>
                                {day}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${getProgressColor(getProgress(weeklyConsistency, consistencyGoal))} shadow-neon transition-all duration-500`}
                        style={{ width: `${getProgress(weeklyConsistency, consistencyGoal)}%` }}
                    ></div>
                </div>

                {weeklyConsistency >= 4 && (
                    <p className="text-xs text-primary text-center mt-2">
                        🎉 Excelente! Continue assim!
                    </p>
                )}
            </div>

            {/* Streak Card */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">Sequência</h3>
                        <p className="text-xs text-text-muted">Continue assim! 🎯</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-xl">
                        <Flame className="text-primary" size={24} />
                    </div>
                </div>
                <div className="flex items-end gap-2 mb-3">
                    <span className="text-4xl font-bold text-primary">{streakDays}</span>
                    <span className="text-text-muted mb-1">dias seguidos</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 shadow-neon transition-all duration-500"
                        style={{ width: '80%' }}
                    ></div>
                </div>
            </div>

            {/* Weekly Ranking Card */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up border-2 border-yellow-500/30 relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                                <TrendingUp className="text-yellow-500" size={20} />
                                Ranking Semanal
                            </h3>
                            <p className="text-xs text-text-muted">Você está entre os melhores! 🏆</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 px-3 py-1 rounded-full border border-yellow-500/30">
                            <span className="text-yellow-500 font-bold text-sm">#3</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 mb-4 border border-yellow-500/20">
                        <div className="text-center mb-2">
                            <div className="text-3xl font-bold text-yellow-500 mb-1">2.340</div>
                            <div className="text-xs text-text-muted">pontos esta semana</div>
                        </div>
                        <div className="text-center">
                            <span className="text-xs text-yellow-500">🎯 Top 5 de 1.247 membros</span>
                        </div>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="text-xs font-semibold text-text-muted mb-2">⭐ Top 5 Mais Engajados</div>

                        {[
                            { pos: 1, name: 'Maria Silva', points: 2450, emoji: '🥇', isUser: false },
                            { pos: 2, name: 'João Santos', points: 2380, emoji: '🥈', isUser: false },
                            { pos: 3, name: 'Você', points: 2340, emoji: '🥉', isUser: true },
                            { pos: 4, name: 'Carlos Lima', points: 2290, emoji: '4️⃣', isUser: false },
                            { pos: 5, name: 'Ana Costa', points: 2250, emoji: '5️⃣', isUser: false },
                        ].map((user) => (
                            <div
                                key={user.pos}
                                className={`flex items-center justify-between p-2 rounded-lg transition-all ${user.isUser
                                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 shadow-neon'
                                    : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{user.emoji}</span>
                                    <span className={`text-sm font-semibold ${user.isUser ? 'text-primary' : 'text-white'}`}>
                                        {user.name}
                                    </span>
                                    {user.isUser && <span className="text-xs">✨</span>}
                                </div>
                                <span className="text-sm font-bold text-yellow-500">{user.points} pts</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate('/ranking')}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 font-semibold text-sm hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
                    >
                        Ver Ranking Completo →
                    </button>

                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <p className="text-xs text-primary text-center">
                            💪 Continue assim para manter sua posição no pódio!
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Card */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up hover:scale-[1.02] transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                            <TrendingUp className="text-primary" size={20} />
                            Meu Progresso
                        </h3>
                        <p className="text-xs text-text-muted">Veja sua evolução</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-xl">
                        <Scale className="text-primary" size={24} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-text-muted mb-1">Peso Atual</div>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold text-white">80.0</span>
                            <span className="text-xs text-text-muted mb-0.5">kg</span>
                        </div>
                        <div className="text-xs text-green-500 font-semibold">-2.5 kg</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-text-muted mb-1">Consistência</div>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-bold text-white">86</span>
                            <span className="text-xs text-text-muted mb-0.5">%</span>
                        </div>
                        <div className="text-xs text-primary font-semibold">+15%</div>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/progresso')}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary font-semibold text-sm hover:from-primary/30 hover:to-secondary/30 transition-all flex items-center justify-center gap-2"
                >
                    <TrendingUp size={16} />
                    Ver Evolução Completa
                </button>
            </div>

            {/* Achievements Card */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up border-2 border-yellow-500/30 relative overflow-hidden">
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-full blur-3xl"></div>

                <div className="relative">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                                <Award className="text-yellow-500" size={20} />
                                Minhas Conquistas
                            </h3>
                            <p className="text-xs text-text-muted">Suas badges e troféus</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 px-3 py-1 rounded-full border border-yellow-500/30">
                            <span className="text-yellow-500 font-bold text-sm">4/12</span>
                        </div>
                    </div>

                    {/* Recent Badges */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            { icon: '🔥', color: 'from-orange-500 to-red-500', unlocked: true },
                            { icon: '🎯', color: 'from-primary to-secondary', unlocked: true },
                            { icon: '🏆', color: 'from-yellow-500 to-yellow-600', unlocked: true },
                            { icon: '⭐', color: 'from-pink-500 to-rose-500', unlocked: true },
                        ].map((badge, i) => (
                            <div
                                key={i}
                                className={`bg-gradient-to-br ${badge.color} p-3 rounded-xl text-center shadow-lg`}
                            >
                                <span className="text-2xl">{badge.icon}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-text-muted">Progresso</span>
                            <span className="text-yellow-500 font-semibold">33%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg transition-all duration-500"
                                style={{ width: '33%' }}
                            ></div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/conquistas')}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 font-semibold text-sm hover:from-yellow-500/30 hover:to-orange-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <Award size={16} />
                        Ver Todas as Conquistas
                    </button>

                    <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                        <p className="text-xs text-yellow-500 text-center">
                            🎉 Última conquista: <span className="font-bold">Top 5 Semanal</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Lifestyle Goals Grid */}
            {metas && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Water */}
                    {metas.agua_ml && (
                        <div className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-2 mb-3">
                                <Droplet className="text-blue-400" size={18} />
                                <span className="text-sm font-medium text-white">Água</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {dailyProgress.water}<span className="text-sm text-text-muted">ml</span>
                            </div>
                            <div className="text-xs text-text-muted mb-2">
                                Meta: {dailyProgress.waterGoal}ml
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-blue-500 transition-all"
                                    style={{ width: `${getProgress(dailyProgress.water, dailyProgress.waterGoal)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Exercise */}
                    {metas.dias_exercicio_semana && (
                        <div className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-2 mb-3">
                                <Dumbbell className="text-primary" size={18} />
                                <span className="text-sm font-medium text-white">Exercício</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {dailyProgress.exercise ? '✓' : '—'}
                            </div>
                            <div className="text-xs text-text-muted mb-2">
                                Meta: {dailyProgress.exerciseGoal}x/semana
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${dailyProgress.exercise ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-white/10'}`}
                                    style={{ width: dailyProgress.exercise ? '100%' : '0%' }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Sleep */}
                    {metas.horas_sono && (
                        <div className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-2 mb-3">
                                <Moon className="text-purple-400" size={18} />
                                <span className="text-sm font-medium text-white">Sono</span>
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {dailyProgress.sleep}<span className="text-sm text-text-muted">h</span>
                            </div>
                            <div className="text-xs text-text-muted mb-2">
                                Meta: {dailyProgress.sleepGoal}h
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-400 to-purple-500 transition-all"
                                    style={{ width: `${getProgress(dailyProgress.sleep, dailyProgress.sleepGoal)}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Mood */}
                    <div className="glass rounded-xl p-4 hover:scale-[1.02] transition-transform">
                        <div className="flex items-center gap-2 mb-3">
                            <Smile className="text-yellow-400" size={18} />
                            <span className="text-sm font-medium text-white">Humor</span>
                        </div>
                        <div className="text-2xl mb-1">
                            {dailyProgress.mood === 'great' && '😄'}
                            {dailyProgress.mood === 'good' && '🙂'}
                            {dailyProgress.mood === 'ok' && '😐'}
                            {dailyProgress.mood === 'bad' && '😔'}
                            {!dailyProgress.mood && '—'}
                        </div>
                        <div className="text-xs text-text-muted">
                            {dailyProgress.mood === 'great' && 'Ótimo!'}
                            {dailyProgress.mood === 'good' && 'Bem'}
                            {dailyProgress.mood === 'ok' && 'Normal'}
                            {dailyProgress.mood === 'bad' && 'Ruim'}
                            {!dailyProgress.mood && 'Não registrado'}
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Nutrition */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1">Consumo Hoje</h3>
                        <p className="text-xs text-text-muted">Macronutrientes</p>
                    </div>
                    <div className="bg-gradient-to-br from-secondary/20 to-secondary/10 p-2 rounded-xl">
                        <Target size={20} className="text-primary" />
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Calories */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-white">Calorias</span>
                            <span className="text-sm text-text-muted">
                                {dailyProgress.calories} / {dailyProgress.caloriesGoal} kcal
                            </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${getProgressColor(getProgress(dailyProgress.calories, dailyProgress.caloriesGoal))} transition-all duration-500`}
                                style={{ width: `${getProgress(dailyProgress.calories, dailyProgress.caloriesGoal)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                        <div className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-bold text-white mb-1">{dailyProgress.protein}g</div>
                            <div className="text-xs text-text-muted mb-2">Proteína</div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-400"
                                    style={{ width: `${getProgress(dailyProgress.protein, dailyProgress.proteinGoal)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-bold text-white mb-1">{dailyProgress.carbs}g</div>
                            <div className="text-xs text-text-muted mb-2">Carbos</div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400"
                                    style={{ width: `${getProgress(dailyProgress.carbs, dailyProgress.carbsGoal)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
                            <div className="text-2xl font-bold text-white mb-1">{dailyProgress.fat}g</div>
                            <div className="text-xs text-text-muted mb-2">Gordura</div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-orange-400"
                                    style={{ width: `${getProgress(dailyProgress.fat, dailyProgress.fatGoal)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Trend Graph */}
            <div className="glass rounded-2xl p-6 shadow-xl animate-slide-up relative overflow-hidden group">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="font-bold text-white text-lg mb-1 flex items-center gap-2">
                            <TrendingUp size={20} className="text-primary" />
                            Análise Semanal
                        </h3>
                        <p className="text-xs text-text-muted">Peso vs. Calorias</p>
                    </div>
                    <span className="text-xs bg-gradient-to-r from-primary/20 to-secondary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-semibold">
                        Premium
                    </span>
                </div>

                <div className="relative h-40 w-full mt-4">
                    <svg viewBox="0 0 300 100" className={`w-full h-full transition-all duration-300 ${!isPremium ? 'blur-md opacity-40' : ''}`}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#39ff14" />
                                <stop offset="100%" stopColor="#6a0dad" />
                            </linearGradient>
                        </defs>
                        <polyline
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            points="0,80 50,60 100,70 150,40 200,50 250,20 300,30"
                        />
                        <polyline
                            fill="none"
                            stroke="#6a0dad"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            points="0,50 50,55 100,45 150,60 200,55 250,65 300,60"
                        />
                    </svg>

                    {!isPremium && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-background/60 backdrop-blur-sm rounded-xl">
                            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-3 rounded-full mb-3">
                                <Lock className="text-primary" size={24} />
                            </div>
                            <button
                                onClick={() => navigate('/premium')}
                                className="bg-gradient-to-r from-primary to-secondary text-black font-bold py-3 px-6 rounded-xl text-sm shadow-neon hover:shadow-neon-lg hover:scale-105 active:scale-95 transition-all duration-300"
                            >
                                Desbloquear Premium
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { TrendingUp, TrendingDown, Calendar, Award, Target, Droplet, Dumbbell, Moon, Scale, ChevronRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Não utilizado no momento

export default function ProgressPage() {
    const navigate = useNavigate();
    // const { profile } = useAuth(); // Não utilizado no momento

    // Mock data - em produção viria do backend
    const weightData = [
        { date: '01/11', weight: 82.5 },
        { date: '05/11', weight: 82.2 },
        { date: '08/11', weight: 81.8 },
        { date: '12/11', weight: 81.5 },
        { date: '15/11', weight: 81.2 },
        { date: '18/11', weight: 80.9 },
        { date: '22/11', weight: 80.5 },
        { date: '25/11', weight: 80.2 },
        { date: '27/11', weight: 80.0 },
    ];

    const weeklyConsistency = [
        { week: 'Sem 1', percentage: 71, days: 5 },
        { week: 'Sem 2', percentage: 86, days: 6 },
        { week: 'Sem 3', percentage: 100, days: 7 },
        { week: 'Sem 4', percentage: 86, days: 6 },
    ];

    const monthlyStats = {
        avgCalories: 2150,
        avgProtein: 165,
        avgCarbs: 220,
        avgFat: 65,
        avgWater: 2800,
        exerciseDays: 18,
        totalDays: 30,
        avgSleep: 7.5,
        streakRecord: 12,
        currentStreak: 12,
        mealsLogged: 126,
        goalsHit: 24,
    };

    const improvements = [
        { metric: 'Peso', value: -2.5, unit: 'kg', percentage: -3.0, isPositive: true },
        { metric: 'Consistência', value: +15, unit: '%', percentage: +15, isPositive: true },
        { metric: 'Exercício', value: +6, unit: 'dias', percentage: +50, isPositive: true },
        { metric: 'Sono', value: +0.5, unit: 'h', percentage: +7, isPositive: true },
    ];

    const maxWeight = Math.max(...weightData.map(d => d.weight));
    const minWeight = Math.min(...weightData.map(d => d.weight));
    const weightRange = maxWeight - minWeight;

    const getWeightY = (weight: number) => {
        return ((maxWeight - weight) / weightRange) * 100;
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-background border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/inicio')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="text-white rotate-180" size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <TrendingUp className="text-primary" size={20} />
                            Meu Progresso
                        </h1>
                        <p className="text-xs text-text-muted">Últimos 30 dias</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Scale className="text-primary" size={16} />
                            <span className="text-xs text-text-muted">Peso Atual</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-white">80.0</span>
                            <span className="text-sm text-text-muted mb-0.5">kg</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingDown className="text-green-500" size={12} />
                            <span className="text-xs text-green-500 font-semibold">-2.5 kg</span>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="text-primary" size={16} />
                            <span className="text-xs text-text-muted">Sequência</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-white">12</span>
                            <span className="text-sm text-text-muted mb-0.5">dias</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <Award className="text-yellow-500" size={12} />
                            <span className="text-xs text-yellow-500 font-semibold">Recorde!</span>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="text-primary" size={16} />
                            <span className="text-xs text-text-muted">Metas Batidas</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-white">24</span>
                            <span className="text-sm text-text-muted mb-0.5">/ 30</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="text-primary" size={12} />
                            <span className="text-xs text-primary font-semibold">80%</span>
                        </div>
                    </div>

                    <div className="glass rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Dumbbell className="text-primary" size={16} />
                            <span className="text-xs text-text-muted">Exercícios</span>
                        </div>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-bold text-white">18</span>
                            <span className="text-sm text-text-muted mb-0.5">dias</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="text-green-500" size={12} />
                            <span className="text-xs text-green-500 font-semibold">+50%</span>
                        </div>
                    </div>
                </div>

                {/* Improvements Banner */}
                <div className="glass rounded-2xl p-6 border-2 border-primary/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 p-2 rounded-lg">
                            <TrendingUp className="text-primary" size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Você está evoluindo! 🎉</h3>
                            <p className="text-xs text-text-muted">Comparado ao mês passado</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {improvements.map((item, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-3">
                                <div className="text-xs text-text-muted mb-1">{item.metric}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-lg font-bold ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.value > 0 ? '+' : ''}{item.value}{item.unit}
                                    </span>
                                    <span className={`text-xs font-semibold ${item.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                        ({item.percentage > 0 ? '+' : ''}{item.percentage}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weight Chart */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <Scale className="text-primary" size={20} />
                                Evolução do Peso
                            </h3>
                            <p className="text-xs text-text-muted">Últimos 30 dias</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-green-500">-2.5 kg</div>
                            <div className="text-xs text-text-muted">Perdidos</div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-48 mb-4">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-xs text-text-muted">
                            <span>{maxWeight.toFixed(1)}</span>
                            <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
                            <span>{minWeight.toFixed(1)}</span>
                        </div>

                        {/* Chart area */}
                        <div className="ml-12 h-full relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="border-t border-white/5"></div>
                                ))}
                            </div>

                            {/* Line chart */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                {/* Gradient fill */}
                                <defs>
                                    <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(57, 255, 20)" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="rgb(57, 255, 20)" stopOpacity="0" />
                                    </linearGradient>
                                </defs>

                                {/* Area */}
                                <path
                                    d={`M 0,${getWeightY(weightData[0].weight)} ${weightData.map((d, i) =>
                                        `L ${(i / (weightData.length - 1)) * 100},${getWeightY(d.weight)}`
                                    ).join(' ')} L 100,100 L 0,100 Z`}
                                    fill="url(#weightGradient)"
                                />

                                {/* Line */}
                                <polyline
                                    points={weightData.map((d, i) =>
                                        `${(i / (weightData.length - 1)) * 100},${getWeightY(d.weight)}`
                                    ).join(' ')}
                                    fill="none"
                                    stroke="rgb(57, 255, 20)"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                />

                                {/* Points */}
                                {weightData.map((d, i) => (
                                    <circle
                                        key={i}
                                        cx={`${(i / (weightData.length - 1)) * 100}%`}
                                        cy={`${getWeightY(d.weight)}%`}
                                        r="3"
                                        fill="rgb(57, 255, 20)"
                                        className="drop-shadow-[0_0_4px_rgba(57,255,20,0.8)]"
                                    />
                                ))}
                            </svg>
                        </div>
                    </div>

                    {/* X-axis labels */}
                    <div className="ml-12 flex justify-between text-xs text-text-muted">
                        {weightData.filter((_, i) => i % 2 === 0).map((d, i) => (
                            <span key={i}>{d.date}</span>
                        ))}
                    </div>
                </div>

                {/* Weekly Consistency Chart */}
                <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                <Calendar className="text-primary" size={20} />
                                Consistência Semanal
                            </h3>
                            <p className="text-xs text-text-muted">Últimas 4 semanas</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-primary">86%</div>
                            <div className="text-xs text-text-muted">Média</div>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="space-y-4">
                        {weeklyConsistency.map((week, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white font-medium">{week.week}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-text-muted">{week.days}/7 dias</span>
                                        <span className="text-sm font-bold text-primary">{week.percentage}%</span>
                                    </div>
                                </div>
                                <div className="h-8 bg-white/5 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${week.percentage === 100
                                            ? 'bg-gradient-to-r from-primary to-secondary shadow-neon'
                                            : week.percentage >= 80
                                                ? 'bg-gradient-to-r from-primary/80 to-primary/60'
                                                : 'bg-gradient-to-r from-yellow-500/80 to-yellow-500/60'
                                            }`}
                                        style={{ width: `${week.percentage}%` }}
                                    >
                                        {week.percentage === 100 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-xs font-bold text-black">🔥 Perfeito!</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Statistics */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Award className="text-primary" size={20} />
                        Estatísticas do Mês
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/20 p-2 rounded-lg">
                                    <Target className="text-primary" size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Média de Calorias</div>
                                    <div className="text-xs text-text-muted">Por dia</div>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-primary">{monthlyStats.avgCalories}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Droplet className="text-blue-400" size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Média de Água</div>
                                    <div className="text-xs text-text-muted">Por dia</div>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-blue-400">{monthlyStats.avgWater}ml</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-500/20 p-2 rounded-lg">
                                    <Moon className="text-purple-400" size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Média de Sono</div>
                                    <div className="text-xs text-text-muted">Por noite</div>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-purple-400">{monthlyStats.avgSleep}h</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-500/20 p-2 rounded-lg">
                                    <Flame className="text-yellow-500" size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Refeições Registradas</div>
                                    <div className="text-xs text-text-muted">No mês</div>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-yellow-500">{monthlyStats.mealsLogged}</span>
                        </div>
                    </div>
                </div>

                {/* Macros Breakdown */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4">Média de Macros</h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white">Proteína</span>
                                <span className="text-sm font-bold text-primary">{monthlyStats.avgProtein}g</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full" style={{ width: '82%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white">Carboidratos</span>
                                <span className="text-sm font-bold text-blue-400">{monthlyStats.avgCarbs}g</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-400/60 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-white">Gorduras</span>
                                <span className="text-sm font-bold text-yellow-500">{monthlyStats.avgFat}g</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-500/60 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Motivational Card */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/30">
                    <div className="text-center">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="text-lg font-bold text-white mb-2">Continue Assim!</h3>
                        <p className="text-sm text-text-muted mb-4">
                            Você está <span className="text-primary font-bold">15% melhor</span> que no mês passado.
                            Sua dedicação está trazendo resultados incríveis!
                        </p>
                        <div className="flex gap-2 justify-center">
                            <div className="bg-white/10 px-3 py-1 rounded-full">
                                <span className="text-xs text-primary font-semibold">💪 Foco Total</span>
                            </div>
                            <div className="bg-white/10 px-3 py-1 rounded-full">
                                <span className="text-xs text-primary font-semibold">🔥 Em Chamas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

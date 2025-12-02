import { Award, Trophy, Flame, Droplet, Target, Calendar, Dumbbell, Crown, Star, Lock, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Não utilizado no momento
import { useState } from 'react';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress?: number;
    target?: number;
    category: 'streak' | 'lifestyle' | 'meals' | 'ranking' | 'special';
}

export default function AchievementsPage() {
    const navigate = useNavigate();
    // const { profile } = useAuth(); // Não utilizado no momento
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    // Mock data - em produção viria do backend
    const badges: Badge[] = [
        // Streak Badges
        {
            id: 'streak_7',
            name: '7 Dias Seguidos',
            description: 'Registre suas refeições por 7 dias consecutivos',
            icon: Flame,
            color: 'from-orange-500 to-red-500',
            unlocked: true,
            unlockedAt: '15/11/2024',
            category: 'streak'
        },
        {
            id: 'streak_30',
            name: 'Mês Completo',
            description: 'Mantenha sua sequência por 30 dias',
            icon: Calendar,
            color: 'from-purple-500 to-pink-500',
            unlocked: false,
            progress: 12,
            target: 30,
            category: 'streak'
        },
        {
            id: 'streak_100',
            name: 'Centenário',
            description: 'Alcance 100 dias de sequência',
            icon: Trophy,
            color: 'from-yellow-500 to-orange-500',
            unlocked: false,
            progress: 12,
            target: 100,
            category: 'streak'
        },

        // Lifestyle Badges
        {
            id: 'water_30',
            name: 'Hidratação Master',
            description: 'Bata sua meta de água por 30 dias',
            icon: Droplet,
            color: 'from-blue-400 to-cyan-400',
            unlocked: false,
            progress: 18,
            target: 30,
            category: 'lifestyle'
        },
        {
            id: 'exercise_20',
            name: 'Guerreiro do Exercício',
            description: 'Complete 20 dias de exercício no mês',
            icon: Dumbbell,
            color: 'from-green-500 to-emerald-500',
            unlocked: false,
            progress: 18,
            target: 20,
            category: 'lifestyle'
        },
        {
            id: 'sleep_perfect',
            name: 'Sono Perfeito',
            description: 'Durma 7-9h por 21 dias seguidos',
            icon: Star,
            color: 'from-purple-400 to-indigo-400',
            unlocked: false,
            progress: 8,
            target: 21,
            category: 'lifestyle'
        },

        // Meals Badges
        {
            id: 'meals_100',
            name: '100 Refeições',
            description: 'Registre 100 refeições no total',
            icon: Target,
            color: 'from-primary to-secondary',
            unlocked: true,
            unlockedAt: '20/11/2024',
            category: 'meals'
        },
        {
            id: 'meals_500',
            name: 'Chef Dedicado',
            description: 'Registre 500 refeições no total',
            icon: Award,
            color: 'from-yellow-600 to-orange-600',
            unlocked: false,
            progress: 126,
            target: 500,
            category: 'meals'
        },

        // Ranking Badges
        {
            id: 'ranking_top5',
            name: 'Top 5 Semanal',
            description: 'Fique entre os 5 melhores da semana',
            icon: Trophy,
            color: 'from-yellow-500 to-yellow-600',
            unlocked: true,
            unlockedAt: '25/11/2024',
            category: 'ranking'
        },
        {
            id: 'ranking_champion',
            name: 'Campeão Semanal',
            description: 'Seja o 1º colocado no ranking semanal',
            icon: Crown,
            color: 'from-yellow-400 to-yellow-500',
            unlocked: false,
            progress: 3,
            target: 1,
            category: 'ranking'
        },

        // Special Badges
        {
            id: 'perfectionist',
            name: 'Perfeccionista',
            description: 'Bata todas as suas metas em um dia',
            icon: Star,
            color: 'from-pink-500 to-rose-500',
            unlocked: true,
            unlockedAt: '22/11/2024',
            category: 'special'
        },
        {
            id: 'early_bird',
            name: 'Madrugador',
            description: 'Registre café da manhã antes das 7h por 7 dias',
            icon: Star,
            color: 'from-amber-500 to-yellow-500',
            unlocked: false,
            progress: 3,
            target: 7,
            category: 'special'
        },
    ];

    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);

    const stats = {
        total: badges.length,
        unlocked: unlockedBadges.length,
        percentage: Math.round((unlockedBadges.length / badges.length) * 100),
        recentUnlock: unlockedBadges[unlockedBadges.length - 1]
    };

    const getCategoryName = (category: string) => {
        const names: any = {
            streak: 'Sequência',
            lifestyle: 'Estilo de Vida',
            meals: 'Refeições',
            ranking: 'Ranking',
            special: 'Especiais'
        };
        return names[category] || category;
    };

    const getCategoryIcon = (category: string) => {
        const icons: any = {
            streak: Flame,
            lifestyle: Dumbbell,
            meals: Target,
            ranking: Trophy,
            special: Star
        };
        return icons[category] || Award;
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
                            <Award className="text-primary" size={20} />
                            Minhas Conquistas
                        </h1>
                        <p className="text-xs text-text-muted">Suas badges e troféus</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Stats Overview */}
                <div className="glass rounded-2xl p-6 border-2 border-primary/30">
                    <div className="text-center mb-4">
                        <div className="inline-block bg-gradient-to-br from-primary/20 to-secondary/20 p-4 rounded-full mb-3">
                            <Trophy className="text-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Colecionador</h2>
                        <p className="text-sm text-text-muted">Continue desbloqueando conquistas!</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-primary">{stats.unlocked}</div>
                            <div className="text-xs text-text-muted">Desbloqueadas</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-white">{stats.total}</div>
                            <div className="text-xs text-text-muted">Total</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-500">{stats.percentage}%</div>
                            <div className="text-xs text-text-muted">Completo</div>
                        </div>
                    </div>

                    <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary shadow-neon transition-all duration-500"
                            style={{ width: `${stats.percentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Recent Unlock */}
                {stats.recentUnlock && (
                    <div className="glass rounded-xl p-4 border border-primary/30">
                        <div className="flex items-center gap-3">
                            <div className={`bg-gradient-to-br ${stats.recentUnlock.color} p-3 rounded-xl`}>
                                <stats.recentUnlock.icon className="text-white" size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs text-primary font-semibold mb-1">🎉 Última Conquista</div>
                                <div className="font-bold text-white">{stats.recentUnlock.name}</div>
                                <div className="text-xs text-text-muted">{stats.recentUnlock.unlockedAt}</div>
                            </div>
                            <TrendingUp className="text-primary" size={20} />
                        </div>
                    </div>
                )}

                {/* Unlocked Badges */}
                <div>
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Award className="text-primary" size={20} />
                        Desbloqueadas ({unlockedBadges.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {unlockedBadges.map((badge) => {
                            const Icon = badge.icon;
                            return (
                                <button
                                    key={badge.id}
                                    onClick={() => setSelectedBadge(badge)}
                                    className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300 border-2 border-primary/30"
                                >
                                    <div className={`bg-gradient-to-br ${badge.color} p-3 rounded-xl mb-3 mx-auto w-fit shadow-lg`}>
                                        <Icon className="text-white" size={32} />
                                    </div>
                                    <div className="font-semibold text-white text-sm mb-1">{badge.name}</div>
                                    <div className="text-xs text-text-muted mb-2">{badge.description}</div>
                                    <div className="text-xs text-primary font-semibold">
                                        ✓ {badge.unlockedAt}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Locked Badges by Category */}
                {['streak', 'lifestyle', 'meals', 'ranking', 'special'].map((category) => {
                    const categoryBadges = lockedBadges.filter(b => b.category === category);
                    if (categoryBadges.length === 0) return null;

                    const CategoryIcon = getCategoryIcon(category);

                    return (
                        <div key={category}>
                            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                                <CategoryIcon className="text-text-muted" size={20} />
                                {getCategoryName(category)}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {categoryBadges.map((badge) => {
                                    const Icon = badge.icon;
                                    const progress = badge.progress || 0;
                                    const target = badge.target || 100;
                                    const percentage = Math.min((progress / target) * 100, 100);

                                    return (
                                        <button
                                            key={badge.id}
                                            onClick={() => setSelectedBadge(badge)}
                                            className="glass rounded-xl p-4 hover:scale-105 transition-all duration-300 border border-white/10 relative overflow-hidden"
                                        >
                                            {/* Progress overlay */}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"
                                                style={{ clipPath: `inset(${100 - percentage}% 0 0 0)` }}
                                            ></div>

                                            <div className="relative">
                                                <div className="bg-white/10 p-3 rounded-xl mb-3 mx-auto w-fit relative">
                                                    <Icon className="text-text-muted" size={32} />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Lock className="text-white/50" size={16} />
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-white text-sm mb-1">{badge.name}</div>
                                                <div className="text-xs text-text-muted mb-2">{badge.description}</div>

                                                {badge.progress !== undefined && (
                                                    <div>
                                                        <div className="flex items-center justify-between text-xs mb-1">
                                                            <span className="text-text-muted">{progress}/{target}</span>
                                                            <span className="text-primary font-semibold">{Math.round(percentage)}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}

                {/* Motivational Card */}
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/30">
                    <div className="text-center">
                        <div className="text-4xl mb-3">🏆</div>
                        <h3 className="text-lg font-bold text-white mb-2">Continue Conquistando!</h3>
                        <p className="text-sm text-text-muted">
                            Você já desbloqueou <span className="text-primary font-bold">{stats.percentage}%</span> das conquistas.
                            Continue se dedicando para desbloquear todas!
                        </p>
                    </div>
                </div>
            </div>

            {/* Badge Detail Modal */}
            {selectedBadge && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div
                        className="glass rounded-2xl p-6 max-w-sm w-full border-2 border-primary/30 animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className={`bg-gradient-to-br ${selectedBadge.color} p-6 rounded-2xl mb-4 mx-auto w-fit shadow-2xl ${selectedBadge.unlocked ? 'shadow-neon' : ''}`}>
                                <selectedBadge.icon className="text-white" size={48} />
                                {!selectedBadge.unlocked && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock className="text-white/50" size={24} />
                                    </div>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{selectedBadge.name}</h3>
                            <p className="text-sm text-text-muted mb-4">{selectedBadge.description}</p>

                            {selectedBadge.unlocked ? (
                                <div className="bg-primary/20 rounded-lg p-3 border border-primary/30">
                                    <div className="text-sm text-primary font-semibold">
                                        ✓ Desbloqueado em {selectedBadge.unlockedAt}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {selectedBadge.progress !== undefined && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-text-muted">Progresso</span>
                                                <span className="text-white font-bold">
                                                    {selectedBadge.progress}/{selectedBadge.target}
                                                </span>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                                    style={{ width: `${Math.min((selectedBadge.progress! / selectedBadge.target!) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="bg-white/5 rounded-lg p-3">
                                        <div className="text-xs text-text-muted">
                                            Continue se dedicando para desbloquear!
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedBadge(null)}
                                className="mt-4 w-full py-3 rounded-lg bg-primary text-black font-semibold hover:opacity-90 transition-opacity"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

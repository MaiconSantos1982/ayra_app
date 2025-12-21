// @ts-nocheck
import { Trophy, TrendingUp, Award, Flame, Crown, Medal, Star, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RankingUser {
    position: number;
    name: string;
    points: number;
    avatar?: string;
    badges: string[];
    isCurrentUser?: boolean;
}

export default function RankingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Mock data - em produção viria do backend
    const currentUserPoints = 2340;
    const currentUserPosition = 3;
    const totalUsers = 1247;

    const topUsers: RankingUser[] = [
        { position: 1, name: 'Maria Silva', points: 2450, badges: ['👑', '🔥', '💎'], isCurrentUser: false },
        { position: 2, name: 'João Santos', points: 2380, badges: ['🥈', '🔥', '⭐'], isCurrentUser: false },
        { position: 3, name: profile?.nome || 'Você', points: 2340, badges: ['🥉', '💪'], isCurrentUser: true },
        { position: 4, name: 'Carlos Lima', points: 2290, badges: ['🏃', '💧'], isCurrentUser: false },
        { position: 5, name: 'Ana Costa', points: 2250, badges: ['🎯', '🌟'], isCurrentUser: false },
        { position: 6, name: 'Pedro Oliveira', points: 2180, badges: ['💪'], isCurrentUser: false },
        { position: 7, name: 'Julia Ferreira', points: 2150, badges: ['🔥'], isCurrentUser: false },
        { position: 8, name: 'Lucas Almeida', points: 2100, badges: ['⭐'], isCurrentUser: false },
        { position: 9, name: 'Beatriz Souza', points: 2050, badges: ['💎'], isCurrentUser: false },
        { position: 10, name: 'Rafael Costa', points: 2000, badges: ['🎯'], isCurrentUser: false },
    ];

    const pointsBreakdown = [
        { action: 'Refeições registradas', count: 42, points: 420, icon: '🍽️' },
        { action: 'Metas de água batidas', count: 35, points: 700, icon: '💧' },
        { action: 'Dias de exercício', count: 18, points: 540, icon: '💪' },
        { action: 'Horas de sono adequadas', count: 28, points: 420, icon: '😴' },
        { action: 'Streak de 7 dias', count: 1, points: 100, icon: '🔥' },
        { action: 'Todas metas do dia', count: 3, points: 150, icon: '🎯' },
    ];

    const getMedalIcon = (position: number) => {
        if (position === 1) return <Crown className="text-yellow-500" size={24} />;
        if (position === 2) return <Medal className="text-gray-400" size={24} />;
        if (position === 3) return <Medal className="text-orange-600" size={24} />;
        return <Star className="text-text-muted" size={20} />;
    };

    const getMedalColor = (position: number) => {
        if (position === 1) return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30';
        if (position === 2) return 'from-gray-400/20 to-gray-500/10 border-gray-400/30';
        if (position === 3) return 'from-orange-500/20 to-orange-600/10 border-orange-500/30';
        return 'from-white/5 to-white/10 border-white/10';
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
                            <Trophy className="text-yellow-500" size={20} />
                            Ranking Semanal
                        </h1>
                        <p className="text-xs text-text-muted">Competição desta semana</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* User Stats Card */}
                <div className="glass rounded-2xl p-6 border-2 border-primary/30 shadow-xl">
                    <div className="text-center mb-4">
                        <div className="inline-block bg-gradient-to-br from-primary/20 to-secondary/20 p-4 rounded-full mb-3">
                            <Trophy className="text-primary" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Sua Posição</h2>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-5xl font-bold text-primary">#{currentUserPosition}</span>
                            <div className="text-left">
                                <div className="text-sm text-text-muted">de {totalUsers.toLocaleString()}</div>
                                <div className="text-xs text-primary">membros</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-yellow-500">{currentUserPoints}</div>
                            <div className="text-xs text-text-muted">Pontos</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center">
                            <div className="text-2xl font-bold text-primary">Top 5</div>
                            <div className="text-xs text-text-muted">Esta Semana</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 border border-primary/20">
                        <p className="text-xs text-center text-primary">
                            🎉 Parabéns! Você está entre os 5 membros mais engajados!
                        </p>
                    </div>
                </div>

                {/* Points Breakdown */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={20} />
                        Como você ganhou pontos
                    </h3>
                    <div className="space-y-2">
                        {pointsBreakdown.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <div className="text-sm font-medium text-white">{item.action}</div>
                                        <div className="text-xs text-text-muted">{item.count}x ações</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-primary">+{item.points}</div>
                                    <div className="text-xs text-text-muted">pts</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                        <span className="font-semibold text-white">Total</span>
                        <span className="text-xl font-bold text-primary">{currentUserPoints} pts</span>
                    </div>
                </div>

                {/* Top 10 Ranking */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Award className="text-yellow-500" size={20} />
                        Top 10 da Semana
                    </h3>
                    <div className="space-y-2">
                        {topUsers.map((user) => (
                            <div
                                key={user.position}
                                className={`flex items-center gap-3 p-4 rounded-xl transition-all ${user.isCurrentUser
                                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary/40 shadow-neon scale-105'
                                    : `bg-gradient-to-r ${getMedalColor(user.position)} border`
                                    }`}
                            >
                                <div className="flex items-center justify-center w-12">
                                    {getMedalIcon(user.position)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-bold ${user.isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                            {user.name}
                                        </span>
                                        {user.isCurrentUser && <span className="text-xs">✨</span>}
                                    </div>
                                    <div className="flex gap-1 mt-1">
                                        {user.badges.map((badge, i) => (
                                            <span key={i} className="text-sm">{badge}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-bold text-yellow-500">{user.points}</div>
                                    <div className="text-xs text-text-muted">pontos</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rewards Info */}
                <div className="glass rounded-2xl p-6 border border-yellow-500/30">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Flame className="text-yellow-500" size={20} />
                        Recompensas Semanais
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                            <span className="text-2xl">👑</span>
                            <div className="flex-1">
                                <div className="font-semibold text-yellow-500">1º Lugar</div>
                                <div className="text-xs text-text-muted">Badge "Campeão da Semana" + 1 mês Premium grátis</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                            <span className="text-2xl">🏆</span>
                            <div className="flex-1">
                                <div className="font-semibold text-white">Top 5</div>
                                <div className="text-xs text-text-muted">Badge "Top 5 da Semana" + Destaque no perfil</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                            <span className="text-2xl">🌟</span>
                            <div className="flex-1">
                                <div className="font-semibold text-white">Top 10</div>
                                <div className="text-xs text-text-muted">Badge "Top 10 da Semana" + Pontos de bônus</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-center text-white">
                        ⏰ O ranking reseta toda <span className="font-bold text-primary">segunda-feira às 00:00</span>
                    </p>
                    <p className="text-xs text-center text-text-muted mt-2">
                        Continue se dedicando para manter sua posição! 💪
                    </p>
                </div>
            </div>
        </div>
    );
}

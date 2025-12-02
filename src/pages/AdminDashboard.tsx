import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type {
    UserMetrics,
    SubscriptionMetrics,
    ConversionMetrics,
    ChurnMetrics,
    LTVMetrics,
    UserDetail,
    RevenueData
} from '../types/admin.types';
import {
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    UserCheck,
    Clock,
    Calendar,
    BarChart3,
    PieChart,
    Activity,
    AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
    const { } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'conversions'>('overview');

    // Métricas
    const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
    const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(null);
    const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics | null>(null);
    const [churnMetrics, setChurnMetrics] = useState<ChurnMetrics | null>(null);
    const [ltvMetrics, setLtvMetrics] = useState<LTVMetrics | null>(null);
    const [recentUsers, setRecentUsers] = useState<UserDetail[]>([]);
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

    useEffect(() => {
        loadAdminData();
    }, []);

    async function loadAdminData() {
        try {
            setLoading(true);

            // Carregar métricas de usuários
            await loadUserMetrics();

            // Carregar métricas de assinaturas
            await loadSubscriptionMetrics();

            // Carregar métricas de conversão
            await loadConversionMetrics();

            // Carregar métricas de churn
            await loadChurnMetrics();

            // Carregar LTV
            await loadLTVMetrics();

            // Carregar usuários recentes
            await loadRecentUsers();

            // Carregar dados de receita
            await loadRevenueData();

        } catch (error) {
            console.error('Erro ao carregar dados admin:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUserMetrics() {
        // Total de usuários
        const { count: totalUsers } = await supabase
            .from('ayra_cadastro')
            .select('*', { count: 'exact', head: true });

        // Usuários free
        const { count: freeUsers } = await supabase
            .from('ayra_cadastro')
            .select('*', { count: 'exact', head: true })
            .eq('plano', 'free');

        // Usuários premium
        const { count: premiumUsers } = await supabase
            .from('ayra_cadastro')
            .select('*', { count: 'exact', head: true })
            .eq('plano', 'premium');

        // Novos usuários este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newUsersThisMonth } = await supabase
            .from('ayra_cadastro')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfMonth.toISOString());

        // Novos usuários esta semana
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const { count: newUsersThisWeek } = await supabase
            .from('ayra_cadastro')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfWeek.toISOString());

        setUserMetrics({
            totalUsers: totalUsers || 0,
            freeUsers: freeUsers || 0,
            premiumUsers: premiumUsers || 0,
            newUsersThisMonth: newUsersThisMonth || 0,
            newUsersThisWeek: newUsersThisWeek || 0
        });
    }

    async function loadSubscriptionMetrics() {
        // Assinaturas ativas
        const { count: activeSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // Assinaturas canceladas
        const { count: canceledSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'canceled');

        // Assinaturas pendentes
        const { count: pendingSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // MRR - Chamar função do banco
        const { data: mrrData } = await supabase.rpc('calculate_current_mrr');
        const monthlyRecurringRevenue = mrrData || 0;

        // Valor médio de assinatura
        const { data: subscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('amount_paid')
            .eq('status', 'active');

        const averageSubscriptionValue = subscriptions && subscriptions.length > 0
            ? subscriptions.reduce((sum, sub) => sum + (sub.amount_paid || 0), 0) / subscriptions.length
            : 0;

        setSubscriptionMetrics({
            activeSubscriptions: activeSubscriptions || 0,
            canceledSubscriptions: canceledSubscriptions || 0,
            pendingSubscriptions: pendingSubscriptions || 0,
            monthlyRecurringRevenue,
            averageSubscriptionValue
        });
    }

    async function loadConversionMetrics() {
        // Tempo médio de conversão
        const { data: avgTimeData } = await supabase.rpc('calculate_avg_conversion_time');
        const averageTimeToConvert = avgTimeData || 0;

        // Taxa de conversão
        const { data: convRateData } = await supabase.rpc('calculate_conversion_rate');
        const conversionRate = convRateData || 0;

        // Total de conversões
        const { count: totalConversions } = await supabase
            .from('ayra_conversion_events')
            .select('*', { count: 'exact', head: true });

        // Conversões este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: conversionsThisMonth } = await supabase
            .from('ayra_conversion_events')
            .select('*', { count: 'exact', head: true })
            .gte('converted_at', startOfMonth.toISOString());

        setConversionMetrics({
            averageTimeToConvert,
            conversionRate,
            totalConversions: totalConversions || 0,
            conversionsThisMonth: conversionsThisMonth || 0
        });
    }

    async function loadChurnMetrics() {
        // Churn rate mensal
        const { data: churnRateData } = await supabase.rpc('calculate_monthly_churn_rate');
        const churnRate = churnRateData || 0;

        // Usuários que cancelaram este mês
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: churnedUsersThisMonth } = await supabase
            .from('ayra_churn_events')
            .select('*', { count: 'exact', head: true })
            .gte('churned_at', startOfMonth.toISOString());

        // Taxa de retenção (inverso do churn)
        const retentionRate = 100 - churnRate;

        setChurnMetrics({
            churnRate,
            churnedUsersThisMonth: churnedUsersThisMonth || 0,
            retentionRate
        });
    }

    async function loadLTVMetrics() {
        // LTV médio
        const { data: ltvData } = await supabase.rpc('calculate_average_ltv');
        const averageLTV = ltvData || 0;

        // Tempo médio de vida do cliente
        const { data: churnEvents } = await supabase
            .from('ayra_churn_events')
            .select('subscription_duration_days');

        const averageCustomerLifespan = churnEvents && churnEvents.length > 0
            ? churnEvents.reduce((sum, event) => sum + (event.subscription_duration_days || 0), 0) / churnEvents.length / 30
            : 0;

        setLtvMetrics({
            averageLTV,
            averageCustomerLifespan
        });
    }

    async function loadRecentUsers() {
        const { data } = await supabase
            .from('ayra_cadastro')
            .select(`
                id,
                id_usuario,
                nome,
                plano,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) {
            // Buscar emails dos usuários
            const usersWithEmails = await Promise.all(
                data.map(async (user) => {
                    const { data: authUser } = await supabase.auth.admin.getUserById(user.id_usuario);
                    return {
                        id: user.id_usuario,
                        nome: user.nome || 'Sem nome',
                        email: authUser?.user?.email || 'Sem email',
                        plano: user.plano,
                        created_at: user.created_at
                    };
                })
            );
            setRecentUsers(usersWithEmails);
        }
    }

    async function loadRevenueData() {
        const { data } = await supabase
            .from('ayra_daily_revenue')
            .select('*')
            .order('revenue_date', { ascending: false })
            .limit(30);

        if (data) {
            setRevenueData(data.map(d => ({
                date: d.revenue_date,
                revenue: d.total_revenue,
                new_subscriptions: d.new_subscriptions,
                canceled_subscriptions: d.canceled_subscriptions
            })));
        }
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-text-secondary">Carregando dados administrativos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">Painel Administrativo</h1>
                    <p className="text-text-secondary">Visão completa das métricas e KPIs do negócio</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex gap-2 border-b border-border">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
                        { id: 'users', label: 'Usuários', icon: Users },
                        { id: 'revenue', label: 'Receita', icon: DollarSign },
                        { id: 'conversions', label: 'Conversões', icon: TrendingUp }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === tab.id
                                ? 'border-b-2 border-primary text-primary'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Métricas Principais */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Total de Usuários"
                                value={userMetrics?.totalUsers || 0}
                                icon={Users}
                                trend={`+${userMetrics?.newUsersThisWeek || 0} esta semana`}
                                color="blue"
                            />
                            <MetricCard
                                title="Usuários Premium"
                                value={userMetrics?.premiumUsers || 0}
                                icon={UserCheck}
                                trend={`${((userMetrics?.premiumUsers || 0) / (userMetrics?.totalUsers || 1) * 100).toFixed(1)}% do total`}
                                color="green"
                            />
                            <MetricCard
                                title="MRR"
                                value={`R$ ${(subscriptionMetrics?.monthlyRecurringRevenue || 0).toFixed(2)}`}
                                icon={DollarSign}
                                trend={`${subscriptionMetrics?.activeSubscriptions || 0} assinaturas ativas`}
                                color="purple"
                            />
                            <MetricCard
                                title="Taxa de Conversão"
                                value={`${(conversionMetrics?.conversionRate || 0).toFixed(1)}%`}
                                icon={TrendingUp}
                                trend={`${conversionMetrics?.conversionsThisMonth || 0} este mês`}
                                color="orange"
                            />
                        </div>

                        {/* Métricas Secundárias */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MetricCard
                                title="Tempo Médio de Conversão"
                                value={`${Math.round(conversionMetrics?.averageTimeToConvert || 0)} dias`}
                                icon={Clock}
                                trend="Freemium → Premium"
                                color="cyan"
                            />
                            <MetricCard
                                title="LTV Médio"
                                value={`R$ ${(ltvMetrics?.averageLTV || 0).toFixed(2)}`}
                                icon={DollarSign}
                                trend={`${(ltvMetrics?.averageCustomerLifespan || 0).toFixed(1)} meses de vida média`}
                                color="green"
                            />
                            <MetricCard
                                title="Churn Rate"
                                value={`${(churnMetrics?.churnRate || 0).toFixed(1)}%`}
                                icon={TrendingDown}
                                trend={`${churnMetrics?.churnedUsersThisMonth || 0} cancelamentos este mês`}
                                color="red"
                            />
                        </div>

                        {/* Distribuição de Usuários */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <PieChart className="h-5 w-5 text-primary" />
                                    Distribuição de Planos
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-text-secondary">Freemium</span>
                                            <span className="font-semibold">{userMetrics?.freeUsers || 0} usuários</span>
                                        </div>
                                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 transition-all duration-500"
                                                style={{
                                                    width: `${((userMetrics?.freeUsers || 0) / (userMetrics?.totalUsers || 1) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-text-secondary">Premium</span>
                                            <span className="font-semibold">{userMetrics?.premiumUsers || 0} usuários</span>
                                        </div>
                                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                                                style={{
                                                    width: `${((userMetrics?.premiumUsers || 0) / (userMetrics?.totalUsers || 1) * 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Métricas de Retenção
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                        <span className="text-text-secondary">Taxa de Retenção</span>
                                        <span className="text-2xl font-bold text-green-500">
                                            {(churnMetrics?.retentionRate || 0).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                        <span className="text-text-secondary">Assinaturas Ativas</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {subscriptionMetrics?.activeSubscriptions || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                        <span className="text-text-secondary">Ticket Médio</span>
                                        <span className="text-2xl font-bold text-purple-500">
                                            R$ {(subscriptionMetrics?.averageSubscriptionValue || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-4">Usuários Recentes</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-text-secondary font-medium">Nome</th>
                                            <th className="text-left py-3 px-4 text-text-secondary font-medium">Email</th>
                                            <th className="text-left py-3 px-4 text-text-secondary font-medium">Plano</th>
                                            <th className="text-left py-3 px-4 text-text-secondary font-medium">Cadastro</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-border hover:bg-surface transition-colors">
                                                <td className="py-3 px-4">{user.nome}</td>
                                                <td className="py-3 px-4 text-text-secondary">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.plano === 'premium'
                                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                                                        : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {user.plano === 'premium' ? 'Premium' : 'Freemium'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-text-secondary">
                                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Revenue Tab */}
                {activeTab === 'revenue' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MetricCard
                                title="MRR Atual"
                                value={`R$ ${(subscriptionMetrics?.monthlyRecurringRevenue || 0).toFixed(2)}`}
                                icon={DollarSign}
                                trend="Receita Recorrente Mensal"
                                color="green"
                            />
                            <MetricCard
                                title="Assinaturas Ativas"
                                value={subscriptionMetrics?.activeSubscriptions || 0}
                                icon={UserCheck}
                                trend={`${subscriptionMetrics?.pendingSubscriptions || 0} pendentes`}
                                color="blue"
                            />
                            <MetricCard
                                title="Ticket Médio"
                                value={`R$ ${(subscriptionMetrics?.averageSubscriptionValue || 0).toFixed(2)}`}
                                icon={TrendingUp}
                                trend="Por assinatura"
                                color="purple"
                            />
                        </div>

                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-4">Receita dos Últimos 30 Dias</h3>
                            {revenueData.length > 0 ? (
                                <div className="space-y-2">
                                    {revenueData.slice(0, 10).map((data, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-surface rounded-lg">
                                            <span className="text-text-secondary">
                                                {new Date(data.date).toLocaleDateString('pt-BR')}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-green-500">
                                                    +{data.new_subscriptions} novas
                                                </span>
                                                <span className="text-sm text-red-500">
                                                    -{data.canceled_subscriptions} canceladas
                                                </span>
                                                <span className="font-semibold">
                                                    R$ {data.revenue.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-text-secondary text-center py-8">Nenhum dado de receita disponível</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Conversions Tab */}
                {activeTab === 'conversions' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <MetricCard
                                title="Taxa de Conversão"
                                value={`${(conversionMetrics?.conversionRate || 0).toFixed(1)}%`}
                                icon={TrendingUp}
                                trend="Últimos 90 dias"
                                color="green"
                            />
                            <MetricCard
                                title="Tempo Médio"
                                value={`${Math.round(conversionMetrics?.averageTimeToConvert || 0)} dias`}
                                icon={Clock}
                                trend="Para converter"
                                color="blue"
                            />
                            <MetricCard
                                title="Conversões Totais"
                                value={conversionMetrics?.totalConversions || 0}
                                icon={UserCheck}
                                trend="Desde o início"
                                color="purple"
                            />
                            <MetricCard
                                title="Este Mês"
                                value={conversionMetrics?.conversionsThisMonth || 0}
                                icon={Calendar}
                                trend="Conversões"
                                color="orange"
                            />
                        </div>

                        <div className="card p-6">
                            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-primary" />
                                Insights de Conversão
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <p className="text-sm text-text-secondary mb-2">Tempo médio de conversão</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        {Math.round(conversionMetrics?.averageTimeToConvert || 0)} dias
                                    </p>
                                    <p className="text-xs text-text-secondary mt-2">
                                        Usuários levam em média esse tempo para migrar do freemium para o premium
                                    </p>
                                </div>

                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-sm text-text-secondary mb-2">Taxa de conversão atual</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {(conversionMetrics?.conversionRate || 0).toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-text-secondary mt-2">
                                        Percentual de usuários que se tornam premium nos últimos 90 dias
                                    </p>
                                </div>

                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <p className="text-sm text-text-secondary mb-2">LTV Médio</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        R$ {(ltvMetrics?.averageLTV || 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-text-secondary mt-2">
                                        Valor médio que cada cliente gera durante seu ciclo de vida
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'cyan';
}

function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
        orange: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
        red: 'from-red-500/20 to-pink-500/20 border-red-500/30',
        cyan: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30'
    };

    const iconColorClasses = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        purple: 'text-purple-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
        cyan: 'text-cyan-400'
    };

    return (
        <div className={`card p-6 bg-gradient-to-br ${colorClasses[color]} border transition-all duration-300 hover:scale-105`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm text-text-secondary mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-surface/50 ${iconColorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {trend && (
                <p className="text-xs text-text-secondary">{trend}</p>
            )}
        </div>
    );
}

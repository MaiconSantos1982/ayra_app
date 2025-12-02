export interface UserMetrics {
    totalUsers: number;
    freeUsers: number;
    premiumUsers: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
}

export interface SubscriptionMetrics {
    activeSubscriptions: number;
    canceledSubscriptions: number;
    pendingSubscriptions: number;
    monthlyRecurringRevenue: number;
    averageSubscriptionValue: number;
}

export interface ConversionMetrics {
    averageTimeToConvert: number; // em dias
    conversionRate: number; // percentual
    totalConversions: number;
    conversionsThisMonth: number;
}

export interface ChurnMetrics {
    churnRate: number; // percentual mensal
    churnedUsersThisMonth: number;
    retentionRate: number;
}

export interface LTVMetrics {
    averageLTV: number;
    averageCustomerLifespan: number; // em meses
}

export interface UserDetail {
    id: string;
    nome: string;
    email: string;
    plano: 'free' | 'premium';
    created_at: string;
    subscription_status?: 'active' | 'canceled' | 'pending';
    subscription_start?: string;
    subscription_end?: string;
    total_paid?: number;
    last_login?: string;
}

export interface ConversionEvent {
    id: number;
    user_id: string;
    converted_at: string;
    days_to_convert: number;
    subscription_value: number;
}

export interface ChurnEvent {
    id: number;
    user_id: string;
    churned_at: string;
    subscription_duration_days: number;
    total_revenue: number;
    churn_reason?: string;
}

export interface RevenueData {
    date: string;
    revenue: number;
    new_subscriptions: number;
    canceled_subscriptions: number;
}

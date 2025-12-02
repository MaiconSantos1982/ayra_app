/**
 * EXEMPLO DE INTEGRAÇÃO - EVENTOS ADMINISTRATIVOS
 * 
 * Este arquivo mostra como integrar os eventos de conversão, assinatura e churn
 * nas suas páginas de checkout e gerenciamento de assinatura.
 */

import { supabase } from '../lib/supabase';

// ============================================
// EXEMPLO 1: REGISTRAR CONVERSÃO E ASSINATURA
// ============================================

/**
 * Função para processar pagamento e registrar conversão
 * Deve ser chamada após confirmação de pagamento bem-sucedido
 */
export async function processSuccessfulPayment(
    userId: string,
    paymentAmount: number,
    planType: 'monthly' | 'yearly',
    paymentProvider: string,
    paymentId: string,
    customerId: string,
    conversionSource: string = 'checkout_page'
) {
    try {
        // 1. Obter data de cadastro do usuário para calcular tempo de conversão
        const { data: cadastro, error: cadastroError } = await supabase
            .from('ayra_cadastro')
            .select('created_at')
            .eq('id_usuario', userId)
            .single();

        if (cadastroError) throw cadastroError;

        // 2. Calcular dias para converter
        const daysToConvert = Math.floor(
            (new Date().getTime() - new Date(cadastro.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );

        // 3. Registrar evento de conversão
        const { error: conversionError } = await supabase
            .from('ayra_conversion_events')
            .insert({
                id_usuario: userId,
                days_to_convert: daysToConvert,
                conversion_source: conversionSource,
                subscription_value: paymentAmount
            });

        if (conversionError) throw conversionError;

        // 4. Calcular data de fim da assinatura
        const subscriptionStart = new Date();
        const subscriptionEnd = new Date();

        if (planType === 'monthly') {
            subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
        } else {
            subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);
        }

        // 5. Registrar assinatura
        const { error: subscriptionError } = await supabase
            .from('ayra_subscriptions')
            .insert({
                id_usuario: userId,
                status: 'active',
                subscription_start: subscriptionStart.toISOString(),
                subscription_end: subscriptionEnd.toISOString(),
                plan_type: planType,
                amount_paid: paymentAmount,
                currency: 'BRL',
                payment_provider: paymentProvider,
                payment_id: paymentId,
                customer_id: customerId,
                auto_renew: true
            });

        if (subscriptionError) throw subscriptionError;

        // 6. Atualizar plano do usuário para premium
        const { error: updateError } = await supabase
            .from('ayra_cadastro')
            .update({ plano: 'premium' })
            .eq('id_usuario', userId);

        if (updateError) throw updateError;

        console.log('✅ Conversão e assinatura registradas com sucesso!');
        return { success: true };

    } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        return { success: false, error };
    }
}

// ============================================
// EXEMPLO 2: REGISTRAR ATIVIDADE DO USUÁRIO
// ============================================

/**
 * Função para registrar atividade diária do usuário
 * Deve ser chamada ao fazer login ou realizar ações importantes
 */
export async function trackUserActivity(
    userId: string,
    activityType: 'login' | 'message' | 'meal',
    featuresUsed: string[] = []
) {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Buscar atividade existente do dia
        const { data: existingActivity } = await supabase
            .from('ayra_user_activity')
            .select('*')
            .eq('id_usuario', userId)
            .eq('activity_date', today)
            .single();

        if (existingActivity) {
            // Atualizar atividade existente
            const updates: any = {
                updated_at: new Date().toISOString()
            };

            if (activityType === 'login') {
                updates.login_count = (existingActivity.login_count || 0) + 1;
            } else if (activityType === 'message') {
                updates.messages_sent = (existingActivity.messages_sent || 0) + 1;
            } else if (activityType === 'meal') {
                updates.meals_logged = (existingActivity.meals_logged || 0) + 1;
            }

            // Merge features usadas
            const currentFeatures = existingActivity.features_used || [];
            const newFeatures = [...new Set([...currentFeatures, ...featuresUsed])];
            updates.features_used = newFeatures;

            await supabase
                .from('ayra_user_activity')
                .update(updates)
                .eq('id', existingActivity.id);

        } else {
            // Criar nova atividade
            const newActivity: any = {
                id_usuario: userId,
                activity_date: today,
                login_count: activityType === 'login' ? 1 : 0,
                messages_sent: activityType === 'message' ? 1 : 0,
                meals_logged: activityType === 'meal' ? 1 : 0,
                features_used: featuresUsed
            };

            await supabase
                .from('ayra_user_activity')
                .insert(newActivity);
        }

        console.log('✅ Atividade registrada com sucesso!');

    } catch (error) {
        console.error('❌ Erro ao registrar atividade:', error);
    }
}

// ============================================
// EXEMPLO 3: REGISTRAR CHURN (CANCELAMENTO)
// ============================================

/**
 * Função para processar cancelamento de assinatura
 * Deve ser chamada quando o usuário cancela a assinatura
 */
export async function processCancellation(
    userId: string,
    churnReason: 'price' | 'not_using' | 'found_alternative' | 'other',
    churnFeedback?: string
) {
    try {
        // 1. Buscar assinatura ativa
        const { data: subscription, error: subError } = await supabase
            .from('ayra_subscriptions')
            .select('*')
            .eq('id_usuario', userId)
            .eq('status', 'active')
            .order('subscription_start', { ascending: false })
            .limit(1)
            .single();

        if (subError || !subscription) {
            throw new Error('Assinatura ativa não encontrada');
        }

        // 2. Calcular duração da assinatura em dias
        const durationDays = Math.floor(
            (new Date().getTime() - new Date(subscription.subscription_start).getTime()) / (1000 * 60 * 60 * 24)
        );

        // 3. Calcular receita total (neste exemplo, apenas o valor pago)
        // Em produção, você pode somar todos os pagamentos da assinatura
        const totalRevenue = subscription.amount_paid;

        // 4. Registrar evento de churn
        const { error: churnError } = await supabase
            .from('ayra_churn_events')
            .insert({
                id_usuario: userId,
                id_subscription: subscription.id,
                subscription_duration_days: durationDays,
                total_revenue: totalRevenue,
                churn_reason: churnReason,
                churn_feedback: churnFeedback
            });

        if (churnError) throw churnError;

        // 5. Atualizar status da assinatura
        const { error: updateError } = await supabase
            .from('ayra_subscriptions')
            .update({
                status: 'canceled',
                canceled_at: new Date().toISOString(),
                auto_renew: false
            })
            .eq('id', subscription.id);

        if (updateError) throw updateError;

        // 6. Atualizar plano do usuário para free
        const { error: planError } = await supabase
            .from('ayra_cadastro')
            .update({ plano: 'free' })
            .eq('id_usuario', userId);

        if (planError) throw planError;

        console.log('✅ Cancelamento registrado com sucesso!');
        return { success: true };

    } catch (error) {
        console.error('❌ Erro ao processar cancelamento:', error);
        return { success: false, error };
    }
}

// ============================================
// EXEMPLO 4: ATUALIZAR RECEITA DIÁRIA
// ============================================

/**
 * Função para atualizar métricas de receita diária
 * Pode ser chamada por um cron job ou trigger do banco
 */
export async function updateDailyRevenue(date?: string) {
    try {
        const targetDate = date || new Date().toISOString().split('T')[0];

        // 1. Contar novas assinaturas do dia
        const { count: newSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .gte('subscription_start', `${targetDate}T00:00:00`)
            .lte('subscription_start', `${targetDate}T23:59:59`);

        // 2. Contar cancelamentos do dia
        const { count: canceledSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'canceled')
            .gte('canceled_at', `${targetDate}T00:00:00`)
            .lte('canceled_at', `${targetDate}T23:59:59`);

        // 3. Calcular receita do dia
        const { data: payments } = await supabase
            .from('ayra_subscriptions')
            .select('amount_paid')
            .gte('subscription_start', `${targetDate}T00:00:00`)
            .lte('subscription_start', `${targetDate}T23:59:59`);

        const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;

        // 4. Contar assinaturas ativas
        const { count: activeSubscriptions } = await supabase
            .from('ayra_subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        // 5. Calcular MRR
        const { data: mrrData } = await supabase.rpc('calculate_current_mrr');
        const mrr = mrrData || 0;

        // 6. Inserir ou atualizar receita diária
        const { error } = await supabase
            .from('ayra_daily_revenue')
            .upsert({
                revenue_date: targetDate,
                total_revenue: totalRevenue,
                new_subscriptions: newSubscriptions || 0,
                canceled_subscriptions: canceledSubscriptions || 0,
                active_subscriptions: activeSubscriptions || 0,
                mrr: mrr
            }, {
                onConflict: 'revenue_date'
            });

        if (error) throw error;

        console.log('✅ Receita diária atualizada com sucesso!');
        return { success: true };

    } catch (error) {
        console.error('❌ Erro ao atualizar receita diária:', error);
        return { success: false, error };
    }
}

// ============================================
// EXEMPLO 5: COMO USAR NO CHECKOUT
// ============================================

/**
 * Exemplo de integração no CheckoutPage.tsx
 */
export async function handleCheckoutSuccess(userId: string) {
    // Simular resposta do Stripe/MercadoPago
    const mockPaymentResponse = {
        paymentId: 'pay_123456789',
        customerId: 'cus_987654321',
        amount: 19.90,
        provider: 'stripe'
    };

    // Processar pagamento e registrar conversão
    const result = await processSuccessfulPayment(
        userId,
        mockPaymentResponse.amount,
        'monthly',
        mockPaymentResponse.provider,
        mockPaymentResponse.paymentId,
        mockPaymentResponse.customerId,
        'checkout_page'
    );

    if (result.success) {
        // Registrar atividade de conversão
        await trackUserActivity(userId, 'login', ['checkout', 'premium']);

        // Redirecionar para página de sucesso
        return true;
    }

    return false;
}

// ============================================
// EXEMPLO 6: COMO USAR NO LOGIN
// ============================================

/**
 * Exemplo de integração no AuthContext.tsx ou página de login
 */
export async function handleUserLogin(userId: string) {
    // Registrar login
    await trackUserActivity(userId, 'login', ['dashboard']);
}

// ============================================
// EXEMPLO 7: COMO USAR NO CHAT
// ============================================

/**
 * Exemplo de integração na página de Chat
 */
export async function handleMessageSent(userId: string) {
    // Registrar mensagem enviada
    await trackUserActivity(userId, 'message', ['chat']);
}

// ============================================
// EXEMPLO 8: COMO USAR NO REGISTRO DE REFEIÇÃO
// ============================================

/**
 * Exemplo de integração na página de Registro Diário
 */
export async function handleMealLogged(userId: string) {
    // Registrar refeição
    await trackUserActivity(userId, 'meal', ['diary', 'nutrition']);
}

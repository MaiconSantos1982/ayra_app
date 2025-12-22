/**
 * Hook para gerenciar notificações push
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
    isNotificationSupported,
    isNotificationEnabled,
    requestNotificationPermission,
    subscribePushNotification,
    unsubscribePushNotification,
    getCurrentSubscription,
    showTestNotification,
    registerServiceWorker,
    subscriptionToJson
} from '../lib/pushNotifications';
import { useAuth } from '../contexts/AuthContext';

export interface PushNotificationState {
    isSupported: boolean;
    isEnabled: boolean;
    isLoading: boolean;
    subscription: PushSubscription | null;
}

export function usePushNotifications() {
    const { user } = useAuth();
    const [state, setState] = useState<PushNotificationState>({
        isSupported: false,
        isEnabled: false,
        isLoading: true,
        subscription: null
    });

    // Inicializa o estado
    useEffect(() => {
        async function init() {
            try {
                const supported = isNotificationSupported();
                const enabled = isNotificationEnabled();
                const subscription = await getCurrentSubscription();

                setState({
                    isSupported: supported,
                    isEnabled: enabled,
                    isLoading: false,
                    subscription
                });

                // Registra o SW automaticamente se suportado
                if (supported && 'serviceWorker' in navigator) {
                    await registerServiceWorker();
                }
            } catch (error) {
                console.error('[Hook] Erro ao inicializar:', error);
                setState({
                    isSupported: false,
                    isEnabled: false,
                    isLoading: false,
                    subscription: null
                });
            }
        }

        init();
    }, []);

    // Salva a subscrição no Supabase
    const saveSubscriptionToDatabase = useCallback(async (subscription: PushSubscription) => {
        console.log('[DEBUG] Iniciando salvamento de subscrição...');
        console.log('[DEBUG] Usuário:', user);

        if (!user) {
            console.error('[DEBUG] ERRO: Usuário não autenticado!');
            throw new Error('Usuário não autenticado');
        }

        console.log('[DEBUG] User ID:', user.id);
        const subscriptionJson = subscriptionToJson(subscription);
        console.log('[DEBUG] Subscription JSON:', subscriptionJson);

        const dataToInsert = {
            user_id: user.id,
            endpoint: subscriptionJson.endpoint,
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
            subscription_data: subscriptionJson,
            updated_at: new Date().toISOString()
        };

        console.log('[DEBUG] Dados para inserir:', dataToInsert);

        const { data, error } = await supabase
            .from('push_subscriptions')
            .upsert(dataToInsert, {
                onConflict: 'user_id,endpoint'
            })
            .select();

        console.log('[DEBUG] Resposta do Supabase - Data:', data);
        console.log('[DEBUG] Resposta do Supabase - Error:', error);

        if (error) {
            console.error('[Hook] Erro ao salvar subscrição:', error);
            throw error;
        }

        console.log('[DEBUG] ✅ Subscrição salva com sucesso!');
    }, [user]);

    // Remove a subscrição do Supabase
    const removeSubscriptionFromDatabase = useCallback(async (endpoint: string) => {
        if (!user) {
            return;
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.id)
            .eq('endpoint', endpoint);

        if (error) {
            console.error('[Hook] Erro ao remover subscrição:', error);
        }
    }, [user]);

    // Habilita notificações
    const enableNotifications = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Solicita permissão
            const permission = await requestNotificationPermission();

            if (permission !== 'granted') {
                throw new Error('Permissão de notificações negada');
            }

            // Subscreve às notificações
            const subscription = await subscribePushNotification();

            // Salva no banco de dados
            await saveSubscriptionToDatabase(subscription);

            // Força atualização do estado
            const currentEnabled = isNotificationEnabled();
            const currentSubscription = await getCurrentSubscription();

            setState({
                isSupported: true,
                isEnabled: currentEnabled,
                isLoading: false,
                subscription: currentSubscription
            });

            return subscription;
        } catch (error) {
            console.error('[Hook] Erro ao habilitar notificações:', error);

            // Atualiza estado mesmo em erro
            const currentEnabled = isNotificationEnabled();
            const currentSubscription = await getCurrentSubscription();

            setState(prev => ({
                ...prev,
                isEnabled: currentEnabled,
                subscription: currentSubscription,
                isLoading: false
            }));
            throw error;
        }
    }, [saveSubscriptionToDatabase]);

    // Desabilita notificações
    const disableNotifications = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            const currentSubscription = await getCurrentSubscription();

            if (currentSubscription) {
                // Remove do banco de dados
                await removeSubscriptionFromDatabase(currentSubscription.endpoint);

                // Cancela a subscrição
                await unsubscribePushNotification();
            }

            // Força verificação do estado real
            const currentEnabled = isNotificationEnabled();
            const checkSubscription = await getCurrentSubscription();

            setState({
                isSupported: state.isSupported,
                isEnabled: currentEnabled,
                isLoading: false,
                subscription: checkSubscription
            });
        } catch (error) {
            console.error('[Hook] Erro ao desabilitar notificações:', error);

            // Atualiza estado mesmo em erro
            const currentEnabled = isNotificationEnabled();
            const checkSubscription = await getCurrentSubscription();

            setState(prev => ({
                ...prev,
                isEnabled: currentEnabled,
                subscription: checkSubscription,
                isLoading: false
            }));
            throw error;
        }
    }, [state.isSupported, removeSubscriptionFromDatabase]);

    // Envia notificação de teste
    const sendTestNotification = useCallback(async () => {
        try {
            await showTestNotification();
        } catch (error) {
            console.error('[Hook] Erro ao enviar notificação de teste:', error);
            throw error;
        }
    }, []);

    // Atualiza o estado quando a permissão muda
    useEffect(() => {
        if (!isNotificationSupported()) {
            return;
        }

        const handlePermissionChange = () => {
            const enabled = isNotificationEnabled();
            setState(prev => ({ ...prev, isEnabled: enabled }));
        };

        // Monitora mudanças de permissão (quando disponível)
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' as PermissionName })
                .then((permissionStatus) => {
                    permissionStatus.addEventListener('change', handlePermissionChange);
                })
                .catch(console.error);
        }
    }, []);

    return {
        ...state,
        enableNotifications,
        disableNotifications,
        sendTestNotification
    };
}

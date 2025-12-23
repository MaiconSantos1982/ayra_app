import { useState, useEffect, useCallback } from 'react';
import { getServiceWorkerRegistration } from '../lib/pushNotifications';

export interface ReminderSettings {
    waterEnabled: boolean;
    waterInterval: number; // em horas
    mealEnabled: boolean;
    mealTimes: string[]; // formato HH:MM
}

const STORAGE_KEY = 'ayra_reminders';
const DEFAULT_SETTINGS: ReminderSettings = {
    waterEnabled: false,
    waterInterval: 2, // 2 horas
    mealEnabled: false,
    mealTimes: ['08:00', '12:00', '15:00', '19:00'] // Café, Almoço, Lanche, Jantar
};

export function useReminders() {
    const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
    const [lastWaterReminder, setLastWaterReminder] = useState<number | null>(null);

    // Carrega configurações do localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('[Reminders] Erro ao carregar configurações:', e);
            }
        }
    }, []);

    // Salva configurações no localStorage
    const updateSettings = useCallback((newSettings: Partial<ReminderSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Mostra notificação através do Service Worker
    const showNotification = useCallback(async (title: string, body: string, tag: string) => {
        try {
            const registration = await getServiceWorkerRegistration();
            if (!registration) {
                console.warn('[Reminders] Service Worker não registrado');
                return;
            }

            await registration.showNotification(title, {
                body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag,
                requireInteraction: false,
                data: {
                    url: '/',
                    timestamp: Date.now()
                }
            });

            console.log(`[Reminders] Notificação mostrada: ${title}`);
        } catch (error) {
            console.error('[Reminders] Erro ao mostrar notificação:', error);
        }
    }, []);

    // Lembrete de água
    const checkWaterReminder = useCallback(async () => {
        console.log('[Reminders] checkWaterReminder chamado');
        console.log('[Reminders] waterEnabled:', settings.waterEnabled);

        if (!settings.waterEnabled) {
            console.log('[Reminders] Água desabilitada, pulando');
            return;
        }

        const now = Date.now();
        const intervalMs = settings.waterInterval * 60 * 60 * 1000; // horas -> ms

        console.log('[Reminders] Agora:', new Date(now).toLocaleTimeString());
        console.log('[Reminders] Último lembrete:', lastWaterReminder ? new Date(lastWaterReminder).toLocaleTimeString() : 'Nunca');
        console.log('[Reminders] Intervalo:', settings.waterInterval, 'horas');
        console.log('[Reminders] Tempo desde último:', lastWaterReminder ? ((now - lastWaterReminder) / 1000 / 60).toFixed(1) + ' minutos' : 'N/A');

        if (!lastWaterReminder || (now - lastWaterReminder) >= intervalMs) {
            console.log('[Reminders] ✅ Enviando lembrete de água!');
            await showNotification(
                '💧 Hora de Beber Água!',
                `Já se passaram ${settings.waterInterval} horas. Hidrate-se!`,
                'water-reminder'
            );
            setLastWaterReminder(now);
            localStorage.setItem('ayra_last_water_reminder', now.toString());
        } else {
            console.log('[Reminders] ⏱️ Ainda não é hora (faltam', ((intervalMs - (now - lastWaterReminder)) / 1000 / 60).toFixed(1), 'minutos)');
        }
    }, [settings, lastWaterReminder, showNotification]);

    // Lembrete de refeições
    const checkMealReminders = useCallback(async () => {
        if (!settings.mealEnabled) return;

        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        for (const mealTime of settings.mealTimes) {
            const [mealHour, mealMinute] = mealTime.split(':').map(Number);
            const mealDate = new Date();
            mealDate.setHours(mealHour, mealMinute, 0, 0);

            // 30 minutos antes
            const reminderDate = new Date(mealDate.getTime() - 30 * 60 * 1000);
            const reminderTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;

            if (currentTime === reminderTime) {
                const lastShown = localStorage.getItem(`ayra_meal_reminder_${mealTime}`);
                const lastShownDate = lastShown ? new Date(parseInt(lastShown)) : null;

                // Só mostra uma vez por dia para cada refeição
                if (!lastShownDate || lastShownDate.getDate() !== now.getDate()) {
                    await showNotification(
                        '🍽️ Refeição em Breve!',
                        `Sua refeição está programada para ${mealTime}. Prepare-se!`,
                        `meal-reminder-${mealTime}`
                    );
                    localStorage.setItem(`ayra_meal_reminder_${mealTime}`, now.getTime().toString());
                }
            }
        }
    }, [settings, showNotification]);

    // Verifica lembretes periodicamente (a cada minuto)
    useEffect(() => {
        // Carrega último lembrete de água do localStorage
        const savedLastWater = localStorage.getItem('ayra_last_water_reminder');
        if (savedLastWater) {
            setLastWaterReminder(parseInt(savedLastWater));
        }

        // Verifica imediatamente
        checkWaterReminder();
        checkMealReminders();

        // Configura intervalo de verificação
        const interval = setInterval(() => {
            checkWaterReminder();
            checkMealReminders();
        }, 60 * 1000); // A cada 1 minuto

        return () => clearInterval(interval);
    }, [checkWaterReminder, checkMealReminders]);

    return {
        settings,
        updateSettings
    };
}

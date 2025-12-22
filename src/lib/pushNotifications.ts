/**
 * Cliente de Push Notifications usando VAPID
 * Gerencia registro de Service Worker e subscrições push
 */

// Chave pública VAPID (será lida do .env)
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Converte base64 para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Verifica se o navegador suporta notificações
 */
export function isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Verifica se as notificações estão habilitadas
 */
export function isNotificationEnabled(): boolean {
    return isNotificationSupported() && Notification.permission === 'granted';
}

/**
 * Solicita permissão para notificações
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isNotificationSupported()) {
        throw new Error('Notificações não são suportadas neste navegador');
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Registra o Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker não é suportado');
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        console.log('[Push] Service Worker registrado:', registration.scope);

        // Aguarda o SW estar ativo
        if (registration.installing) {
            await new Promise<void>((resolve) => {
                registration.installing!.addEventListener('statechange', function () {
                    if (this.state === 'activated') {
                        resolve();
                    }
                });
            });
        }

        return registration;
    } catch (error) {
        console.error('[Push] Erro ao registrar Service Worker:', error);
        throw error;
    }
}

/**
 * Obtém o Service Worker registrado
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        return registration || null;
    } catch (error) {
        console.error('[Push] Erro ao obter Service Worker:', error);
        return null;
    }
}

/**
 * Subscreve às notificações push
 */
export async function subscribePushNotification(): Promise<PushSubscription> {
    if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID_PUBLIC_KEY não configurada');
    }

    // Registra o SW se ainda não estiver registrado
    let registration = await getServiceWorkerRegistration();
    if (!registration) {
        registration = await registerServiceWorker();
    }

    // Verifica se já existe uma subscrição
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
        console.log('[Push] Subscrição já existe');
        return subscription;
    }

    // Cria nova subscrição
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource;

    try {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        console.log('[Push] Nova subscrição criada:', subscription);
        return subscription;
    } catch (error) {
        console.error('[Push] Erro ao criar subscrição:', error);
        throw error;
    }
}

/**
 * Cancela a subscrição de notificações push
 */
export async function unsubscribePushNotification(): Promise<boolean> {
    const registration = await getServiceWorkerRegistration();

    if (!registration) {
        return false;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        return false;
    }

    try {
        const result = await subscription.unsubscribe();
        console.log('[Push] Subscrição cancelada:', result);
        return result;
    } catch (error) {
        console.error('[Push] Erro ao cancelar subscrição:', error);
        throw error;
    }
}

/**
 * Obtém a subscrição atual
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    const registration = await getServiceWorkerRegistration();

    if (!registration) {
        return null;
    }

    try {
        const subscription = await registration.pushManager.getSubscription();
        return subscription;
    } catch (error) {
        console.error('[Push] Erro ao obter subscrição:', error);
        return null;
    }
}

/**
 * Envia uma notificação de teste local
 */
export async function showTestNotification(): Promise<void> {
    if (!isNotificationEnabled()) {
        throw new Error('Permissão de notificações não concedida');
    }

    const registration = await getServiceWorkerRegistration();

    if (!registration) {
        throw new Error('Service Worker não registrado');
    }

    await registration.showNotification('Ayra - Teste', {
        body: 'Esta é uma notificação de teste! 🎉',
        icon: '/icon-192.png',
        badge: '/apple-touch-icon.png',
        tag: 'test-notification',
        data: {
            url: '/'
        }
    });
}

/**
 * Converte PushSubscription para JSON serializável
 */
export function subscriptionToJson(subscription: PushSubscription) {
    return {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
        }
    };
}

/**
 * Converte ArrayBuffer para base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

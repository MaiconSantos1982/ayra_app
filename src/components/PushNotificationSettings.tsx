/**
 * Componente de configuração de notificações push
 */

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, CheckCircle2, XCircle, TestTube2, Smartphone } from 'lucide-react';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotificationSettings() {
    const {
        isSupported,
        isEnabled,
        isLoading,
        enableNotifications,
        disableNotifications,
        sendTestNotification
    } = usePushNotifications();

    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [isTestLoading, setIsTestLoading] = useState(false);
    const [isIOSSafari, setIsIOSSafari] = useState(false);

    // Detecta se é iOS Safari (sem PWA)
    useEffect(() => {
        const ua = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
        setIsIOSSafari(isIOS && !isStandalone);
    }, []);

    const handleToggleNotifications = async () => {
        try {
            setMessage(null);

            if (isEnabled) {
                await disableNotifications();
                setMessage({ type: 'success', text: 'Notificações desabilitadas com sucesso!' });
            } else {
                await enableNotifications();
                setMessage({ type: 'success', text: 'Notificações habilitadas com sucesso!' });
            }
        } catch (error) {
            console.error('Erro ao alterar notificações:', error);

            // Mensagem específica para iOS
            if (isIOSSafari) {
                setMessage({
                    type: 'error',
                    text: 'Safari iOS requer que o app seja instalado. Toque em Compartilhar → Adicionar à Tela Inicial'
                });
            } else {
                setMessage({
                    type: 'error',
                    text: error instanceof Error ? error.message : 'Erro ao alterar configuração de notificações'
                });
            }
        }
    };

    const handleTestNotification = async () => {
        try {
            setIsTestLoading(true);
            setMessage(null);
            await sendTestNotification();
            setMessage({ type: 'success', text: 'Notificação de teste enviada!' });
        } catch (error) {
            console.error('Erro ao enviar notificação de teste:', error);
            setMessage({
                type: 'error',
                text: 'Erro ao enviar notificação de teste. Verifique se as notificações estão habilitadas.'
            });
        } finally {
            setIsTestLoading(false);
        }
    };

    // Aviso especial para iOS Safari
    if (isIOSSafari) {
        return (
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-white font-medium mb-2">📱 Instale o App</h3>
                        <p className="text-sm text-zinc-300 mb-3">
                            Para receber notificações no iPhone, instale o Ayra como aplicativo:
                        </p>
                        <ol className="text-sm text-zinc-300 space-y-2 list-decimal list-inside">
                            <li>Toque no botão <strong>Compartilhar</strong> (ícone de compartilhar)</li>
                            <li>Role e selecione <strong>"Adicionar à Tela Inicial"</strong></li>
                            <li>Toque em <strong>"Adicionar"</strong></li>
                            <li>Abra o app pela tela inicial e habilite notificações</li>
                        </ol>
                        <p className="text-xs text-blue-300 mt-3">
                            💡 Requer iOS 16.4 ou superior
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-white font-medium mb-1">Notificações não suportadas</h3>
                        <p className="text-sm text-zinc-400">
                            Seu navegador não suporta notificações push.
                            Use um navegador moderno como Chrome, Firefox ou Edge.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    {isEnabled ? (
                        <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    ) : (
                        <BellOff className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">
                            Notificações Push
                        </h3>
                        <p className="text-sm text-zinc-400">
                            {isEnabled
                                ? 'Receba atualizações importantes sobre sua jornada de saúde'
                                : 'Habilite para receber notificações importantes'
                            }
                        </p>
                    </div>
                </div>

                {/* Toggle Switch */}
                <button
                    onClick={handleToggleNotifications}
                    disabled={isLoading}
                    className={`
            relative inline-flex items-center h-6 w-11 rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
            focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed
            ${isEnabled ? 'bg-blue-500' : 'bg-zinc-700'}
          `}
                    aria-label={isEnabled ? 'Desabilitar notificações' : 'Habilitar notificações'}
                >
                    <span
                        className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
                    />
                    {isLoading && (
                        <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
                    )}
                </button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2 pt-2">
                {isEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ativado
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                        <XCircle className="w-3.5 h-3.5" />
                        Desativado
                    </span>
                )}
            </div>

            {/* Test Button */}
            {isEnabled && (
                <div className="pt-2 border-t border-zinc-800">
                    <button
                        onClick={handleTestNotification}
                        disabled={isTestLoading}
                        className="
              inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
              bg-zinc-800 hover:bg-zinc-700 text-white
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {isTestLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <TestTube2 className="w-4 h-4" />
                        )}
                        Enviar notificação de teste
                    </button>
                </div>
            )}

            {/* Message */}
            {message && (
                <div className={`
          p-3 rounded-lg text-sm flex items-start gap-2
          ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : message.type === 'info'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }
        `}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                        <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}
        </div>
    );
}

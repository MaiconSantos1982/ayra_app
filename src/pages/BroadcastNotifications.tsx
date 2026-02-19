/**
 * Página de Administração - Enviar Notificações Broadcast
 * Permite enviar notificações push para todos os usuários com subscrições ativas
 */

import { useState, useEffect } from 'react';
import { Send, Users, Bell, Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface BroadcastResult {
    total: number;
    sent: number;
    failed: number;
}

export default function BroadcastNotifications() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BroadcastResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [totalSubscriptions, setTotalSubscriptions] = useState<number | null>(null);

    // Busca total de subscrições ao carregar
    useEffect(() => {
        fetchTotalSubscriptions();
    }, []);

    const fetchTotalSubscriptions = async () => {
        try {
            console.log('[Broadcast] Buscando total de subscrições...');
            const { count, error } = await supabase
                .from('push_subscriptions')
                .select('*', { count: 'exact', head: true });

            console.log('[Broadcast] Resposta count:', count);
            console.log('[Broadcast] Error:', error);

            setTotalSubscriptions(count || 0);
        } catch (err) {
            console.error('[Broadcast] Erro ao buscar subscrições:', err);
        }
    };

    const handleSendBroadcast = async () => {
        if (!title.trim() || !body.trim()) {
            setError('Título e mensagem são obrigatórios');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Busca todas as subscrições com TODOS os campos necessários
            const { data: subscriptions, error: fetchError } = await supabase
                .from('push_subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            if (!subscriptions || subscriptions.length === 0) {
                setError('Nenhuma subscrição encontrada');
                setIsLoading(false);
                return;
            }

            console.log('[Broadcast] Tentando enviar via Edge Function...');

            // Enviar notificação broadcast via Edge Function
            const { data, error: functionError } = await supabase.functions.invoke('send-push-notification', {
                body: {
                    title,
                    body,
                    url,
                    broadcast: true  // Flag para enviar para todos
                }
            });

            console.log('[Broadcast] Resposta Edge Function:', { data, error: functionError });

            if (functionError) {
                // Se não tiver Edge Function, usa método alternativo (envio local)
                console.warn('[Broadcast] Edge Function falhou. Enviando localmente...', functionError);
                await sendLocalBroadcast(subscriptions);
                return;
            }

            console.log('[Broadcast] Edge Function retornou sucesso:', data);
            setResult(data);

            // Limpar campos após sucesso
            if (data.sent > 0) {
                setTitle('');
                setBody('');
                setUrl('');
            }
        } catch (err) {
            console.error('Erro ao enviar broadcast:', err);
            setError(err instanceof Error ? err.message : 'Erro ao enviar notificações');
        } finally {
            setIsLoading(false);
            fetchTotalSubscriptions(); // Atualiza o contador
        }
    };

    // Método alternativo: enviar localmente (quando Edge Function não está disponível)
    const sendLocalBroadcast = async (subscriptions: any[]) => {
        try {
            console.log('[Broadcast] Enviando localmente para', subscriptions.length, 'dispositivos');
            console.log('[Broadcast] Estrutura das subscrições:', subscriptions);

            let sent = 0;
            let failed = 0;

            for (const sub of subscriptions) {
                try {
                    console.log('[Broadcast] Processando subscrição:', sub);
                    const subscriptionData = sub.subscription_data;

                    const payload = JSON.stringify({
                        title,
                        body,
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        data: {
                            url: url || '/',
                            timestamp: Date.now()
                        }
                    });

                    // Enviar via API nativa do browser (Web Push Protocol)
                    const response = await fetch(subscriptionData.endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'TTL': '86400'
                        },
                        body: payload
                    });

                    if (response.ok) {
                        sent++;
                        console.log('[Broadcast] ✅ Enviado para:', sub.user_id);
                    } else {
                        failed++;
                        console.error('[Broadcast] ❌ Falha ao enviar para:', sub.user_id, response.status);
                    }
                } catch (error) {
                    failed++;
                    console.error('[Broadcast] ❌ Erro ao enviar para:', sub.user_id, error);
                }
            }

            setResult({ sent, failed, total: subscriptions.length });

            // Limpar campos após sucesso
            if (sent > 0) {
                setTitle('');
                setBody('');
                setUrl('/');
            }
        } catch (err) {
            console.error('[Broadcast] Erro geral:', err);
            setError('Erro ao enviar notificações localmente');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-slate-900/70 to-background p-6 rounded-b-3xl border-b border-white/5 mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate('/perfil')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Bell className="w-6 h-6" />
                            Enviar Notificações
                        </h1>
                        <p className="text-slate-300 text-sm">Broadcast para todos os dispositivos</p>
                    </div>
                </div>

                {/* Stats */}
                {totalSubscriptions !== null && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-300" />
                        <div>
                            <p className="text-white font-semibold">{totalSubscriptions} dispositivos ativos</p>
                            <p className="text-slate-300 text-xs">Receberão a notificação</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Form */}
            <div className="px-6 space-y-6">
                {/* Título */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Título da Notificação *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Nova atualização disponível!"
                        maxLength={50}
                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-zinc-400 mt-1">{title.length}/50 caracteres</p>
                </div>

                {/* Mensagem */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Mensagem *
                    </label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Ex: Confira as novidades e melhorias que preparamos para você!"
                        maxLength={150}
                        rows={4}
                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none resize-none"
                    />
                    <p className="text-xs text-zinc-400 mt-1">{body.length}/150 caracteres</p>
                </div>

                {/* URL de destino */}
                <div>
                    <label className="block text-white font-medium mb-2">
                        Link de Destino (opcional)
                    </label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="/dashboard"
                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:border-primary focus:outline-none"
                    />
                    <p className="text-xs text-zinc-400 mt-1">Página que abrirá ao clicar na notificação</p>
                </div>

                {/* Preview */}
                {(title || body) && (
                    <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4">
                        <p className="text-xs text-zinc-400 mb-3">Preview:</p>
                        <div className="bg-white/5 rounded-lg p-4 flex items-start gap-3">
                            <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-white font-semibold">{title || 'Título'}</p>
                                <p className="text-zinc-300 text-sm mt-1">{body || 'Mensagem'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botão Enviar */}
                <button
                    onClick={handleSendBroadcast}
                    disabled={isLoading || !title.trim() || !body.trim()}
                    className="w-full bg-primary text-black font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Enviar para Todos
                        </>
                    )}
                </button>

                {/* Resultado */}
                {result && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-green-400 font-semibold">Notificações Enviadas!</p>
                            <p className="text-green-300 text-sm mt-1">
                                ✅ {result.sent} enviadas com sucesso<br />
                                {result.failed > 0 && `❌ ${result.failed} falharam`}
                            </p>
                        </div>
                    </div>
                )}

                {/* Erro */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 font-semibold">Erro ao Enviar</p>
                            <p className="text-red-300 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Aviso */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-blue-300 text-sm">
                        💡 <strong>Dica:</strong> As notificações serão enviadas apenas para dispositivos que habilitaram e aceitaram receber notificações push.
                    </p>
                </div>
            </div>
        </div>
    );
}

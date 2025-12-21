import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getDailyData } from '../lib/localStorage';
import { supabase } from '../lib/supabase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export default function ChatSimple() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Carrega histórico de mensagens do Supabase
    useEffect(() => {
        loadChatHistory();
    }, [user]);

    // Auto-scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadChatHistory = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('ayra_chat_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })
                .limit(50); // Últimas 50 mensagens

            if (error) throw error;

            if (data && data.length > 0) {
                const formattedMessages: Message[] = data.map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: msg.created_at,
                }));
                setMessages(formattedMessages);
            } else {
                // Mensagem de boas-vindas
                const userData = getUserData();
                const welcomeMessage: Message = {
                    role: 'assistant',
                    content: `Olá${userData?.profile.nome ? `, ${userData.profile.nome}` : ''}! 👋\n\nEu sou a Ayra, sua assistente de nutrição! Estou aqui para te ajudar a alcançar seus objetivos de saúde.\n\nPosso te ajudar com:\n• Dúvidas sobre alimentação\n• Sugestões de refeições\n• Análise do seu progresso\n• Dicas de nutrição\n\nComo posso te ajudar hoje?`,
                    timestamp: new Date().toISOString(),
                };
                setMessages([welcomeMessage]);

                // Salva mensagem de boas-vindas
                await saveMessage(welcomeMessage);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const saveMessage = async (message: Message) => {
        if (!user) return;

        try {
            await supabase.from('ayra_chat_history').insert({
                user_id: user.id,
                role: message.role,
                content: message.content,
                context: getContext(), // Contexto do usuário
            });
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
        }
    };

    const getContext = () => {
        const userData = getUserData();
        const todayData = getDailyData();

        if (!userData) return null;

        return {
            nome: userData.profile.nome,
            objetivo: userData.profile.objetivo,
            restricoes: userData.profile.restricoes,
            peso: userData.profile.peso,
            altura: userData.profile.altura,
            streak: userData.streak,
            refeicoes_hoje: todayData.meals.length,
            agua_hoje: todayData.water,
            exercicio_hoje: todayData.exercise,
        };
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        // Adiciona mensagem do usuário
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        // Salva mensagem do usuário
        await saveMessage(userMessage);

        try {
            // Prepara contexto para a IA
            const context = getContext();
            const userData = getUserData();

            // Monta prompt com contexto
            const systemPrompt = `Você é a Ayra, uma assistente de nutrição amigável e profissional.

Informações do usuário:
- Nome: ${userData?.profile.nome || 'Usuário'}
- Objetivo: ${userData?.profile.objetivo || 'Não informado'}
- Restrições: ${userData?.profile.restricoes || 'Nenhuma'}
- Peso: ${userData?.profile.peso || 'Não informado'} kg
- Altura: ${userData?.profile.altura || 'Não informado'} cm
- Sequência: ${userData?.streak || 0} dias
- Refeições hoje: ${context?.refeicoes_hoje || 0}
- Água hoje: ${context?.agua_hoje || 0}ml
- Exercício hoje: ${context?.exercicio_hoje ? 'Sim' : 'Não'}

Responda de forma clara, objetiva e motivadora. Use emojis quando apropriado.`;

            // Aqui você pode integrar com sua API de IA (OpenAI, n8n, etc)
            // Por enquanto, vou simular uma resposta

            // EXEMPLO DE INTEGRAÇÃO COM N8N:
            const response = await fetch(import.meta.env.VITE_WEBHOOK_URL || '', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input.trim(),
                    context: systemPrompt,
                    history: messages.slice(-5), // Últimas 5 mensagens
                }),
            });

            let assistantContent = '';

            if (response.ok) {
                const data = await response.json();
                assistantContent = data.output || data.response || data.message || 'Desculpe, não consegui processar sua mensagem.';
            } else {
                // Resposta padrão se webhook falhar
                assistantContent = getDefaultResponse(input.trim().toLowerCase());
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, assistantMessage]);
            await saveMessage(assistantMessage);
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);

            // Mensagem de erro amigável
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente? 😅',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    // Respostas padrão (fallback)
    const getDefaultResponse = (input: string): string => {
        if (input.includes('oi') || input.includes('olá') || input.includes('ola')) {
            return 'Olá! Como posso te ajudar hoje? 😊';
        }
        if (input.includes('obrigad')) {
            return 'Por nada! Estou aqui para te ajudar sempre que precisar! 💚';
        }
        if (input.includes('água') || input.includes('agua')) {
            return 'Beber água é essencial! Recomendo pelo menos 2 litros por dia. Você está acompanhando seu consumo no app? 💧';
        }
        if (input.includes('peso')) {
            return 'Para alcançar seus objetivos de peso, é importante manter uma alimentação equilibrada e praticar exercícios regularmente. Quer que eu te ajude a criar um plano? 📊';
        }

        return 'Entendi sua pergunta! Para te dar uma resposta mais precisa, preciso que meu sistema de IA esteja configurado. Por enquanto, posso te ajudar com informações gerais sobre nutrição. O que você gostaria de saber? 🤔';
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (loadingHistory) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-gray-400">Carregando conversa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background relative pb-20">
            {/* Header - Fixo no topo do fluxo */}
            <div className="flex-none bg-gradient-to-br from-purple-900 to-purple-800 p-4 shadow-lg z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-full">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Ayra</h1>
                        <p className="text-purple-200 text-xs">Sua assistente de nutrição</p>
                    </div>
                </div>
            </div>

            {/* Messages - Área rolável que ocupa espaço restante */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user'
                                ? 'bg-gradient-to-br from-primary to-green-400 text-background'
                                : 'bg-card border border-white/10 text-white'
                                }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-background/70' : 'text-gray-500'
                                }`}>
                                {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-card border border-white/10 rounded-2xl p-4">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                <p className="text-gray-400 text-sm">Ayra está digitando...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixo na base do fluxo */}
            <div className="flex-none bg-background border-t border-white/10 p-4 z-10 w-full">
                <div className="flex gap-2 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Digite sua mensagem..."
                        disabled={loading}
                        className="flex-1 bg-card border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-gradient-to-r from-primary to-green-400 text-background p-3 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

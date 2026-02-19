import { useState, useEffect, useRef } from 'react';
import { Send, Mic, X, Play, Pause, ChevronLeft, MoreVertical } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getChatLimits, canSendChatMessage, incrementChatCount, getUserData } from '../lib/localStorage';
import clsx from 'clsx';

interface Message {
    id: string;
    text?: string;
    audioUrl?: string;
    audioDuration?: number;
    sender: 'ayra' | 'user';
    timestamp: Date;
}

export default function Chat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Audio recording
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const recordingInterval = useRef<number | null>(null);

    // Audio playback
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Webhook n8n configuration
    const WEBHOOK_URL = 'https://webhook.superadesafio.com.br/webhook/3becbefa-6552-4f94-8d42-6d737ba1e076';

    // Verifica premium usando AuthContext (sincronizado com Supabase)
    const isPremium = user?.premium || false;
    const [limits, setLimits] = useState(getChatLimits());

    // Update limits when messages change
    useEffect(() => {
        setLimits(getChatLimits());
    }, [messages]);

    // Busca data de criação do usuário do localStorage
    const userCreatedAt = localStorage.getItem('ayra_user_created_at');

    // Verifica se pode enviar mensagem (recalculado em todo render)
    const canSend = isPremium || limits.dailyCount < 5;

    useEffect(() => {
        // Carrega mensagens salvas do localStorage
        const savedMessages = localStorage.getItem('ayra_chat_messages');

        if (savedMessages) {
            try {
                const parsed = JSON.parse(savedMessages);
                // Converte timestamps de string para Date
                const messagesWithDates = parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }));
                setMessages(messagesWithDates);
            } catch (error) {
                console.error('Erro ao carregar mensagens:', error);
                // Se houver erro, mostra mensagem inicial
                const initialMsg: Message = {
                    id: 'init',
                    text: `Olá ${user?.nome || 'Atleta'}! 👋\n\nSou a Ayra, sua assistente nutricional! Estou aqui para te ajudar com dúvidas sobre alimentação, treino e saúde.\n\nPode digitar ou enviar um áudio! 🎤`,
                    sender: 'ayra',
                    timestamp: new Date()
                };
                setMessages([initialMsg]);
            }
        } else {
            // Primeira vez, mostra mensagem inicial
            const initialMsg: Message = {
                id: 'init',
                text: `Olá ${user?.nome || 'Atleta'}! 👋\n\nSou a Ayra, sua assistente nutricional! Estou aqui para te ajudar com dúvidas sobre alimentação, treino e saúde.\n\nPode digitar ou enviar um áudio! 🎤`,
                sender: 'ayra',
                timestamp: new Date()
            };
            setMessages([initialMsg]);
        }
    }, [user]);

    // Salva mensagens no localStorage sempre que mudam
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('ayra_chat_messages', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        // Verifica se pode enviar mensagem
        const checkResult = canSendChatMessage(isPremium, userCreatedAt || undefined);
        if (!checkResult.canSend) {
            alert(checkResult.reason);
            return;
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const messageToSend = input;
        setInput('');

        // Incrementa contador apenas para usuários Free
        if (!isPremium) {
            incrementChatCount();
        }

        setIsLoading(true);

        try {
            // Obtém dados completos do perfil para contexto da IA
            const userData = getUserData();

            // Send message to n8n webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageToSend,
                    userId: user?.id || 'anonymous',
                    userName: user?.nome || 'Usuário',
                    timestamp: new Date().toISOString(),
                    // Dados do perfil para contexto da IA
                    userProfile: userData ? {
                        email: user?.email || '',
                        nome: userData.profile.nome,
                        idade: userData.profile.idade,
                        objetivo: userData.profile.objetivo,
                        restricoes: userData.profile.restricoes,
                        peso: userData.profile.peso,
                        altura: userData.profile.altura,
                        segueDieta: userData.profile.segueDieta,
                        customDiet: userData.profile.customDiet,
                        goals: {
                            calories: userData.goals.calories,
                            protein: userData.goals.protein,
                            carbs: userData.goals.carbs,
                            fat: userData.goals.fat,
                            water: userData.goals.water,
                            exercise: userData.goals.exercise,
                            sleep: userData.goals.sleep
                        },
                        premium: userData.premium
                    } : null
                })
            });

            console.log('✅ Webhook response status:', response.status);
            console.log('✅ Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error('❌ Webhook error:', response.status, response.statusText);
                throw new Error('Erro ao enviar mensagem');
            }

            const rawText = await response.text();
            console.log('📦 Raw response text:', rawText);

            if (!rawText || rawText.trim() === '') {
                console.warn('⚠️ Resposta vazia do webhook!');
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: "Recebi sua mensagem, mas não obtive resposta do servidor. Por favor, tente novamente!",
                    sender: 'ayra',
                    timestamp: new Date()
                }]);
                return;
            }

            const data = JSON.parse(rawText);

            console.log('🔍 Webhook parsed data:', data);
            console.log('📊 Is Array?', Array.isArray(data));
            if (Array.isArray(data)) {
                console.log('📏 Array length:', data.length);
            }

            // Normaliza para array sempre
            const payloads = Array.isArray(data) ? data : [data];

            console.log('🔄 Processing', payloads.length, 'payload(s)...');

            // Itera sobre cada item do array (para suportar loops do n8n)
            for (const payload of payloads) {
                let responseTexts: string[] = [];

                if (typeof payload === 'string') {
                    responseTexts = [payload];
                } else if (payload?.output?.mensagens && Array.isArray(payload.output.mensagens)) {
                    // Formato n8n: { output: { mensagens: ["msg1", "msg2"] } }
                    responseTexts = payload.output.mensagens;
                } else if (payload?.['output.mensagens']) {
                    responseTexts = [payload['output.mensagens']];
                } else if (payload?.response) {
                    responseTexts = [payload.response];
                } else if (payload?.output) {
                    responseTexts = [payload.output];
                } else if (payload?.message) {
                    responseTexts = [payload.message];
                } else if (payload?.text) {
                    responseTexts = [payload.text];
                } else if (payload?.data && typeof payload.data === 'string') {
                    responseTexts = [payload.data];
                }

                if (responseTexts.length > 0) {
                    console.log('✅ Extracted', responseTexts.length, 'message(s)');

                    // Adiciona cada mensagem separadamente
                    for (const responseText of responseTexts) {
                        if (responseText && typeof responseText === 'string') {
                            console.log('💬 Adding message:', responseText.substring(0, 50) + '...');

                            // Delay para efeito natural e garantir ordem
                            await new Promise(resolve => setTimeout(resolve, 500));

                            // Adiciona mensagem da Ayra
                            setMessages(prev => [...prev, {
                                id: (Date.now() + Math.random()).toString(),
                                text: responseText,
                                sender: 'ayra',
                                timestamp: new Date()
                            }]);
                        }
                    }
                } else {
                    console.warn('⚠️ No text extracted from payload:', payload);
                }
            }

            // Se nenhum texto foi extraído de nenhum payload
            if (payloads.length === 0 || !payloads.some((p: any) => p && (typeof p === 'string' || p['output.mensagens'] || p.response || p.output || p.message || p.text || (p.data && typeof p.data === 'string')))) {
                console.error('❌ Formato de resposta desconhecido:', data);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    text: "Desculpe, não consegui processar a resposta completa. Tente novamente!",
                    sender: 'ayra',
                    timestamp: new Date()
                }]);
            }
        } catch (error) {
            console.error('Error sending message to webhook:', error);

            // Fallback response in case of error
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "Ops! Tive um problema ao processar sua mensagem. Por favor, tente novamente em alguns instantes. 🙏",
                sender: 'ayra',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(blob);

                const userMsg: Message = {
                    id: Date.now().toString(),
                    audioUrl,
                    audioDuration: recordingTime,
                    sender: 'user',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, userMsg]);

                // Incrementa contador apenas para usuários Free
                if (!isPremium) {
                    incrementChatCount();
                }

                // Send audio to webhook (future implementation)
                // For now, show a message that audio was received
                setTimeout(() => {
                    const ayraMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: "🎤 Recebi seu áudio!\n\nNo momento, estou processando apenas mensagens de texto. Em breve terei suporte completo para áudios! Por enquanto, pode me enviar sua dúvida por texto? 😊",
                        sender: 'ayra',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, ayraMsg]);
                }, 1000);

                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setRecordingTime(0);

            recordingInterval.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Não foi possível acessar o microfone. Verifique as permissões.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            setIsRecording(false);
            if (recordingInterval.current) {
                clearInterval(recordingInterval.current);
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingInterval.current) {
            clearInterval(recordingInterval.current);
        }
    };

    const toggleAudioPlayback = (id: string) => {
        if (playingId === id) {
            setPlayingId(null);
        } else {
            setPlayingId(id);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMessageTime = (date: Date) => {
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const isLightTheme = document.documentElement.classList.contains('light-theme');

    return (
        <div className={`flex flex-col h-screen relative ${isLightTheme ? 'bg-[#F4F6F8]' : 'bg-[#0B141A]'}`}>
            {/* WhatsApp Header - TOTALMENTE FIXO E FORA DO FLUXO */}
            <header
                className={`fixed top-0 left-0 right-0 h-[60px] px-4 flex items-center gap-3 shadow-md z-[9999] ${isLightTheme ? 'bg-white border-b border-[#dbe1e8]' : 'bg-[#202C33]'}`}
            >
                <button
                    onClick={() => navigate('/inicio')}
                    className={`p-2 rounded-full transition-colors -ml-2 ${isLightTheme ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}
                >
                    <ChevronLeft size={24} className={isLightTheme ? 'text-[#5f6877]' : 'text-[#8696A0]'} />
                </button>

                <div className="relative">
                    <img
                        src="https://wp.superadesafio.com.br/wp-content/uploads/2025/11/AYRA-AVATAR.png"
                        alt="Ayra"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 ${isLightTheme ? 'border-white' : 'border-[#202C33]'}`}></div>
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className={`font-medium text-[16px] truncate ${isLightTheme ? 'text-[#101828]' : 'text-white'}`}>Ayra</h1>
                    <p className={`text-[13px] truncate ${isLightTheme ? 'text-[#5f6877]' : 'text-[#8696A0]'}`}>online</p>
                </div>

                {!isPremium && (
                    <div className={`px-3 py-1 rounded-full flex items-center justify-center min-w-[50px] ${isLightTheme ? 'bg-[#2F7F4F]/10 border border-[#2F7F4F]/30' : 'bg-[#25D366]/10 border border-[#25D366]/30'}`}>
                        <span className={`text-xs font-medium ${isLightTheme ? 'text-[#2F7F4F]' : 'text-[#25D366]'}`}>
                            {limits.dailyCount}/5
                        </span>
                    </div>
                )}

                <button className={`p-2 rounded-full transition-colors ${isLightTheme ? 'hover:bg-black/5' : 'hover:bg-white/10'}`}>
                    <MoreVertical size={20} className={isLightTheme ? 'text-[#5f6877]' : 'text-[#8696A0]'} />
                </button>
            </header>

            {/* Messages Area - Com Padding Top para compensar o Header Fixo */}
            <div
                className="flex-1 overflow-y-auto px-3 py-2" // Removed pt-[90px]
                style={{
                    backgroundImage: isLightTheme
                        ? `url("data:image/svg+xml,%3Csvg width='320' height='320' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='wa-light' x='0' y='0' width='320' height='320' patternUnits='userSpaceOnUse'%3E%3Cg fill='none' stroke='%23d7dcca' stroke-opacity='0.5' stroke-width='1.1'%3E%3Cpath d='M20 38c10 0 10 16 20 16s10-16 20-16 10 16 20 16'/%3E%3Cpath d='M210 70c0 8 8 8 8 16 0 8-8 8-8 16'/%3E%3Cpath d='M140 188c8 0 8 8 16 8 8 0 8-8 16-8'/%3E%3Ccircle cx='88' cy='132' r='8'/%3E%3Ccircle cx='250' cy='228' r='7'/%3E%3Crect x='30' y='220' width='20' height='16' rx='3'/%3E%3Cpath d='M268 120h22m-11-11v22'/%3E%3Cpath d='M142 34l10 10m-10 0l10-10'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='320' height='320' fill='%23efeae2'/%3E%3Crect width='320' height='320' fill='url(%23wa-light)'/%3E%3C/svg%3E")`
                        : `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='whatsapp-pattern' x='0' y='0' width='400' height='400' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 200 Q 100 150, 200 200 T 400 200' stroke='%23182229' stroke-width='1' fill='none' opacity='0.15'/%3E%3Cpath d='M0 250 Q 100 200, 200 250 T 400 250' stroke='%23182229' stroke-width='1' fill='none' opacity='0.15'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='400' height='400' fill='%230B141A'/%3E%3Crect width='400' height='400' fill='url(%23whatsapp-pattern)'/%3E%3C/svg%3E")`,
                    backgroundColor: isLightTheme ? '#efeae2' : '#0B141A'
                }}
            >
                <div className="space-y-2 py-2">
                    {/* SPACER para compensar Header Fixo */}
                    <div className="h-[110px] w-full shrink-0" />

                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={clsx(
                                "flex items-end gap-1",
                                msg.sender === 'user' ? "justify-end" : "justify-start"
                            )}
                        >
                            {msg.sender === 'ayra' && (
                                <img
                                    src="https://wp.superadesafio.com.br/wp-content/uploads/2025/11/AYRA-AVATAR.png"
                                    alt="Ayra"
                                    className="w-8 h-8 rounded-full object-cover mb-1"
                                />
                            )}

                            <div
                                className={clsx(
                                    "max-w-[75%] rounded-lg px-3 py-2 relative",
                                    msg.sender === 'ayra'
                                        ? (isLightTheme
                                            ? "bg-white text-[#101828] rounded-bl-none shadow-sm border border-[#dbe1e8]"
                                            : "bg-[#202C33] text-white rounded-bl-none shadow-md")
                                        : (isLightTheme
                                            ? "bg-[#DCF8C6] text-[#111B21] rounded-br-none shadow-sm border border-[#c7e8ad]"
                                            : "bg-[#005C4B] text-white rounded-br-none shadow-md")
                                )}
                                style={{
                                    boxShadow: msg.sender === 'user'
                                        ? '0 1px 0.5px rgba(0,0,0,0.13)'
                                        : '0 1px 0.5px rgba(0,0,0,0.13)'
                                }}
                            >
                                {/* WhatsApp tail */}
                                <div
                                    className={clsx(
                                        "absolute bottom-0 w-0 h-0",
                                        msg.sender === 'ayra'
                                            ? (isLightTheme
                                                ? "-left-2 border-l-[8px] border-l-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent"
                                                : "-left-2 border-l-[8px] border-l-transparent border-r-[8px] border-r-[#202C33] border-b-[8px] border-b-transparent")
                                            : (isLightTheme
                                                ? "-right-2 border-r-[8px] border-r-transparent border-l-[8px] border-l-[#DCF8C6] border-b-[8px] border-b-transparent"
                                                : "-right-2 border-r-[8px] border-r-transparent border-l-[8px] border-l-[#005C4B] border-b-[8px] border-b-transparent")
                                    )}
                                />

                                {msg.text && (
                                    <p className="text-[14.2px] leading-[19px] whitespace-pre-line break-words">
                                        {msg.text}
                                    </p>
                                )}

                                {msg.audioUrl && (
                                    <div className="flex items-center gap-2 min-w-[200px]">
                                        <button
                                            onClick={() => toggleAudioPlayback(msg.id)}
                                            className={`p-2 rounded-full transition-colors ${isLightTheme ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}
                                        >
                                            {playingId === msg.id ? <Pause size={16} /> : <Play size={16} />}
                                        </button>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className={`flex-1 h-1 rounded-full overflow-hidden ${isLightTheme ? 'bg-black/20' : 'bg-white/20'}`}>
                                                <div
                                                    className={`h-full rounded-full transition-all ${isLightTheme ? 'bg-[#101828]' : 'bg-white'}`}
                                                    style={{ width: playingId === msg.id ? '100%' : '0%' }}
                                                />
                                            </div>
                                            <span className={`text-xs font-mono ${isLightTheme ? 'text-[#5f6877]' : 'text-white/70'}`}>
                                                {formatTime(msg.audioDuration || 0)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className={`text-[11px] text-right mt-1 flex items-center justify-end gap-1 ${isLightTheme ? (msg.sender === 'user' ? 'text-[#667085]' : 'text-[#667085]') : 'text-[#8696A0]'}`}>
                                    <span>{formatMessageTime(msg.timestamp)}</span>
                                    {msg.sender === 'user' && (
                                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                                            <path d="M11.071 0.5L5.5 6.071L2.929 3.5L1.515 4.914L5.5 8.899L12.485 1.914L11.071 0.5Z" fill="#53BDEB" />
                                            <path d="M15.071 0.5L9.5 6.071L8.086 4.657L6.672 6.071L9.5 8.899L16.485 1.914L15.071 0.5Z" fill="#53BDEB" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* WhatsApp Input Area */}
            <div className={`px-2 py-2 ${isLightTheme ? 'bg-white border-t border-[#dbe1e8]' : 'bg-[#202C33]'}`}>
                {isRecording ? (
                    // Recording UI
                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${isLightTheme ? 'bg-[#f1f3f6]' : 'bg-[#0B141A]'}`}>
                        <button
                            onClick={cancelRecording}
                            className={`p-2 rounded-full transition-colors ${isLightTheme ? 'text-[#101828] hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
                        >
                            <X size={24} />
                        </button>

                        <div className="flex-1 flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className={`font-mono text-sm ${isLightTheme ? 'text-[#101828]' : 'text-white'}`}>
                                {formatTime(recordingTime)}
                            </span>
                            <div className="flex gap-1 ml-2">
                                {[...Array(20)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-0.5 bg-[#25D366] rounded-full"
                                        style={{
                                            height: `${Math.random() * 20 + 8}px`,
                                            animation: 'pulse 0.8s ease-in-out infinite',
                                            animationDelay: `${i * 0.05}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={stopRecording}
                            className={`p-3 rounded-full text-white transition-colors ${isLightTheme ? 'bg-[#25D366] hover:bg-[#20BD5F]' : 'bg-[#25D366] hover:bg-[#20BD5F]'}`}
                        >
                            <Send size={20} />
                        </button>
                    </div>
                ) : (
                    // Normal input UI
                    <div className="flex gap-2 items-center">
                        <div className={`flex-1 flex items-center gap-2 rounded-full px-4 py-2 ${isLightTheme ? 'bg-[#f1f3f6] border border-[#dbe1e8]' : 'bg-[#2A3942]'}`}>
                            {/* Debug log seguro */}
                            {(() => { console.log('DEBUG INPUT:', { isPremium, canSend, isLoading }); return null; })()}

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && canSend && !isLoading && handleSend()}
                                placeholder={!canSend ? "Limite diário atingido" : "Mensagem"}
                                className={`flex-1 bg-transparent focus:outline-none text-[15px] ${isLightTheme ? 'text-[#101828] placeholder:text-[#667085]' : 'text-white placeholder:text-[#8696A0]'}`}
                                disabled={!canSend || isLoading}
                            />
                            {isLoading && (
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-[#8696A0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-[#8696A0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-[#8696A0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                        </div>

                        {input.trim() ? (
                            <button
                                onClick={handleSend}
                                disabled={!canSend || isLoading}
                                className={`p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLightTheme ? 'bg-[#25D366] hover:bg-[#20BD5F]' : 'bg-[#25D366] hover:bg-[#20BD5F]'}`}
                            >
                                <Send size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={startRecording}
                                disabled={!canSend}
                                className={`p-3 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isLightTheme ? 'bg-[#25D366] hover:bg-[#20BD5F]' : 'bg-[#25D366] hover:bg-[#20BD5F]'}`}
                            >
                                <Mic size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

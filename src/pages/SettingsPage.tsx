import { ChevronRight, Moon, Sun, Globe, Bell, Lock, Palette, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface Settings {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
        meals: boolean;
        water: boolean;
        exercise: boolean;
        achievements: boolean;
        dailySummary: boolean;
    };
    privacy: {
        showInRanking: boolean;
        shareProgress: boolean;
    };
    dashboard: {
        showStreak: boolean;
        showRanking: boolean;
        showProgress: boolean;
        showAchievements: boolean;
        showLifestyle: boolean;
    };
}

export default function SettingsPage() {
    const navigate = useNavigate();

    // Load settings from localStorage or use defaults
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('ayra_settings');
        return saved ? JSON.parse(saved) : {
            theme: 'dark',
            notifications: {
                meals: true,
                water: true,
                exercise: true,
                achievements: true,
                dailySummary: true
            },
            privacy: {
                showInRanking: true,
                shareProgress: false
            },
            dashboard: {
                showStreak: true,
                showRanking: true,
                showProgress: true,
                showAchievements: true,
                showLifestyle: true
            }
        };
    });

    const [saved, setSaved] = useState(false);

    // Apply theme immediately when changed
    useEffect(() => {
        applyTheme(settings.theme);
    }, [settings.theme]);

    const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.classList.remove('light-theme');
            } else {
                document.documentElement.classList.add('light-theme');
            }
        } else if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    };

    const updateSetting = (category: keyof Settings, key: string, value: any) => {
        const newSettings = {
            ...settings,
            [category]: {
                ...(settings[category] as any),
                [key]: value
            }
        };
        setSettings(newSettings);

        // Auto-save to localStorage
        localStorage.setItem('ayra_settings', JSON.stringify(newSettings));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const updateTheme = (theme: 'light' | 'dark' | 'auto') => {
        const newSettings = { ...settings, theme };
        setSettings(newSettings);
        localStorage.setItem('ayra_settings', JSON.stringify(newSettings));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header - NOT sticky */}
            <div className="bg-background border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/perfil')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ChevronRight className="text-white rotate-180" size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-white flex items-center gap-2">
                            <Palette className="text-primary" size={20} />
                            Configurações
                        </h1>
                        <p className="text-xs text-text-muted">Personalize sua experiência</p>
                    </div>
                    {saved && (
                        <div className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30">
                            <span className="text-xs text-green-500 font-semibold">✓ Salvo</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Appearance - Only Theme */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Palette className="text-primary" size={20} />
                        Aparência
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { value: 'light', icon: Sun, label: 'Claro' },
                            { value: 'dark', icon: Moon, label: 'Escuro' },
                            { value: 'auto', icon: Globe, label: 'Auto' }
                        ].map((theme) => {
                            const Icon = theme.icon;
                            return (
                                <button
                                    key={theme.value}
                                    onClick={() => updateTheme(theme.value as 'light' | 'dark' | 'auto')}
                                    className={`p-4 rounded-xl transition-all ${settings.theme === theme.value
                                            ? 'bg-primary/20 border-2 border-primary text-primary'
                                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon size={24} className="mx-auto mb-2" />
                                    <div className="text-sm font-semibold">{theme.label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard Cards */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Layout className="text-primary" size={20} />
                        Cards do Dashboard
                    </h3>
                    <p className="text-xs text-text-muted mb-4">Escolha quais cards exibir</p>

                    <div className="space-y-3">
                        {[
                            { key: 'showStreak', label: 'Sequência', desc: 'Dias seguidos de registro' },
                            { key: 'showRanking', label: 'Ranking Semanal', desc: 'Sua posição no ranking' },
                            { key: 'showProgress', label: 'Meu Progresso', desc: 'Evolução de peso e metas' },
                            { key: 'showAchievements', label: 'Conquistas', desc: 'Badges e troféus' },
                            { key: 'showLifestyle', label: 'Lifestyle', desc: 'Água, exercício, sono, humor' }
                        ].map((card) => (
                            <div key={card.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium text-white">{card.label}</div>
                                    <div className="text-xs text-text-muted">{card.desc}</div>
                                </div>
                                <button
                                    onClick={() => updateSetting('dashboard', card.key, !settings.dashboard[card.key as keyof typeof settings.dashboard])}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.dashboard[card.key as keyof typeof settings.dashboard] ? 'bg-primary' : 'bg-white/20'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.dashboard[card.key as keyof typeof settings.dashboard] ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Bell className="text-primary" size={20} />
                        Notificações
                    </h3>

                    <div className="space-y-3">
                        {[
                            { key: 'meals', label: 'Refeições', desc: 'Lembretes de registrar refeições' },
                            { key: 'water', label: 'Água', desc: 'Lembrete de beber água' },
                            { key: 'exercise', label: 'Exercício', desc: 'Lembrete de atividade física' },
                            { key: 'achievements', label: 'Conquistas', desc: 'Quando desbloquear badges' },
                            { key: 'dailySummary', label: 'Resumo Diário', desc: 'Resumo do dia à noite' }
                        ].map((notif) => (
                            <div key={notif.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium text-white">{notif.label}</div>
                                    <div className="text-xs text-text-muted">{notif.desc}</div>
                                </div>
                                <button
                                    onClick={() => updateSetting('notifications', notif.key, !settings.notifications[notif.key as keyof typeof settings.notifications])}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications[notif.key as keyof typeof settings.notifications] ? 'bg-primary' : 'bg-white/20'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications[notif.key as keyof typeof settings.notifications] ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                        <Lock className="text-primary" size={20} />
                        Privacidade
                    </h3>

                    <div className="space-y-3">
                        {[
                            { key: 'showInRanking', label: 'Aparecer no Ranking', desc: 'Mostrar seu nome no ranking semanal' },
                            { key: 'shareProgress', label: 'Compartilhar Progresso', desc: 'Permitir compartilhar conquistas' }
                        ].map((privacy) => (
                            <div key={privacy.key} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div>
                                    <div className="text-sm font-medium text-white">{privacy.label}</div>
                                    <div className="text-xs text-text-muted">{privacy.desc}</div>
                                </div>
                                <button
                                    onClick={() => updateSetting('privacy', privacy.key, !settings.privacy[privacy.key as keyof typeof settings.privacy])}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${settings.privacy[privacy.key as keyof typeof settings.privacy] ? 'bg-primary' : 'bg-white/20'
                                        }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.privacy[privacy.key as keyof typeof settings.privacy] ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-sm text-center text-white">
                        ✨ Suas configurações são salvas automaticamente
                    </p>
                </div>
            </div>
        </div>
    );
}

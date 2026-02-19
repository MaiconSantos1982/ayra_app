import { Bell, Droplet, Utensils } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';

export default function ReminderSettings() {
    const { settings, updateSettings } = useReminders();

    return (
        <div className="space-y-6">
            {/* Lembrete de Água */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Lembrete de Água</h3>
                            <p className="text-sm text-text-muted">
                                Notificação a cada {settings.waterInterval}h
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateSettings({ waterEnabled: !settings.waterEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.waterEnabled ? 'bg-blue-500' : 'bg-gray-700'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.waterEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {settings.waterEnabled && (
                    <div className="mt-4">
                        <label className="text-sm text-text-muted">
                            Intervalo (horas)
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.5"
                            value={settings.waterInterval}
                            onChange={(e) => updateSettings({ waterInterval: parseFloat(e.target.value) })}
                            className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-text-muted mt-1">
                            <span>1h</span>
                            <span className="font-semibold text-primary">{settings.waterInterval}h</span>
                            <span>4h</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Lembrete de Refeições */}
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Utensils className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Lembrete de Refeições</h3>
                            <p className="text-sm text-text-muted">
                                Aviso 30min antes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => updateSettings({ mealEnabled: !settings.mealEnabled })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.mealEnabled ? 'bg-orange-500' : 'bg-gray-700'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.mealEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {settings.mealEnabled && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-text-muted mb-2">
                            Horários das refeições:
                        </p>
                        {settings.mealTimes.map((time, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-white">
                                <Bell className="w-4 h-4 text-primary" />
                                <span className="font-semibold text-white">{time}</span>
                                <span className="text-text-muted">
                                    (lembrete às{' '}
                                    {new Date(`2000-01-01T${time}`).getTime() - 30 * 60 * 1000 > 0
                                        ? new Date(new Date(`2000-01-01T${time}`).getTime() - 30 * 60 * 1000)
                                            .toTimeString()
                                            .substring(0, 5)
                                        : '23:30'}
                                    )
                                </span>
                            </div>
                        ))}
                        <p className="text-xs text-text-muted mt-3">
                            💡 Horários baseados no seu plano alimentar
                        </p>
                    </div>
                )}
            </div>

            {/* Info */}
            {(settings.waterEnabled || settings.mealEnabled) && (
                <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-text-muted">
                        <Bell className="w-4 h-4 inline mr-2 text-primary" />
                        Os lembretes funcionam enquanto o app estiver aberto ou em segundo plano.
                    </p>
                </div>
            )}
        </div>
    );
}

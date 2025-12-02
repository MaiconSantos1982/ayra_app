import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Droplet, Dumbbell, Moon, Smile, Scale, Plus, Minus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function RegistroDiarioPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        agua_ml: 0,
        exercicio_feito: false,
        horas_sono: '',
        humor: '',
        peso_kg: '',
        observacoes: ''
    });

    useEffect(() => {
        loadTodayData();
    }, [user]);

    const loadTodayData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const demoData = localStorage.getItem(`demo_lifestyle_${today}`);

            if (demoData) {
                const data = JSON.parse(demoData);
                setFormData({
                    agua_ml: data.agua_ml || 0,
                    exercicio_feito: data.exercicio_feito || false,
                    horas_sono: data.horas_sono?.toString() || '',
                    humor: data.humor || '',
                    peso_kg: data.peso_kg?.toString() || '',
                    observacoes: data.observacoes || ''
                });
                return;
            }

            if (user) {
                const { data, error } = await supabase
                    .from('ayra_diario_lifestyle')
                    .select('*')
                    .eq('id_usuario', user.id)
                    .eq('data_registro', today)
                    .single();

                if (data && !error) {
                    setFormData({
                        agua_ml: data.agua_ml || 0,
                        exercicio_feito: data.exercicio_feito || false,
                        horas_sono: data.horas_sono?.toString() || '',
                        humor: data.humor || '',
                        peso_kg: data.peso_kg?.toString() || '',
                        observacoes: data.observacoes || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading today data:', error);
        }
    };

    const handleWaterChange = (delta: number) => {
        setFormData(prev => ({
            ...prev,
            agua_ml: Math.max(0, prev.agua_ml + delta)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0];
            const lifestyleData = {
                agua_ml: formData.agua_ml,
                exercicio_feito: formData.exercicio_feito,
                horas_sono: formData.horas_sono ? parseFloat(formData.horas_sono) : null,
                humor: formData.humor || null,
                peso_kg: formData.peso_kg ? parseFloat(formData.peso_kg) : null,
                observacoes: formData.observacoes || null
            };

            // Demo mode
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                localStorage.setItem(`demo_lifestyle_${today}`, JSON.stringify(lifestyleData));
                alert('Registro salvo com sucesso!');
                navigate('/inicio');
            } else {
                // Supabase upsert
                const { error } = await supabase
                    .from('ayra_diario_lifestyle')
                    .upsert({
                        id_usuario: user?.id,
                        data_registro: today,
                        ...lifestyleData
                    }, {
                        onConflict: 'id_usuario,data_registro'
                    });

                if (error) throw error;
                alert('Registro salvo com sucesso!');
                navigate('/inicio');
            }
        } catch (error: any) {
            console.error('Error saving data:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const moodOptions = [
        { value: 'great', emoji: '😄', label: 'Ótimo' },
        { value: 'good', emoji: '🙂', label: 'Bem' },
        { value: 'ok', emoji: '😐', label: 'Normal' },
        { value: 'bad', emoji: '😔', label: 'Ruim' }
    ];

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/inicio')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="text-white" size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Registro Diário</h1>
                        <p className="text-xs text-text-muted">Como foi seu dia hoje?</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Water Intake */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Droplet className="text-blue-400" size={20} />
                        Água Ingerida
                    </h3>

                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => handleWaterChange(-250)}
                            className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"
                        >
                            <Minus size={20} className="text-white" />
                        </button>

                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-400 mb-1">
                                {formData.agua_ml}
                            </div>
                            <div className="text-sm text-text-muted">ml</div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleWaterChange(250)}
                            className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"
                        >
                            <Plus size={20} className="text-white" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => handleWaterChange(250)}
                            className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                        >
                            +250ml
                        </button>
                        <button
                            type="button"
                            onClick={() => handleWaterChange(500)}
                            className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                        >
                            +500ml
                        </button>
                        <button
                            type="button"
                            onClick={() => handleWaterChange(1000)}
                            className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-semibold transition-colors"
                        >
                            +1L
                        </button>
                    </div>
                </div>

                {/* Exercise */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Dumbbell className="text-primary" size={20} />
                        Exercício Hoje
                    </h3>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, exercicio_feito: true }))}
                            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${formData.exercicio_feito
                                    ? 'bg-gradient-to-r from-primary to-secondary text-black shadow-neon'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                                }`}
                        >
                            ✓ Sim
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, exercicio_feito: false }))}
                            className={`flex-1 py-4 rounded-xl font-semibold transition-all ${!formData.exercicio_feito
                                    ? 'bg-white/10 text-white border border-white/20'
                                    : 'bg-white/5 text-text-muted hover:bg-white/10'
                                }`}
                        >
                            ✗ Não
                        </button>
                    </div>
                </div>

                {/* Sleep */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Moon className="text-purple-400" size={20} />
                        Horas de Sono
                    </h3>

                    <div className="grid grid-cols-4 gap-2">
                        {[5, 6, 7, 8, 9, 10].map((hours) => (
                            <button
                                key={hours}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, horas_sono: hours.toString() }))}
                                className={`py-3 rounded-xl font-semibold transition-all ${formData.horas_sono === hours.toString()
                                        ? 'bg-purple-400/30 text-purple-400 border-2 border-purple-400'
                                        : 'bg-white/5 text-text-muted hover:bg-white/10'
                                    }`}
                            >
                                {hours}h
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mood */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Smile className="text-yellow-400" size={20} />
                        Como está seu humor?
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {moodOptions.map((mood) => (
                            <button
                                key={mood.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, humor: mood.value }))}
                                className={`p-4 rounded-xl transition-all ${formData.humor === mood.value
                                        ? 'bg-yellow-400/30 border-2 border-yellow-400'
                                        : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{mood.emoji}</div>
                                <div className={`text-sm font-semibold ${formData.humor === mood.value ? 'text-yellow-400' : 'text-text-muted'
                                    }`}>
                                    {mood.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Weight (Optional) */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Scale className="text-text-muted" size={20} />
                        Peso Corporal (Opcional)
                    </h3>

                    <div className="relative">
                        <input
                            type="text"
                            value={formData.peso_kg}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^\d.]/g, '');
                                setFormData(prev => ({ ...prev, peso_kg: value }));
                            }}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white text-center text-2xl font-bold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="75.5"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                            kg
                        </span>
                    </div>
                    <p className="text-xs text-text-muted text-center mt-2">
                        Registre para acompanhar sua evolução
                    </p>
                </div>

                {/* Notes */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Observações</h3>
                    <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Como foi seu dia? Alguma observação importante..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-4 rounded-xl shadow-neon hover:shadow-neon-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Save size={20} />
                            Salvar Registro do Dia
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

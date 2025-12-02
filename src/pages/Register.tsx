import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom'; // Não utilizado no momento
import { Save, Coffee, Sun, Sunset, Moon, Apple, Cookie, Pizza, Droplet, Dumbbell, BedDouble, Smile, Plus, Minus, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

const MEAL_TYPES = [
    { id: 'Café', label: 'Café da Manhã', icon: Coffee },
    { id: 'Lanche Manhã', label: 'Lanche Manhã', icon: Apple },
    { id: 'Almoço', label: 'Almoço', icon: Sun },
    { id: 'Lanche Tarde', label: 'Lanche Tarde', icon: Cookie },
    { id: 'Jantar', label: 'Jantar', icon: Moon },
    { id: 'Ceia', label: 'Ceia', icon: Sunset },
    { id: 'Outras', label: 'Outras', icon: Pizza },
];

export default function Register() {
    const { user } = useAuth();
    // const navigate = useNavigate(); // Não utilizado no momento

    // Meal registration
    const [description, setDescription] = useState('');
    const [mealType, setMealType] = useState('Café');
    const [loading, setLoading] = useState(false);

    // Lifestyle tracking
    const [lifestyleData, setLifestyleData] = useState({
        agua_ml: 0,
        exercicio_feito: false,
        horas_sono: '',
        humor: ''
    });

    // Save feedback
    const [saveStatus, setSaveStatus] = useState({
        water: false,
        exercise: false,
        sleep: false,
        mood: false
    });

    useEffect(() => {
        loadTodayLifestyle();
    }, [user]);

    const loadTodayLifestyle = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const demoData = localStorage.getItem(`demo_lifestyle_${today}`);

            if (demoData) {
                const data = JSON.parse(demoData);
                setLifestyleData({
                    agua_ml: data.agua_ml || 0,
                    exercicio_feito: data.exercicio_feito || false,
                    horas_sono: data.horas_sono?.toString() || '',
                    humor: data.humor || ''
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
                    setLifestyleData({
                        agua_ml: data.agua_ml || 0,
                        exercicio_feito: data.exercicio_feito || false,
                        horas_sono: data.horas_sono?.toString() || '',
                        humor: data.humor || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error loading lifestyle:', error);
        }
    };

    const handleMealSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const today = new Date().toISOString().split('T')[0];

            // Demo mode
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const meals = JSON.parse(localStorage.getItem(`demo_meals_${today}`) || '[]');
                meals.push({
                    tipo_refeicao: mealType,
                    alimento_descricao: description,
                    horario_refeicao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                });
                localStorage.setItem(`demo_meals_${today}`, JSON.stringify(meals));

                alert('Refeição registrada!');
                setDescription('');
                setLoading(false);
                return;
            }

            // Supabase mode
            const { data: headerData, error: headerError } = await supabase
                .from('ayra_diario_header')
                .upsert({
                    id_usuario: user?.id,
                    data_consumo: today
                }, { onConflict: 'id_usuario,data_consumo' })
                .select()
                .single();

            if (headerError) throw headerError;

            const { error: detailError } = await supabase
                .from('ayra_diario_detalhes')
                .insert({
                    id_diario_header: headerData.id,
                    horario_refeicao: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    tipo_refeicao: mealType,
                    alimento_descricao: description,
                    macros_estimados_json: { calorias: 300, proteina: 20, carboidrato: 30, gordura: 10 }
                });

            if (detailError) throw detailError;

            alert('Refeição registrada!');
            setDescription('');
        } catch (error: any) {
            console.error('Error saving meal:', error);
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWaterChange = (delta: number) => {
        const newAmount = Math.max(0, lifestyleData.agua_ml + delta);
        setLifestyleData(prev => ({ ...prev, agua_ml: newAmount }));
    };

    const saveWater = async () => {
        await saveLifestyle({ ...lifestyleData });
        showSaveStatus('water');
    };

    const saveExercise = async (value: boolean) => {
        const updated = { ...lifestyleData, exercicio_feito: value };
        setLifestyleData(updated);
        await saveLifestyle(updated);
        showSaveStatus('exercise');
    };

    const saveSleep = async (value: string) => {
        const updated = { ...lifestyleData, horas_sono: value };
        setLifestyleData(updated);
        await saveLifestyle(updated);
        showSaveStatus('sleep');
    };

    const saveMood = async (value: string) => {
        const updated = { ...lifestyleData, humor: value };
        setLifestyleData(updated);
        await saveLifestyle(updated);
        showSaveStatus('mood');
    };

    const saveLifestyle = async (data: any) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const demoUser = localStorage.getItem('demo_user');

            if (demoUser) {
                localStorage.setItem(`demo_lifestyle_${today}`, JSON.stringify(data));
                return;
            }

            await supabase
                .from('ayra_diario_lifestyle')
                .upsert({
                    id_usuario: user?.id,
                    data_registro: today,
                    ...data
                }, { onConflict: 'id_usuario,data_registro' });
        } catch (error) {
            console.error('Error saving lifestyle:', error);
        }
    };

    const showSaveStatus = (field: string) => {
        setSaveStatus(prev => ({ ...prev, [field]: true }));
        setTimeout(() => {
            setSaveStatus(prev => ({ ...prev, [field]: false }));
        }, 2000);
    };

    const moodOptions = [
        { value: 'great', emoji: '😄', label: 'Ótimo' },
        { value: 'good', emoji: '🙂', label: 'Bem' },
        { value: 'ok', emoji: '😐', label: 'Normal' },
        { value: 'bad', emoji: '😔', label: 'Ruim' }
    ];

    return (
        <div className="space-y-6 pb-6">
            <header>
                <h1 className="text-2xl font-bold text-white">Registro Diário</h1>
                <p className="text-text-muted">Refeições e acompanhamento</p>
            </header>

            {/* Meal Registration */}
            <form onSubmit={handleMealSubmit} className="glass rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                    <Coffee className="text-primary" size={20} />
                    Registrar Refeição
                </h2>

                {/* Meal Type Selector */}
                <div className="space-y-2">
                    <label className="text-sm text-text-muted">Tipo de Refeição</label>
                    <div className="grid grid-cols-2 gap-2">
                        {MEAL_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = mealType === type.id;
                            return (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setMealType(type.id)}
                                    className={clsx(
                                        "flex items-center gap-2 p-3 rounded-xl border transition-all",
                                        isSelected
                                            ? "bg-primary/20 text-primary border-primary font-semibold"
                                            : "bg-white/5 border-white/10 text-text-muted hover:bg-white/10"
                                    )}
                                >
                                    <Icon size={16} />
                                    <span className="text-xs">{type.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm text-text-muted">O que você comeu?</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full p-4 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none resize-none"
                        placeholder="Ex: Omelete com 3 ovos, 1 fatia de pão integral..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-black font-bold shadow-neon hover:shadow-neon-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {loading ? 'Salvando...' : (
                        <>
                            <Save size={18} />
                            Salvar Refeição
                        </>
                    )}
                </button>
            </form>

            {/* Lifestyle Tracking */}
            <div className="space-y-4">
                {/* Water */}
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Droplet className="text-blue-400" size={18} />
                            <span className="font-semibold text-white">Água Hoje</span>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{lifestyleData.agua_ml}ml</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <button
                            type="button"
                            onClick={() => handleWaterChange(-250)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <Minus size={16} className="text-white" />
                        </button>

                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleWaterChange(250)}
                                className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                +250ml
                            </button>
                            <button
                                type="button"
                                onClick={() => handleWaterChange(500)}
                                className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                +500ml
                            </button>
                            <button
                                type="button"
                                onClick={() => handleWaterChange(1000)}
                                className="bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                                +1L
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleWaterChange(250)}
                            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <Plus size={16} className="text-white" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={saveWater}
                        className={clsx(
                            "w-full py-2 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2",
                            saveStatus.water
                                ? "bg-green-500/20 text-green-400 border border-green-400"
                                : "bg-blue-400/20 text-blue-400 hover:bg-blue-400/30"
                        )}
                    >
                        {saveStatus.water ? (
                            <>
                                <Check size={16} />
                                Salvo!
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                Salvar Água
                            </>
                        )}
                    </button>
                </div>

                {/* Exercise */}
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Dumbbell className="text-primary" size={18} />
                        <span className="font-semibold text-white">Fez sua atividade hoje?</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => saveExercise(true)}
                            className={clsx(
                                "py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                                lifestyleData.exercicio_feito
                                    ? saveStatus.exercise
                                        ? "bg-green-500/20 text-green-400 border border-green-400"
                                        : "bg-primary/20 text-primary border border-primary"
                                    : "bg-white/5 text-text-muted hover:bg-white/10"
                            )}
                        >
                            {lifestyleData.exercicio_feito && saveStatus.exercise ? (
                                <>
                                    <Check size={16} />
                                    Salvo!
                                </>
                            ) : (
                                '✓ Sim'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => saveExercise(false)}
                            className={clsx(
                                "py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                                !lifestyleData.exercicio_feito
                                    ? saveStatus.exercise
                                        ? "bg-green-500/20 text-green-400 border border-green-400"
                                        : "bg-white/10 text-white border border-white/20"
                                    : "bg-white/5 text-text-muted hover:bg-white/10"
                            )}
                        >
                            {!lifestyleData.exercicio_feito && saveStatus.exercise ? (
                                <>
                                    <Check size={16} />
                                    Salvo!
                                </>
                            ) : (
                                '✗ Não'
                            )}
                        </button>
                    </div>
                </div>

                {/* Sleep */}
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <BedDouble className="text-purple-400" size={18} />
                        <span className="font-semibold text-white">Quantas horas dormiu?</span>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                        {[5, 6, 7, 8, 9, 10].map((hours) => (
                            <button
                                key={hours}
                                type="button"
                                onClick={() => saveSleep(hours.toString())}
                                className={clsx(
                                    "py-2 rounded-lg font-semibold transition-all text-sm flex flex-col items-center justify-center gap-1",
                                    lifestyleData.horas_sono === hours.toString()
                                        ? saveStatus.sleep
                                            ? "bg-green-500/20 text-green-400 border border-green-400"
                                            : "bg-purple-400/30 text-purple-400 border border-purple-400"
                                        : "bg-white/5 text-text-muted hover:bg-white/10"
                                )}
                            >
                                {lifestyleData.horas_sono === hours.toString() && saveStatus.sleep ? (
                                    <Check size={12} />
                                ) : null}
                                {hours}h
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mood */}
                <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Smile className="text-yellow-400" size={18} />
                        <span className="font-semibold text-white">Como está seu humor?</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {moodOptions.map((mood) => (
                            <button
                                key={mood.value}
                                type="button"
                                onClick={() => saveMood(mood.value)}
                                className={clsx(
                                    "p-2 rounded-lg transition-all",
                                    lifestyleData.humor === mood.value
                                        ? saveStatus.mood
                                            ? "bg-green-500/20 border border-green-400"
                                            : "bg-yellow-400/30 border border-yellow-400"
                                        : "bg-white/5 hover:bg-white/10"
                                )}
                            >
                                <div className="text-2xl mb-1">{mood.emoji}</div>
                                {lifestyleData.humor === mood.value && saveStatus.mood ? (
                                    <div className="text-xs font-semibold text-green-400 flex items-center justify-center gap-1">
                                        <Check size={12} />
                                        Salvo
                                    </div>
                                ) : (
                                    <div className={clsx(
                                        "text-xs font-semibold",
                                        lifestyleData.humor === mood.value ? "text-yellow-400" : "text-text-muted"
                                    )}>
                                        {mood.label}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

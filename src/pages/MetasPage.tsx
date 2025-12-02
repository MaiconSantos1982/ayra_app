import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Target, Zap, TrendingUp, Droplet, Dumbbell, Moon, Award, Scale } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function MetasPage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Metas nutricionais
        calorias_diarias: '',
        proteina_g: '',
        carboidrato_g: '',
        gordura_g: '',
        // Metas de estilo de vida
        agua_ml: '',
        dias_exercicio_semana: '',
        horas_sono: '',
        // Metas de acompanhamento
        peso_corporal_kg: '',
        meta_consistencia_dias: '5' // Padrão: 5 dias/semana
    });

    useEffect(() => {
        loadMetas();
    }, [user]);

    const loadMetas = async () => {
        try {
            const demoMetas = localStorage.getItem('demo_metas');
            if (demoMetas) {
                const metas = JSON.parse(demoMetas);
                setFormData({
                    calorias_diarias: metas.calorias_diarias?.toString() || '',
                    proteina_g: metas.proteina_g?.toString() || '',
                    carboidrato_g: metas.carboidrato_g?.toString() || '',
                    gordura_g: metas.gordura_g?.toString() || '',
                    agua_ml: metas.agua_ml?.toString() || '',
                    dias_exercicio_semana: metas.dias_exercicio_semana?.toString() || '',
                    horas_sono: metas.horas_sono?.toString() || '',
                    peso_corporal_kg: metas.peso_corporal_kg?.toString() || '',
                    meta_consistencia_dias: metas.meta_consistencia_dias?.toString() || '5'
                });
                return;
            }

            if (user) {
                const { data, error } = await supabase
                    .from('ayra_metas')
                    .select('*')
                    .eq('id_usuario', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (data && !error) {
                    setFormData({
                        calorias_diarias: data.calorias_diarias?.toString() || '',
                        proteina_g: data.proteina_g?.toString() || '',
                        carboidrato_g: data.carboidrato_g?.toString() || '',
                        gordura_g: data.gordura_g?.toString() || '',
                        agua_ml: data.agua_ml?.toString() || '',
                        dias_exercicio_semana: data.dias_exercicio_semana?.toString() || '',
                        horas_sono: data.horas_sono?.toString() || '',
                        peso_corporal_kg: data.peso_corporal_kg?.toString() || '',
                        meta_consistencia_dias: data.meta_consistencia_dias?.toString() || '5'
                    });
                }
            }
        } catch (error) {
            console.error('Error loading metas:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setFormData({
            ...formData,
            [e.target.name]: value
        });
    };

    const calculateSuggestions = () => {
        const objetivo = profile?.objetivo?.toLowerCase() || '';
        const pesoAltura = profile?.peso_altura || '';
        const pesoMatch = pesoAltura.match(/(\d+)kg/);
        const peso = pesoMatch ? parseInt(pesoMatch[1]) : 75;

        let calorias = 2200;
        let proteina = 150;
        let carboidrato = 250;
        let gordura = 70;
        let agua = 2500; // ml
        let exercicio = 4; // dias/semana
        let sono = 8; // horas

        if (objetivo.includes('ganhar massa')) {
            calorias = peso * 35;
            proteina = peso * 2.2;
            carboidrato = peso * 4;
            gordura = peso * 1;
            agua = peso * 40;
            exercicio = 5;
            sono = 8;
        } else if (objetivo.includes('perder peso')) {
            calorias = peso * 25;
            proteina = peso * 2;
            carboidrato = peso * 2;
            gordura = peso * 0.8;
            agua = peso * 35;
            exercicio = 5;
            sono = 8;
        } else {
            calorias = peso * 30;
            proteina = peso * 1.8;
            carboidrato = peso * 3;
            gordura = peso * 0.9;
            agua = peso * 35;
            exercicio = 4;
            sono = 7;
        }

        setFormData({
            ...formData,
            calorias_diarias: Math.round(calorias).toString(),
            proteina_g: Math.round(proteina).toString(),
            carboidrato_g: Math.round(carboidrato).toString(),
            gordura_g: Math.round(gordura).toString(),
            agua_ml: Math.round(agua).toString(),
            dias_exercicio_semana: exercicio.toString(),
            horas_sono: sono.toString()
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const metasData = {
                calorias_diarias: parseInt(formData.calorias_diarias),
                proteina_g: parseInt(formData.proteina_g),
                carboidrato_g: parseInt(formData.carboidrato_g),
                gordura_g: parseInt(formData.gordura_g),
                agua_ml: parseInt(formData.agua_ml) || null,
                dias_exercicio_semana: parseInt(formData.dias_exercicio_semana) || null,
                horas_sono: parseInt(formData.horas_sono) || null,
                peso_corporal_kg: formData.peso_corporal_kg ? parseFloat(formData.peso_corporal_kg) : null,
                meta_consistencia_dias: parseInt(formData.meta_consistencia_dias) || 5
            };

            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                localStorage.setItem('demo_metas', JSON.stringify(metasData));
                alert('Metas salvas com sucesso!');
                navigate('/perfil');
            } else {
                const { error } = await supabase
                    .from('ayra_metas')
                    .insert({
                        id_usuario: user?.id,
                        ...metasData
                    });

                if (error) throw error;
                alert('Metas salvas com sucesso!');
                navigate('/perfil');
            }
        } catch (error: any) {
            console.error('Error saving metas:', error);
            alert('Erro ao salvar metas: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const totalMacros =
        (parseInt(formData.proteina_g) || 0) * 4 +
        (parseInt(formData.carboidrato_g) || 0) * 4 +
        (parseInt(formData.gordura_g) || 0) * 9;

    const macroPercentages = {
        proteina: ((parseInt(formData.proteina_g) || 0) * 4 / totalMacros * 100) || 0,
        carboidrato: ((parseInt(formData.carboidrato_g) || 0) * 4 / totalMacros * 100) || 0,
        gordura: ((parseInt(formData.gordura_g) || 0) * 9 / totalMacros * 100) || 0
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
                <div className="flex items-center gap-4 p-4">
                    <button
                        onClick={() => navigate('/perfil')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="text-white" size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">Minhas Metas</h1>
                        <p className="text-xs text-text-muted">Configure seus objetivos diários</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* AI Suggestion */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4">
                    <div className="flex items-start gap-3 mb-3">
                        <Zap className="text-primary mt-1" size={20} />
                        <div className="flex-1">
                            <h3 className="font-bold text-white mb-1">Sugestão Personalizada</h3>
                            <p className="text-sm text-text-muted">
                                Baseado no seu objetivo: <span className="text-primary font-semibold">{profile?.objetivo || 'Não definido'}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={calculateSuggestions}
                        className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-primary/30"
                    >
                        Calcular Metas Sugeridas
                    </button>
                </div>

                {/* Nutrition Goals */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Target className="text-primary" size={20} />
                        Metas Nutricionais
                    </h3>

                    {/* Calories */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Calorias Diárias *
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="calorias_diarias"
                                value={formData.calorias_diarias}
                                onChange={handleChange}
                                className="w-full px-4 py-4 rounded-xl bg-background border border-white/10 text-white text-2xl font-bold text-center focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="2200"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                                kcal
                            </span>
                        </div>
                    </div>

                    {/* Macros */}
                    <div className="space-y-3">
                        {/* Proteína */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-white">Proteína</label>
                                <span className="text-xs text-text-muted">
                                    {macroPercentages.proteina.toFixed(0)}% • {(parseInt(formData.proteina_g) || 0) * 4} kcal
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="proteina_g"
                                    value={formData.proteina_g}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-blue-400 focus:outline-none transition-all"
                                    placeholder="150"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">g</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-blue-400 transition-all" style={{ width: `${macroPercentages.proteina}%` }}></div>
                            </div>
                        </div>

                        {/* Carboidrato */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-white">Carboidrato</label>
                                <span className="text-xs text-text-muted">
                                    {macroPercentages.carboidrato.toFixed(0)}% • {(parseInt(formData.carboidrato_g) || 0) * 4} kcal
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="carboidrato_g"
                                    value={formData.carboidrato_g}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-yellow-400 focus:outline-none transition-all"
                                    placeholder="250"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">g</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-yellow-400 transition-all" style={{ width: `${macroPercentages.carboidrato}%` }}></div>
                            </div>
                        </div>

                        {/* Gordura */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-white">Gordura</label>
                                <span className="text-xs text-text-muted">
                                    {macroPercentages.gordura.toFixed(0)}% • {(parseInt(formData.gordura_g) || 0) * 9} kcal
                                </span>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="gordura_g"
                                    value={formData.gordura_g}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-orange-400 focus:outline-none transition-all"
                                    placeholder="70"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">g</span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-orange-400 transition-all" style={{ width: `${macroPercentages.gordura}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lifestyle Goals */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="text-primary" size={20} />
                        Metas de Estilo de Vida
                    </h3>

                    <div className="space-y-4">
                        {/* Água */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Droplet size={16} className="text-blue-400" />
                                Água Diária
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="agua_ml"
                                    value={formData.agua_ml}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-blue-400 focus:outline-none transition-all"
                                    placeholder="2500"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">ml</span>
                            </div>
                        </div>

                        {/* Exercício */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Dumbbell size={16} className="text-primary" />
                                Dias de Exercício/Semana
                            </label>
                            <select
                                name="dias_exercicio_semana"
                                value={formData.dias_exercicio_semana}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-primary focus:outline-none transition-all"
                            >
                                <option value="">Selecione...</option>
                                <option value="1">1 dia</option>
                                <option value="2">2 dias</option>
                                <option value="3">3 dias</option>
                                <option value="4">4 dias</option>
                                <option value="5">5 dias</option>
                                <option value="6">6 dias</option>
                                <option value="7">7 dias</option>
                            </select>
                        </div>

                        {/* Sono */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Moon size={16} className="text-purple-400" />
                                Horas de Sono
                            </label>
                            <select
                                name="horas_sono"
                                value={formData.horas_sono}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-purple-400 focus:outline-none transition-all"
                            >
                                <option value="">Selecione...</option>
                                <option value="5">5 horas</option>
                                <option value="6">6 horas</option>
                                <option value="7">7 horas</option>
                                <option value="8">8 horas</option>
                                <option value="9">9 horas</option>
                                <option value="10">10 horas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tracking Goals */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="text-primary" size={20} />
                        Metas de Acompanhamento
                    </h3>

                    <div className="space-y-4">
                        {/* Consistência */}
                        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-4">
                            <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                                <Award size={16} className="text-primary" />
                                Meta de Consistência Semanal
                            </label>
                            <p className="text-xs text-text-muted mb-3">
                                Quantos dias por semana você quer bater suas metas? <br />
                                <span className="text-primary">Ideal: 4-6 dias/semana</span>
                            </p>
                            <select
                                name="meta_consistencia_dias"
                                value={formData.meta_consistencia_dias}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-primary/30 text-white font-semibold focus:border-primary focus:outline-none transition-all"
                            >
                                <option value="3">3 dias/semana</option>
                                <option value="4">4 dias/semana (Bom)</option>
                                <option value="5">5 dias/semana (Ótimo)</option>
                                <option value="6">6 dias/semana (Excelente)</option>
                                <option value="7">7 dias/semana (Perfeito)</option>
                            </select>
                        </div>

                        {/* Peso Corporal */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2 flex items-center gap-2">
                                <Scale size={16} className="text-text-muted" />
                                Peso Corporal Atual (Opcional)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="peso_corporal_kg"
                                    value={formData.peso_corporal_kg}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white font-semibold focus:border-primary focus:outline-none transition-all"
                                    placeholder="75"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">kg</span>
                            </div>
                            <p className="text-xs text-text-muted mt-1">
                                Use para acompanhar sua evolução ao longo do tempo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-text-muted leading-relaxed">
                        <strong className="text-white">💡 Dica:</strong> A consistência é mais importante que a perfeição.
                        Bater suas metas 5 dias por semana já traz resultados excelentes!
                    </p>
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
                            Salvar Todas as Metas
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

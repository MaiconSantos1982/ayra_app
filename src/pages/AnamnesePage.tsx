import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AnamnesePage() {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        idade: '',
        problemas_de_saude: '',
        restricoes: '',
        objetivo: '',
        dificuldade: '',
        tem_nutri_ou_dieta: '',
        peso_altura: '',
        info_extra: ''
    });

    useEffect(() => {
        // Load existing data if available
        if (profile) {
            setFormData({
                nome: profile.nome || '',
                telefone: profile.telefone || '',
                idade: profile.idade || '',
                problemas_de_saude: profile.problemas_de_saude || '',
                restricoes: profile.restricoes || '',
                objetivo: profile.objetivo || '',
                dificuldade: profile.dificuldade || '',
                tem_nutri_ou_dieta: profile.tem_nutri_ou_dieta || '',
                peso_altura: profile.peso_altura || '',
                info_extra: profile.info_extra || ''
            });
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Demo mode - save to localStorage
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const user = JSON.parse(demoUser);
                const updatedUser = { ...user, ...formData, cadastro_completo: 'SIM' };
                localStorage.setItem('demo_user', JSON.stringify(updatedUser));
                alert('Dados salvos com sucesso!');
                navigate('/perfil');
            } else {
                // Real Supabase update
                const { error } = await supabase
                    .from('ayra_cadastro')
                    .update({
                        ...formData,
                        cadastro_completo: 'SIM'
                    })
                    .eq('id_usuario', user?.id);

                if (error) throw error;
                alert('Dados salvos com sucesso!');
                navigate('/perfil');
            }
        } catch (error: any) {
            console.error('Error saving data:', error);
            alert('Erro ao salvar dados: ' + error.message);
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-lg font-bold text-white">Dados Pessoais</h1>
                        <p className="text-xs text-text-muted">Complete seu perfil</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Personal Info Section */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <User className="text-primary" size={20} />
                        Informações Básicas
                    </h3>

                    <div className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Seu nome completo"
                                required
                            />
                        </div>

                        {/* Telefone */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Telefone (WhatsApp) *
                            </label>
                            <input
                                type="tel"
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="(11) 99999-9999"
                                required
                            />
                        </div>

                        {/* Idade */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Idade *
                            </label>
                            <input
                                type="text"
                                name="idade"
                                value={formData.idade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: 42"
                                required
                            />
                        </div>

                        {/* Peso e Altura */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Peso e Altura *
                            </label>
                            <input
                                type="text"
                                name="peso_altura"
                                value={formData.peso_altura}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: 90kg, 1,73m"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Health Info Section */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Saúde e Restrições</h3>

                    <div className="space-y-4">
                        {/* Problemas de Saúde */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Problemas de Saúde *
                            </label>
                            <input
                                type="text"
                                name="problemas_de_saude"
                                value={formData.problemas_de_saude}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: diabetes, hipertensão ou 'não'"
                                required
                            />
                        </div>

                        {/* Restrições */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Restrições Alimentares *
                            </label>
                            <input
                                type="text"
                                name="restricoes"
                                value={formData.restricoes}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: alergia a amendoim, lactose"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Goals Section */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Objetivos e Rotina</h3>

                    <div className="space-y-4">
                        {/* Objetivo */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Objetivo Principal *
                            </label>
                            <select
                                name="objetivo"
                                value={formData.objetivo}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="ganhar massa muscular">Ganhar Massa Muscular</option>
                                <option value="perder peso">Perder Peso</option>
                                <option value="manter peso">Manter Peso</option>
                                <option value="melhorar saúde">Melhorar Saúde</option>
                            </select>
                        </div>

                        {/* Dificuldade */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Principal Dificuldade *
                            </label>
                            <input
                                type="text"
                                name="dificuldade"
                                value={formData.dificuldade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: rotina corrida, falta de tempo"
                                required
                            />
                        </div>

                        {/* Tem Nutri ou Dieta */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Acompanhamento Nutricional *
                            </label>
                            <select
                                name="tem_nutri_ou_dieta"
                                value={formData.tem_nutri_ou_dieta}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                required
                            >
                                <option value="">Selecione...</option>
                                <option value="tenho nutricionista">Tenho Nutricionista</option>
                                <option value="sigo uma dieta mas sem acompanhamento, no momento">Sigo dieta sem acompanhamento</option>
                                <option value="não tenho">Não tenho</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Informações Adicionais</h3>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Outras Informações
                        </label>
                        <textarea
                            name="info_extra"
                            value={formData.info_extra}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                            placeholder="Alguma informação adicional que queira compartilhar..."
                        />
                    </div>
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
                            Salvar Dados
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

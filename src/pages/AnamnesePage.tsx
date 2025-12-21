import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Clock, UtensilsCrossed, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { updateProfile, getUserData } from '../lib/localStorage';
import type { DietMeal } from '../lib/localStorage';

export default function AnamnesePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        idade: '',
        peso: '',
        altura: '',
        problemas_de_saude: '',
        restricoes: '',
        objetivo: '',
        dificuldade: '',
        tem_nutri_ou_dieta: '',
        info_extra: ''
    });

    // Estados para Dieta Personalizada
    const [segueDieta, setSegueDieta] = useState(false);
    const [dietMeals, setDietMeals] = useState<DietMeal[]>([]);
    const [currentMeal, setCurrentMeal] = useState({
        tipo: '',
        horario: '',
        descricao: ''
    });

    // Estados para Toast e Modal
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; mealId: string | null }>({
        isOpen: false,
        mealId: null
    });

    // Tipos de refeição disponíveis
    const MEAL_TYPES = [
        'Café da manhã',
        'Lanche da manhã',
        'Almoço',
        'Lanche da tarde',
        'Jantar',
        'Ceia',
        'Outros'
    ];

    // Filtra tipos que já foram adicionados
    const availableMealTypes = MEAL_TYPES.filter(
        type => !dietMeals.some(meal => meal.tipo === type)
    );

    useEffect(() => {
        // Carrega dados do localStorage (sistema Ayra simplificado)
        const userData = getUserData();

        // Também verifica demo_user (sistema de onboarding)
        const demoUser = localStorage.getItem('demo_user');
        const demoData = demoUser ? JSON.parse(demoUser) : null;

        // Inicializa formData com dados disponíveis
        const loadedData = {
            nome: '',
            telefone: '',
            idade: '',
            peso: '',
            altura: '',
            problemas_de_saude: '',
            restricoes: '',
            objetivo: '',
            dificuldade: '',
            tem_nutri_ou_dieta: '',
            info_extra: ''
        };

        // Prioridade 1: userData (localStorage ayra_user_data)
        if (userData?.profile) {
            const prof = userData.profile;
            loadedData.nome = prof.nome || '';
            loadedData.idade = prof.idade || '';
            loadedData.restricoes = prof.restricoes || '';
            loadedData.objetivo = prof.objetivo || '';


            // Carrega peso e altura separadamente
            if (prof.peso) {
                loadedData.peso = prof.peso.toString();
            }
            if (prof.altura) {
                loadedData.altura = prof.altura.toString();
            }

            // Carrega dieta personalizada se existir
            if (prof.segueDieta !== undefined) {
                setSegueDieta(prof.segueDieta);
            }
            if (prof.customDiet) {
                setDietMeals(prof.customDiet);
            }
        }

        // Prioridade 2: demoData (demo_user do onboarding)
        if (demoData) {
            loadedData.nome = loadedData.nome || demoData.nome || '';
            loadedData.telefone = loadedData.telefone || demoData.telefone || '';
            loadedData.idade = loadedData.idade || demoData.idade || '';
            loadedData.problemas_de_saude = loadedData.problemas_de_saude || demoData.problemas_de_saude || '';
            loadedData.restricoes = loadedData.restricoes || demoData.restricoes || '';
            loadedData.objetivo = loadedData.objetivo || demoData.objetivo || '';
            loadedData.dificuldade = loadedData.dificuldade || demoData.dificuldade || '';
            loadedData.tem_nutri_ou_dieta = loadedData.tem_nutri_ou_dieta || demoData.tem_nutri_ou_dieta || '';
            loadedData.info_extra = loadedData.info_extra || demoData.info_extra || '';

            // Extrai peso e altura de peso_altura se existir
            if (demoData.peso_altura && !loadedData.peso && !loadedData.altura) {
                const match = demoData.peso_altura.match(/(\d+(?:,\d+)?)\s*kg.*?(\d+(?:,\d+)?)\s*(?:cm|m)/i);
                if (match) {
                    loadedData.peso = match[1];
                    loadedData.altura = match[2];
                }
            }
        }

        setFormData(loadedData);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Máscara para telefone: (11) 99999-9999
    const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito

        if (value.length <= 11) {
            if (value.length > 6) {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
            } else if (value.length > 2) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else if (value.length > 0) {
                value = `(${value}`;
            }
        }

        setFormData({ ...formData, telefone: value });
    };

    // Máscara para altura: x,xx (metros)
    const handleAlturaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito

        if (value.length > 0) {
            // Limita a 3 dígitos (ex: 173 -> 1,73)
            value = value.slice(0, 3);

            if (value.length === 3) {
                value = `${value[0]},${value.slice(1)}`;
            } else if (value.length === 2) {
                value = `${value[0]},${value[1]}`;
            }
        }

        setFormData({ ...formData, altura: value });
    };


    // Adiciona uma refeição à dieta
    const handleAddMeal = () => {
        if (!currentMeal.tipo || !currentMeal.horario || !currentMeal.descricao.trim()) {
            alert('Por favor, preencha todos os campos da refeição.');
            return;
        }

        const newMeal: DietMeal = {
            id: `meal_${Date.now()}`,
            tipo: currentMeal.tipo as DietMeal['tipo'],
            horario: currentMeal.horario,
            descricao: currentMeal.descricao.trim()
        };

        setDietMeals([...dietMeals, newMeal]);

        // Limpa o formulário atual
        setCurrentMeal({
            tipo: '',
            horario: '',
            descricao: ''
        });
    };

    // Abre modal de confirmação para remover refeição
    const handleRemoveMealClick = (mealId: string) => {
        setConfirmModal({ isOpen: true, mealId });
    };

    // Remove uma refeição da dieta (após confirmação)
    const confirmRemoveMeal = () => {
        if (confirmModal.mealId) {
            setDietMeals(dietMeals.filter(meal => meal.id !== confirmModal.mealId));
            setToast({ message: 'Refeição removida com sucesso!', type: 'success' });
        }
        setConfirmModal({ isOpen: false, mealId: null });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Salva dieta no localStorage
            updateProfile({
                nome: formData.nome,
                idade: formData.idade,
                objetivo: formData.objetivo,
                restricoes: formData.restricoes,
                peso: formData.peso ? parseFloat(formData.peso.replace(',', '.')) : undefined,
                altura: formData.altura ? parseFloat(formData.altura.replace(',', '.')) : undefined,
                segueDieta,
                customDiet: segueDieta ? dietMeals : undefined
            });

            // Demo mode - save to localStorage
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const userDemo = JSON.parse(demoUser);
                const updatedUser = { ...userDemo, ...formData, cadastro_completo: 'SIM' };
                localStorage.setItem('demo_user', JSON.stringify(updatedUser));
                setToast({ message: 'Dados salvos com sucesso!', type: 'success' });
                setTimeout(() => navigate('/perfil'), 1500);
            } else if (user?.id) {
                // Importa e usa updateUserData do supabaseAuth
                const { updateUserData } = await import('../lib/supabaseAuth');

                const result = await updateUserData(user.id, {
                    nome: formData.nome,
                    telefone: formData.telefone,
                    idade: formData.idade ? parseInt(formData.idade) : undefined,
                    peso: formData.peso ? parseFloat(formData.peso.replace(',', '.')) : undefined,
                    altura: formData.altura ? parseFloat(formData.altura.replace(',', '.')) : undefined,
                    problemas_de_saude: formData.problemas_de_saude,
                    restricoes: formData.restricoes,
                    objetivo: formData.objetivo,
                    dificuldade: formData.dificuldade,
                    tem_nutri_ou_dieta: formData.tem_nutri_ou_dieta,
                    info_extra: formData.info_extra
                });

                if (!result.success) {
                    throw new Error(result.error || 'Erro ao salvar dados');
                }

                setToast({ message: 'Dados salvos com sucesso!', type: 'success' });
                setTimeout(() => navigate('/perfil'), 1500);
            }
        } catch (error: any) {
            console.error('Error saving data:', error);
            setToast({ message: 'Erro ao salvar dados: ' + error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-white/10">
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
                                onChange={handleTelefoneChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="(11) 99999-9999"
                                maxLength={15}
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

                        {/* Peso */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Peso (kg) *
                            </label>
                            <input
                                type="text"
                                name="peso"
                                value={formData.peso}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: 80"
                                required
                            />
                        </div>

                        {/* Altura */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Altura (metros) *
                            </label>
                            <input
                                type="text"
                                name="altura"
                                value={formData.altura}
                                onChange={handleAlturaChange}
                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Ex: 1,73"
                                maxLength={4}
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
                <div className="glass rounded-2xl p-6 relative z-50">
                    <h3 className="font-bold text-white mb-4">Objetivos e Rotina</h3>

                    <div className="space-y-4">
                        {/* Objetivo */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Objetivo Principal *
                            </label>
                            <CustomSelect
                                value={formData.objetivo}
                                onChange={(value) => setFormData({ ...formData, objetivo: value })}
                                options={[
                                    { value: 'ganhar massa muscular', label: 'Ganhar Massa Muscular' },
                                    { value: 'perder peso', label: 'Perder Peso' },
                                    { value: 'manter peso', label: 'Manter Peso' },
                                    { value: 'melhorar saúde', label: 'Melhorar Saúde' },
                                ]}
                                placeholder="Selecione..."
                            />
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
                            <CustomSelect
                                value={formData.tem_nutri_ou_dieta}
                                onChange={(value) => setFormData({ ...formData, tem_nutri_ou_dieta: value })}
                                options={[
                                    { value: 'tenho nutricionista', label: 'Tenho Nutricionista' },
                                    { value: 'sigo uma dieta mas sem acompanhamento, no momento', label: 'Sigo dieta sem acompanhamento' },
                                    { value: 'não tenho', label: 'Não tenho' },
                                ]}
                                placeholder="Selecione..."
                            />
                        </div>
                    </div>
                </div>

                {/* Diet Section */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <UtensilsCrossed className="text-primary" size={20} />
                        Dieta Personalizada
                    </h3>

                    <div className="space-y-4">
                        {/* Pergunta: Segue alguma dieta? */}
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-3">
                                Você segue alguma dieta específica?
                            </label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSegueDieta(true)}
                                    className={`
                                        flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all
                                        ${segueDieta
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-white/10 bg-background text-white hover:border-white/20'
                                        }
                                    `}
                                >
                                    Sim
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSegueDieta(false);
                                        setDietMeals([]);
                                        setCurrentMeal({ tipo: '', horario: '', descricao: '' });
                                    }}
                                    className={`
                                        flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all
                                        ${!segueDieta
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-white/10 bg-background text-white hover:border-white/20'
                                        }
                                    `}
                                >
                                    Não
                                </button>
                            </div>
                        </div>

                        {/* Formulário de Dieta - Aparece apenas se segueDieta === true */}
                        {segueDieta && (
                            <div className="space-y-4 mt-6">
                                {/* Refeições já adicionadas */}
                                {dietMeals.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-text-muted">
                                            Refeições Adicionadas ({dietMeals.length})
                                        </p>
                                        {dietMeals.map((meal) => (
                                            <div
                                                key={meal.id}
                                                className="bg-background/50 border border-white/10 rounded-xl p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-primary font-bold text-sm">
                                                                {meal.tipo}
                                                            </span>
                                                            <span className="text-text-muted text-xs flex items-center gap-1">
                                                                <Clock size={12} />
                                                                {meal.horario}
                                                            </span>
                                                        </div>
                                                        <p className="text-white text-sm">
                                                            {meal.descricao}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMealClick(meal.id)}
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                                                    >
                                                        <Trash2 size={16} className="text-red-400 group-hover:text-red-300" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Formulário para nova refeição */}
                                {availableMealTypes.length > 0 ? (
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
                                        <p className="text-white font-semibold flex items-center gap-2">
                                            <Plus size={18} className="text-primary" />
                                            Adicionar Refeição
                                        </p>

                                        {/* Tipo de Refeição */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted mb-2">
                                                Tipo de Refeição
                                            </label>
                                            <CustomSelect
                                                value={currentMeal.tipo}
                                                onChange={(value) => setCurrentMeal({ ...currentMeal, tipo: value })}
                                                options={availableMealTypes.map(type => ({ value: type, label: type }))}
                                                placeholder="Selecione o tipo de refeição"
                                            />
                                        </div>

                                        {/* Horário */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted mb-2">
                                                Horário (horário médio da refeição)
                                            </label>
                                            <input
                                                type="time"
                                                value={currentMeal.horario}
                                                onChange={(e) => setCurrentMeal({ ...currentMeal, horario: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            />
                                            <p className="text-xs text-text-muted/70 mt-1">
                                                Informe o horário aproximado que você costuma fazer esta refeição
                                            </p>
                                        </div>

                                        {/* Descrição */}
                                        <div>
                                            <label className="block text-sm font-medium text-text-muted mb-2">
                                                Descrição (quantidade e alimento)
                                            </label>
                                            <textarea
                                                value={currentMeal.descricao}
                                                onChange={(e) => setCurrentMeal({ ...currentMeal, descricao: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                                placeholder="Ex: 2 fatias de pão integral, 2 ovos mexidos, 1 copo de café com leite desnatado"
                                            />
                                        </div>

                                        {/* Botão Salvar Refeição */}
                                        <button
                                            type="button"
                                            onClick={handleAddMeal}
                                            className="w-full bg-gradient-to-r from-primary to-secondary text-black font-bold py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                                        >
                                            <Plus size={20} />
                                            Salvar Refeição
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                        <p className="text-green-400 text-sm text-center">
                                            ✅ Todas as refeições foram adicionadas!
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
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

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Excluir Refeição"
                message="Tem certeza que deseja remover esta refeição da sua dieta personalizada?"
                confirmText="Sim, excluir"
                cancelText="Cancelar"
                type="danger"
                onConfirm={confirmRemoveMeal}
                onCancel={() => setConfirmModal({ isOpen: false, mealId: null })}
            />
        </div>
    );
}

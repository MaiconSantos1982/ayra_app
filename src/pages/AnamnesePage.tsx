import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Clock, UtensilsCrossed, Plus, Trash2, Calendar, Check, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CustomSelect from '../components/CustomSelect';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { updateProfile, getUserData } from '../lib/localStorage';
import type { DietMeal } from '../lib/localStorage';
import { saveDietMealsToSupabase } from '../lib/supabaseAuth';
import { estimateMacrosFromDescription } from '../lib/macroEstimator';

export default function AnamnesePage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [estimatingMealMacros, setEstimatingMealMacros] = useState(false);

    // Estados do Formulário
    const [formData, setFormData] = useState({
        nome: '',
        telefone: '',
        idade: '',
        data_nascimento: '',
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
    const [editingMealId, setEditingMealId] = useState<string | null>(null);

    const [currentMeal, setCurrentMeal] = useState({
        tipo: '',
        horario: '',
        descricao: '',
        // Novos campos de macros
        calorias: '',
        proteina: '',
        carboidratos: '',
        gorduras: ''
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

    // Filtra tipos que já foram adicionados (mas permite o tipo atual se estiver editando)
    const availableMealTypes = MEAL_TYPES.filter(
        type => !dietMeals.some(meal => meal.tipo === type && meal.id !== editingMealId)
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
            data_nascimento: '', // Novo campo
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
            loadedData.data_nascimento = prof.data_nascimento || '';
            loadedData.restricoes = prof.restricoes || '';
            loadedData.objetivo = prof.objetivo || '';

            // Carrega peso e altura separadamente
            if (prof.peso) {
                loadedData.peso = prof.peso.toString();
            }
            if (prof.altura) {
                loadedData.altura = prof.altura.toString();
            }

            // Novos campos
            loadedData.telefone = prof.telefone || '';
            loadedData.problemas_de_saude = prof.problemas_de_saude || '';
            loadedData.dificuldade = prof.dificuldade || '';
            loadedData.tem_nutri_ou_dieta = prof.tem_nutri_ou_dieta || '';
            loadedData.info_extra = prof.info_extra || '';

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
        let value = e.target.value.replace(/\D/g, '');

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
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
            value = value.slice(0, 3);
            if (value.length === 3) {
                value = `${value[0]},${value.slice(1)}`;
            } else if (value.length === 2) {
                value = `${value[0]},${value[1]}`;
            }
        }

        setFormData({ ...formData, altura: value });
    };

    // Helper para salvar dieta imediatamente
    const syncDiet = async (newMeals: DietMeal[]) => {
        setDietMeals(newMeals);

        // Atualiza LocalStorage
        const currentData = getUserData();
        if (currentData) {
            updateProfile({
                ...currentData.profile,
                segueDieta: true,
                customDiet: newMeals
            });
        }

        // Atualiza Supabase (se logado)
        if (user?.id) {
            try {
                await saveDietMealsToSupabase(user.id, newMeals);
            } catch (error) {
                console.error('Erro ao salvar dieta no Supabase:', error);
            }
        }
    };

    // Adiciona ou Atualiza uma refeição à dieta
    const handleAddMeal = async () => {
        if (!currentMeal.tipo || !currentMeal.horario || !currentMeal.descricao.trim()) {
            alert('Por favor, preencha o tipo, horário e descrição da refeição.');
            return;
        }

        const hasManualMacros = !!(
            currentMeal.calorias ||
            currentMeal.proteina ||
            currentMeal.carboidratos ||
            currentMeal.gorduras
        );

        let resolvedMeal = { ...currentMeal };

        // Se não houver macros preenchidos, estima automaticamente pela descrição
        if (!hasManualMacros) {
            const estimation = await estimateMacrosFromDescription(currentMeal.descricao.trim());
            if (estimation.matchedItems > 0) {
                resolvedMeal = {
                    ...resolvedMeal,
                    calorias: estimation.calorias.toString(),
                    proteina: estimation.proteina.toString(),
                    carboidratos: estimation.carboidratos.toString(),
                    gorduras: estimation.gorduras.toString(),
                };
            }
        }

        // Dados base da refeição (para criar ou atualizar)
        const mealData = {
            tipo: resolvedMeal.tipo as DietMeal['tipo'],
            horario: resolvedMeal.horario,
            descricao: resolvedMeal.descricao.trim(),
            // Salva macros se preenchidos
            calorias: resolvedMeal.calorias ? parseFloat(resolvedMeal.calorias) : undefined,
            proteina: resolvedMeal.proteina ? parseFloat(resolvedMeal.proteina) : undefined,
            carboidratos: resolvedMeal.carboidratos ? parseFloat(resolvedMeal.carboidratos) : undefined,
            gorduras: resolvedMeal.gorduras ? parseFloat(resolvedMeal.gorduras) : undefined
        };

        let updatedMeals: DietMeal[];

        if (editingMealId) {
            // ATUALIZAÇÃO: Mantém o ID original e substitui os dados
            updatedMeals = dietMeals.map(meal =>
                meal.id === editingMealId
                    ? { ...mealData, id: editingMealId }
                    : meal
            );
            setToast({ message: 'Refeição atualizada e sincronizada!', type: 'success' });
            setEditingMealId(null); // Sai do modo de edição
        } else {
            // CRIAÇÃO: Gera novo ID
            const newMeal: DietMeal = {
                id: `meal_${Date.now()}`,
                ...mealData
            };
            updatedMeals = [...dietMeals, newMeal];
            setToast({ message: 'Refeição salva e sincronizada!', type: 'success' });
        }

        await syncDiet(updatedMeals); // Salva imediatamente

        // Limpa o formulário atual
        setCurrentMeal({
            tipo: '',
            horario: '',
            descricao: '',
            calorias: '',
            proteina: '',
            carboidratos: '',
            gorduras: ''
        });
    };

    const handleEstimateDietMealMacros = async () => {
        if (!currentMeal.descricao.trim()) {
            setToast({ message: 'Descreva a refeição para calcular os macros.', type: 'warning' });
            return;
        }

        setEstimatingMealMacros(true);
        try {
            const estimation = await estimateMacrosFromDescription(currentMeal.descricao.trim());

            if (estimation.matchedItems === 0) {
                setToast({ message: 'Não encontrei alimentos dessa descrição na base nutricional.', type: 'warning' });
                return;
            }

            setCurrentMeal((prev) => ({
                ...prev,
                calorias: estimation.calorias.toString(),
                proteina: estimation.proteina.toString(),
                carboidratos: estimation.carboidratos.toString(),
                gorduras: estimation.gorduras.toString(),
            }));

            if (estimation.matchedItems < estimation.totalItems) {
                setToast({
                    message: `Macros estimados para ${estimation.matchedItems}/${estimation.totalItems} itens. Revise se necessário.`,
                    type: 'info',
                });
            } else {
                setToast({ message: 'Macros calculados automaticamente!', type: 'success' });
            }
        } catch (error) {
            console.error('Erro ao estimar macros da dieta:', error);
            setToast({ message: 'Erro ao calcular macros. Tente novamente.', type: 'error' });
        } finally {
            setEstimatingMealMacros(false);
        }
    };

    // Prepara formulário para edição
    const handleEditMeal = (meal: DietMeal) => {
        setEditingMealId(meal.id);
        setCurrentMeal({
            tipo: meal.tipo,
            horario: meal.horario,
            descricao: meal.descricao,
            calorias: meal.calorias?.toString() || '',
            proteina: meal.proteina?.toString() || '',
            carboidratos: meal.carboidratos?.toString() || '',
            gorduras: meal.gorduras?.toString() || ''
        });

        setToast({ message: 'Editando refeição...', type: 'info' });
    };

    // Abre modal de confirmação para remover refeição
    const handleRemoveMealClick = (mealId: string) => {
        setConfirmModal({ isOpen: true, mealId });
    };

    // Remove uma refeição da dieta (após confirmação)
    const confirmRemoveMeal = async () => {
        if (confirmModal.mealId) {
            const updatedMeals = dietMeals.filter(meal => meal.id !== confirmModal.mealId);
            await syncDiet(updatedMeals); // Salva imediatamente
            setToast({ message: 'Refeição removida e sincronizada!', type: 'success' });
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
                data_nascimento: formData.data_nascimento,
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
                // Importa e usa updateUserData do supabaseAuth
                const { updateUserData } = await import('../lib/supabaseAuth');

                const result = await updateUserData(user.id, {
                    nome: formData.nome,
                    telefone: formData.telefone,
                    data_nascimento: formData.data_nascimento,
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

                // SALVA A DIETA SEPARADAMENTE (NOVA TABELA) - SE usuário segue dieta
                if (segueDieta) {
                    await saveDietMealsToSupabase(user.id, dietMeals);
                } else {
                    // Se desmarcou, salva lista vazia para limpar
                    await saveDietMealsToSupabase(user.id, []);
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

                        {/* Data de Nascimento */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-text-muted mb-2">
                                Data de Nascimento *
                            </label>
                            <div className="relative w-full">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5 pointer-events-none" />
                                <input
                                    type="date"
                                    name="data_nascimento"
                                    value={formData.data_nascimento}
                                    onChange={handleChange}
                                    className="w-full max-w-full min-w-0 pl-12 pr-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none [color-scheme:dark]"
                                    required
                                />
                            </div>
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
                                        setCurrentMeal({
                                            tipo: '',
                                            horario: '',
                                            descricao: '',
                                            calorias: '',
                                            proteina: '',
                                            carboidratos: '',
                                            gorduras: ''
                                        });
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
                                                        {/* Mostra resumo de macros se tiver */}
                                                        {(meal.calorias || meal.proteina || meal.carboidratos || meal.gorduras) && (
                                                            <div className="flex gap-3 mt-2 text-xs text-text-muted">
                                                                {meal.calorias && <span>{meal.calorias} kcal</span>}
                                                                {meal.proteina && <span className="text-blue-300">{meal.proteina}g P</span>}
                                                                {meal.carboidratos && <span className="text-yellow-300">{meal.carboidratos}g C</span>}
                                                                {meal.gorduras && <span className="text-orange-300">{meal.gorduras}g G</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditMeal(meal)}
                                                            className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors group"
                                                            title="Editar refeição"
                                                        >
                                                            <Pencil size={16} className="text-yellow-400 group-hover:text-yellow-300" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMealClick(meal.id)}
                                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                                                            title="Excluir refeição"
                                                        >
                                                            <Trash2 size={16} className="text-red-400 group-hover:text-red-300" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Formulário para nova refeição */}
                                {availableMealTypes.length > 0 ? (
                                    <div className="space-y-6 pt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-primary/20 p-2 rounded-full">
                                                {editingMealId ? (
                                                    <Pencil size={20} className="text-yellow-400" />
                                                ) : (
                                                    <Plus size={20} className="text-primary" />
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">
                                                {editingMealId ? 'Editar Refeição' : 'Adicionar Refeição'}
                                            </h3>
                                        </div>

                                        {/* Tipo de Refeição */}
                                        <div>
                                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                                Tipo de Refeição
                                            </label>
                                            <CustomSelect
                                                value={currentMeal.tipo}
                                                onChange={(value) => setCurrentMeal({ ...currentMeal, tipo: value })}
                                                options={availableMealTypes.map(type => ({ value: type, label: type }))}
                                                placeholder="Selecione..."
                                            />
                                        </div>

                                        {/* Horário */}
                                        <div>
                                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                                Horário Médio
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type="time"
                                                    value={currentMeal.horario}
                                                    onChange={(e) => setCurrentMeal({ ...currentMeal, horario: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg focus:border-primary focus:outline-none transition-all appearance-none"
                                                    style={{ colorScheme: 'dark' }}
                                                />
                                                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none bg-transparent" size={20} />
                                            </div>
                                        </div>

                                        {/* Descrição */}
                                        <div>
                                            <label className="block text-base font-semibold text-gray-300 mb-2">
                                                O que você come?
                                            </label>
                                            <textarea
                                                value={currentMeal.descricao}
                                                onChange={(e) => setCurrentMeal({ ...currentMeal, descricao: e.target.value })}
                                                rows={3}
                                                className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg placeholder:text-gray-600 focus:border-primary focus:outline-none transition-all resize-none"
                                                placeholder="Ex: 2 fatias de pão, café com leite..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleEstimateDietMealMacros}
                                                disabled={estimatingMealMacros || !currentMeal.descricao.trim()}
                                                className="mt-3 w-full bg-blue-500/10 border border-blue-500/30 text-blue-300 font-semibold py-3 rounded-xl hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {estimatingMealMacros ? 'Calculando macros...' : 'Calcular macros automaticamente'}
                                            </button>
                                        </div>

                                        {/* MACRONUTRIENTES (Opcional) - Visual Limpo */}
                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 text-primary font-medium mb-4 hover:opacity-80"
                                                onClick={(e) => {
                                                    const content = e.currentTarget.nextElementSibling;
                                                    if (content) content.classList.toggle('hidden');
                                                }}
                                            >
                                                <UtensilsCrossed size={18} />
                                                Adicionar Macros (Opcional)
                                            </button>

                                            <div className="grid grid-cols-1 gap-3">
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-400">Calorias (kcal)</label>
                                                    <input
                                                        type="number"
                                                        value={currentMeal.calorias}
                                                        onChange={(e) => setCurrentMeal({ ...currentMeal, calorias: e.target.value })}
                                                        placeholder="0"
                                                        className="bg-transparent text-white text-xl font-bold focus:outline-none text-right placeholder:text-white/10 w-24"
                                                    />
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                                    <label className="text-sm font-medium text-blue-300">Proteína (g)</label>
                                                    <input
                                                        type="number"
                                                        value={currentMeal.proteina}
                                                        onChange={(e) => setCurrentMeal({ ...currentMeal, proteina: e.target.value })}
                                                        placeholder="0"
                                                        className="bg-transparent text-white text-xl font-bold focus:outline-none text-right placeholder:text-white/10 w-24"
                                                    />
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                                    <label className="text-sm font-medium text-yellow-300">Carboidratos (g)</label>
                                                    <input
                                                        type="number"
                                                        value={currentMeal.carboidratos}
                                                        onChange={(e) => setCurrentMeal({ ...currentMeal, carboidratos: e.target.value })}
                                                        placeholder="0"
                                                        className="bg-transparent text-white text-xl font-bold focus:outline-none text-right placeholder:text-white/10 w-24"
                                                    />
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                                    <label className="text-sm font-medium text-orange-300">Gorduras (g)</label>
                                                    <input
                                                        type="number"
                                                        value={currentMeal.gorduras}
                                                        onChange={(e) => setCurrentMeal({ ...currentMeal, gorduras: e.target.value })}
                                                        placeholder="0"
                                                        className="bg-transparent text-white text-xl font-bold focus:outline-none text-right placeholder:text-white/10 w-24"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Botão Salvar Refeição */}
                                        {/* Botão Salvar/Atualizar Refeição */}
                                        <button
                                            type="button"
                                            onClick={handleAddMeal}
                                            className={`w-full ${editingMealId ? 'bg-amber-500 text-black' : 'bg-primary text-black'} font-bold py-4 rounded-xl text-lg hover:brightness-110 transition-all flex items-center justify-center gap-2`}
                                        >
                                            {editingMealId ? <Save size={24} /> : <Plus size={24} />}
                                            {editingMealId ? 'Atualizar Refeição' : 'Salvar Refeição'}
                                        </button>

                                        {editingMealId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingMealId(null);
                                                    setCurrentMeal({
                                                        tipo: '',
                                                        horario: '',
                                                        descricao: '',
                                                        calorias: '',
                                                        proteina: '',
                                                        carboidratos: '',
                                                        gorduras: ''
                                                    });
                                                }}
                                                className="w-full mt-2 py-3 text-red-400 font-medium hover:bg-white/5 rounded-xl transition-colors"
                                            >
                                                Cancelar Edição
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Check className="text-green-500 w-6 h-6" />
                                        </div>
                                        <p className="text-green-400 font-medium">
                                            Todas as refeições foram adicionadas!
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
                    className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

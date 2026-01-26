/**
 * Funções de autenticação com Supabase
 * Estratégia simplificada: apenas email, sem senha
 */

import { supabase } from './supabase';

export interface AyraUser {
    id: number;
    nome: string;
    email: string;
    plano: string | null;
    telefone?: string;
    idade?: number;
    data_nascimento?: string; // Novo campo
    peso?: number;
    altura?: number;
    problemas_de_saude?: string;
    restricoes?: string;
    objetivo?: string;
    dificuldade?: string;
    tem_nutri_ou_dieta?: string;
    info_extra?: string;
}

// Função auxiliar para calcular idade
function calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

/**
 * Registra um novo usuário
 */
export async function registerUser(nome: string, email: string): Promise<{ success: boolean; user?: AyraUser; error?: string }> {
    try {
        // Verifica se email já existe
        const { data: existingUser } = await supabase
            .from('ayra_cadastro')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (existingUser) {
            return {
                success: false,
                error: 'Este email já está cadastrado. Faça login.'
            };
        }

        // Insere novo usuário
        const { data, error } = await supabase
            .from('ayra_cadastro')
            .insert({
                nome: nome.trim(),
                email: email.toLowerCase().trim(),
                plano: null, // Freemium por padrão
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao registrar usuário:', error);
            return {
                success: false,
                error: 'Erro ao criar conta. Tente novamente.'
            };
        }

        return {
            success: true,
            user: data as AyraUser
        };
    } catch (error) {
        console.error('Erro ao registrar:', error);
        return {
            success: false,
            error: 'Erro inesperado. Verifique sua conexão.'
        };
    }
}

/**
 * Faz login do usuário (busca por email)
 */
export async function loginUser(email: string): Promise<{ success: boolean; user?: AyraUser; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('ayra_cadastro')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error || !data) {
            return {
                success: false,
                error: 'Email não encontrado. Cadastre-se primeiro.'
            };
        }

        return {
            success: true,
            user: data as AyraUser
        };
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return {
            success: false,
            error: 'Erro ao fazer login. Verifique sua conexão.'
        };
    }
}

/**
 * Atualiza dados do usuário (sincronização com Supabase)
 */
export async function updateUserData(userId: number, data: Partial<AyraUser>): Promise<{ success: boolean; error?: string }> {
    try {
        const updatePayload: any = {
            nome: data.nome,
            telefone: data.telefone,
            // idade: data.idade, // Será calculado abaixo se tiver data_nascimento
            peso: data.peso,
            altura: data.altura,
            problemas_de_saude: data.problemas_de_saude,
            restricoes: data.restricoes,
            objetivo: data.objetivo,
            dificuldade: data.dificuldade,
            tem_nutri_ou_dieta: data.tem_nutri_ou_dieta,
            info_extra: data.info_extra,
            updated_at: new Date().toISOString()
        };

        // Lógica de Data de Nascimento e Idade
        if (data.data_nascimento) {
            updatePayload.data_nascimento = data.data_nascimento;
            const calculatedAge = calculateAge(data.data_nascimento);
            updatePayload.idade = calculatedAge; // Salva idade calculada automaticamente
        } else if (data.idade) {
            updatePayload.idade = data.idade; // Fallback para idade manual
        }

        const { error } = await supabase
            .from('ayra_cadastro')
            .update(updatePayload)
            .eq('id', userId);

        if (error) {
            console.error('Erro ao atualizar dados:', error);
            return {
                success: false,
                error: 'Erro ao salvar dados no servidor.'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return {
            success: false,
            error: 'Erro inesperado ao salvar.'
        };
    }
}

/**
 * Verifica se usuário está logado (localStorage)
 */
export function isUserLoggedIn(): boolean {
    return !!localStorage.getItem('ayra_user_email');
}

/**
 * Obtém dados do usuário do localStorage
 */
export function getCurrentUser(): { email: string; nome: string; id: number; premium: boolean } | null {
    const email = localStorage.getItem('ayra_user_email');
    const nome = localStorage.getItem('ayra_user_name');
    const id = localStorage.getItem('ayra_user_id');
    const premium = localStorage.getItem('ayra_user_premium') === 'true';

    if (!email || !nome || !id) return null;

    return {
        email,
        nome,
        id: parseInt(id),
        premium
    };
}

/**
 * Salva dados do usuário no localStorage
 */
export function saveUserToLocalStorage(user: AyraUser & { created_at?: string }): void {
    localStorage.setItem('ayra_user_email', user.email);
    localStorage.setItem('ayra_user_name', user.nome);
    localStorage.setItem('ayra_user_id', user.id.toString());
    localStorage.setItem('ayra_user_premium', (user.plano === 'premium').toString());

    // Salva data de criação para verificar bloqueio de 30 dias
    if (user.created_at) {
        localStorage.setItem('ayra_user_created_at', user.created_at);
    }
}

/**
 * Faz logout (limpa localStorage)
 */
export function logoutUser(): void {
    localStorage.removeItem('ayra_user_email');
    localStorage.removeItem('ayra_user_name');
    localStorage.removeItem('ayra_user_id');
    localStorage.removeItem('ayra_user_premium');
    localStorage.removeItem('ayra_user_created_at'); // Remove data de criação
    localStorage.removeItem('demo_user'); // Remove demo se existir
}

/**
 * Verifica e atualiza status premium do usuário
 */
export async function refreshUserPremiumStatus(): Promise<boolean> {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    try {
        const { data } = await supabase
            .from('ayra_cadastro')
            .select('plano')
            .eq('id', currentUser.id)
            .single();

        if (data) {
            const isPremium = data.plano === 'premium';
            localStorage.setItem('ayra_user_premium', isPremium.toString());
            return isPremium;
        }

        return false;
    } catch (error) {
        console.error('Erro ao verificar status premium:', error);
        return false;
    }
}

/**
 * Sincroniza dados do Supabase com localStorage
 * Carrega dados do perfil salvos no Supabase e atualiza o localStorage
 */
export async function syncUserDataFromSupabase(userId: number): Promise<void> {
    try {
        const { data, error } = await supabase
            .from('ayra_cadastro')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar dados do Supabase:', error);
            return;
        }

        if (data) {
            // Importa getUserData e saveUserData diretamente
            const { getUserData, saveUserData } = await import('./localStorage');

            // Obtém dados atuais do localStorage
            const currentData = getUserData();

            if (!currentData) {
                return;
            }

            // Atualiza apenas se houver dados no Supabase
            const profileUpdates: any = {};

            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
            if (data.telefone) profileUpdates.telefone = data.telefone;
            if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
            if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
            if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
            if (data.info_extra) profileUpdates.info_extra = data.info_extra;
            if (data.data_nascimento) profileUpdates.data_nascimento = data.data_nascimento; // Novo campo


            // Atualiza localStorage com dados do Supabase
            if (Object.keys(profileUpdates).length > 0) {
                currentData.profile = { ...currentData.profile, ...profileUpdates };
                saveUserData(currentData);
                console.log('✅ Dados (básicos) sincronizados com sucesso!');
            }

            // Sincroniza Dieta Personalizada (Tabela separada)
            try {
                const dietMeals = await getDietMealsFromSupabase(userId);
                if (dietMeals && dietMeals.length > 0) {
                    currentData.profile.segueDieta = true;
                    currentData.profile.customDiet = dietMeals;
                    saveUserData(currentData);
                    console.log('✅ Dieta personalizada sincronizada com sucesso!');
                }
            } catch (dietError) {
                console.error('Erro ao sincronizar dieta:', dietError);
            }
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
    }
}

/**
 * Salva apenas as refeições da dieta no Supabase (nova tabela)
 */
export async function saveDietMealsToSupabase(_userId: number, dietMeals: any[]): Promise<{ success: boolean; error?: string }> {
    try {
        // Primeiro, limpa as refeições existentes deste usuário para garantir consistência

        // NOTA: Se userId for numérico (como parece ser o caso no ayra_cadastro), mas references auth.users (uuid) na nova tabela,
        // teremos um conflito de tipos. No código atual, ayra_cadastro.id é int8 (number).
        // NO ENTANTO, a tabela ayra_dieta_refeicoes pede id_usuario UUID.
        // Vamos verificar como o id é obtido.

        // Se o sistema usa auth.users do Supabase Auth para login, deveríamos usar user.id (UUID).
        // O sistema atual 'ayra_cadastro' usa ID numérico auto-incremento, que é DIFERENTE do auth.users.

        // Para manter compatibilidade RÁPIDA sem refatorar todo o auth, vamos assumir que o sistema está em transição.
        // Mas espere, a migration SQL usou `id_usuario uuid references auth.users`.
        // O código atual `syncUserDataFromSupabase` recebe `userId: number`.
        // Isso é um problema. O `currentUser` retornado por `getCurrentUser` tem id number.

        // SOLUÇÃO PROVISÓRIA: Vamos buscar o UUID do usuário logado no Auth atual.

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: 'Usuário não autenticado no Supabase Auth' };
        }

        // Deleta usando o UUID do Auth
        await supabase
            .from('ayra_dieta_refeicoes')
            .delete()
            .eq('id_usuario', user.id);

        if (dietMeals.length === 0) return { success: true };

        // Mapeia para o formato do banco
        const dbMeals = dietMeals.map(meal => ({
            id_usuario: user.id,
            tipo_refeicao: meal.tipo,
            horario: meal.horario,
            descricao: meal.descricao,
            calorias: meal.calorias || 0,
            proteina: meal.proteina || 0,
            carboidratos: meal.carboidratos || 0,
            gorduras: meal.gorduras || 0
        }));

        const { error: insertError } = await supabase
            .from('ayra_dieta_refeicoes')
            .insert(dbMeals);

        if (insertError) throw insertError;

        return { success: true };

    } catch (error: any) {
        console.error('Erro ao salvar dieta no Supabase:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Busca refeições da dieta do Supabase
 */
export async function getDietMealsFromSupabase(_userId: number): Promise<any[]> {
    try {
        // Precisa do UUID do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('ayra_dieta_refeicoes')
            .select('*')
            .eq('id_usuario', user.id)
            .order('horario', { ascending: true });

        if (error) throw error;
        if (!data) return [];

        // Mapeia do banco para o App
        return data.map(dbMeal => ({
            id: 'diet_' + dbMeal.id, // ID temporário para o front
            tipo: dbMeal.tipo_refeicao,
            horario: dbMeal.horario.substring(0, 5), // Remove segundos se houver
            descricao: dbMeal.descricao,
            calorias: Number(dbMeal.calorias) || undefined,
            proteina: Number(dbMeal.proteina) || undefined,
            carboidratos: Number(dbMeal.carboidratos) || undefined,
            gorduras: Number(dbMeal.gorduras) || undefined
        }));

    } catch (error) {
        console.error('Erro ao buscar dieta do Supabase:', error);
        return [];
    }
}

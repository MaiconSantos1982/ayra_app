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
    peso?: number;
    altura?: number;
    problemas_de_saude?: string;
    restricoes?: string;
    objetivo?: string;
    dificuldade?: string;
    tem_nutri_ou_dieta?: string;
    info_extra?: string;
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
        const { error } = await supabase
            .from('ayra_cadastro')
            .update({
                nome: data.nome,
                telefone: data.telefone,
                idade: data.idade,
                peso: data.peso,
                altura: data.altura,
                problemas_de_saude: data.problemas_de_saude,
                restricoes: data.restricoes,
                objetivo: data.objetivo,
                dificuldade: data.dificuldade,
                tem_nutri_ou_dieta: data.tem_nutri_ou_dieta,
                info_extra: data.info_extra,
                updated_at: new Date().toISOString()
            })
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
        console.log('🔄 Iniciando sincronização para userId:', userId);

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
            console.log('📦 Dados recebidos do Supabase:', data);

            // Importa getUserData e saveUserData diretamente
            const { getUserData, saveUserData } = await import('./localStorage');

            // Obtém dados atuais do localStorage
            const currentData = getUserData();

            if (!currentData) {
                console.warn('⚠️ Nenhum dado encontrado no localStorage');
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

            console.log('📝 Campos para atualizar:', Object.keys(profileUpdates));
            console.log('💾 Valores:', profileUpdates);

            // Atualiza localStorage com dados do Supabase
            if (Object.keys(profileUpdates).length > 0) {
                currentData.profile = { ...currentData.profile, ...profileUpdates };
                saveUserData(currentData);
                console.log('✅ Dados sincronizados com sucesso!');
                console.log('📋 Perfil atualizado:', currentData.profile);
            } else {
                console.warn('⚠️ Nenhum campo para atualizar');
            }
        } else {
            console.warn('⚠️ Nenhum dado retornado do Supabase');
        }
    } catch (error) {
        console.error('❌ Erro ao sincronizar dados:', error);
    }
}

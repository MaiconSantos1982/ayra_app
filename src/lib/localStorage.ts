/**
 * Sistema de armazenamento local para dados do usuário
 * Mantém dados sensíveis no dispositivo do usuário
 */

export interface DietMeal {
    id: string;
    tipo: 'Café da manhã' | 'Lanche da manhã' | 'Almoço' | 'Lanche da tarde' | 'Jantar' | 'Ceia' | 'Outros';
    horario: string; // formato HH:MM
    descricao: string;
}

export interface UserProfile {
    nome: string;
    idade?: string;
    objetivo?: string;
    restricoes?: string;
    peso?: number;
    altura?: number;
    telefone?: string;
    problemas_de_saude?: string;
    dificuldade?: string;
    tem_nutri_ou_dieta?: string;
    info_extra?: string;
    segueDieta?: boolean; // Se a pessoa segue alguma dieta
    customDiet?: DietMeal[]; // Refeições da dieta personalizada
}

export interface MealRecord {
    id: string;
    tipo: string;
    descricao: string;
    timestamp: string;
    foto?: string; // base64 ou URL
}

export interface DailyData {
    date: string; // YYYY-MM-DD
    meals: MealRecord[];
    water: number; // ml
    exercise: boolean;
    sleep: number; // horas
    mood: 'great' | 'good' | 'ok' | 'bad' | null;
    weight?: number;
}

export interface Goals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
    exercise: number; // minutos
    sleep: number; // horas
}

export interface UserData {
    profile: UserProfile;
    goals: Goals;
    dailyRecords: Record<string, DailyData>; // key: YYYY-MM-DD
    streak: number;
    lastAccess: string;
    premium: boolean; // Novo campo
    premiumExpiry?: string; // Opcional: data de expiração
}

const STORAGE_KEY = 'ayra_user_data';
const BACKUP_KEY = 'ayra_backup';

/**
 * Obtém os dados do usuário do localStorage
 */
export function getUserData(): UserData | null {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return null;
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        return null;
    }
}

/**
 * Salva os dados do usuário no localStorage
 */
export function saveUserData(data: UserData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        // Atualiza backup
        createBackup(data);
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
    }
}

/**
 * Inicializa dados do usuário (primeiro acesso)
 */
export function initializeUserData(profile: UserProfile): UserData {
    const initialData: UserData = {
        profile,
        goals: {
            calories: 2000,
            protein: 150,
            carbs: 200,
            fat: 60,
            water: 2000,
            exercise: 30,
            sleep: 8,
        },
        dailyRecords: {},
        streak: 0,
        lastAccess: new Date().toISOString(),
        premium: false, // Novo campo: inicia como Free
    };

    saveUserData(initialData);
    return initialData;
}

/**
 * Atualiza o perfil do usuário
 */
export function updateProfile(profile: Partial<UserProfile>): void {
    const data = getUserData();
    if (!data) return;

    data.profile = { ...data.profile, ...profile };
    saveUserData(data);
}

/**
 * Atualiza as metas do usuário
 */
export function updateGoals(goals: Partial<Goals>): void {
    const data = getUserData();
    if (!data) return;

    data.goals = { ...data.goals, ...goals };
    saveUserData(data);
}

/**
 * Obtém os dados do dia (hoje ou data específica)
 */
export function getDailyData(date?: string): DailyData {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = getUserData();

    if (!data || !data.dailyRecords[targetDate]) {
        return {
            date: targetDate,
            meals: [],
            water: 0,
            exercise: false,
            sleep: 0,
            mood: null,
        };
    }

    return data.dailyRecords[targetDate];
}

/**
 * Salva os dados do dia
 */
export function saveDailyData(dailyData: DailyData): void {
    const data = getUserData();
    if (!data) return;

    data.dailyRecords[dailyData.date] = dailyData;
    data.lastAccess = new Date().toISOString();

    // Atualiza streak
    data.streak = calculateStreak(data.dailyRecords);

    saveUserData(data);
}

/**
 * Adiciona uma refeição ao dia atual
 */
export function addMeal(meal: Omit<MealRecord, 'id' | 'timestamp'>): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);

    const newMeal: MealRecord = {
        ...meal,
        id: `meal_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };

    dailyData.meals.push(newMeal);
    saveDailyData(dailyData);
}

/**
 * Atualiza água consumida
 */
export function updateWater(amount: number): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);
    dailyData.water = Math.max(0, amount);
    saveDailyData(dailyData);
}

/**
 * Atualiza exercício
 */
export function updateExercise(done: boolean): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);
    dailyData.exercise = done;
    saveDailyData(dailyData);
}

/**
 * Atualiza sono
 */
export function updateSleep(hours: number): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);
    dailyData.sleep = hours;
    saveDailyData(dailyData);
}

/**
 * Atualiza humor
 */
export function updateMood(mood: 'great' | 'good' | 'ok' | 'bad'): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);
    dailyData.mood = mood;
    saveDailyData(dailyData);
}

/**
 * Atualiza peso
 */
export function updateWeight(weight: number): void {
    const today = new Date().toISOString().split('T')[0];
    const dailyData = getDailyData(today);
    dailyData.weight = weight;
    saveDailyData(dailyData);

    // Atualiza também no perfil
    updateProfile({ peso: weight });
}

/**
 * Calcula o streak (dias consecutivos com registro)
 */
function calculateStreak(records: Record<string, DailyData>): number {
    const dates = Object.keys(records).sort().reverse();
    if (dates.length === 0) return 0;

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < dates.length; i++) {
        const date = new Date(dates[i]);
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        // Verifica se é o dia esperado (consecutivo)
        if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
            // Verifica se teve pelo menos uma refeição registrada
            if (records[dates[i]].meals.length > 0) {
                streak++;
            } else {
                break;
            }
        } else {
            break;
        }
    }

    return streak;
}

/**
 * Obtém histórico de peso (últimos 30 dias)
 */
export function getWeightHistory(): Array<{ date: string; weight: number }> {
    const data = getUserData();
    if (!data) return [];

    const history: Array<{ date: string; weight: number }> = [];
    const dates = Object.keys(data.dailyRecords).sort();

    dates.forEach(date => {
        const record = data.dailyRecords[date];
        if (record.weight) {
            history.push({ date, weight: record.weight });
        }
    });

    return history.slice(-30); // Últimos 30 registros
}

/**
 * Cria backup dos dados
 */
function createBackup(data: UserData): void {
    try {
        const backup = {
            data,
            timestamp: new Date().toISOString(),
            version: '1.0',
        };
        localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
        console.error('Erro ao criar backup:', error);
    }
}

/**
 * Exporta dados para JSON (download)
 */
export function exportData(): string {
    const data = getUserData();
    if (!data) return '';

    const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        version: '1.0',
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Importa dados de JSON
 */
export function importData(jsonString: string): boolean {
    try {
        const importedData = JSON.parse(jsonString);

        // Validação básica
        if (!importedData.profile || !importedData.goals) {
            throw new Error('Dados inválidos');
        }

        saveUserData(importedData);
        return true;
    } catch (error) {
        console.error('Erro ao importar dados:', error);
        return false;
    }
}

/**
 * Limpa todos os dados (logout)
 */
export function clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
}

/**
 * Obtém estatísticas gerais
 */
export function getStats() {
    const data = getUserData();
    if (!data) return null;

    const totalDays = Object.keys(data.dailyRecords).length;
    const totalMeals = Object.values(data.dailyRecords).reduce(
        (sum, day) => sum + day.meals.length,
        0
    );

    return {
        streak: data.streak,
        totalDays,
        totalMeals,
        lastAccess: data.lastAccess,
    };
}

/**
 * Interface para limites de chat
 */
export interface ChatLimits {
    dailyCount: number;
    monthlyCount: number;
    lastResetDate: string; // YYYY-MM-DD
    lastResetMonth: string; // YYYY-MM
}

const CHAT_LIMITS_KEY = 'ayra_chat_limits';

/**
 * Obtém os limites de chat do localStorage
 */
export function getChatLimits(): ChatLimits {
    try {
        const data = localStorage.getItem(CHAT_LIMITS_KEY);
        if (!data) {
            return {
                dailyCount: 0,
                monthlyCount: 0,
                lastResetDate: new Date().toISOString().split('T')[0],
                lastResetMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
            };
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao carregar limites de chat:', error);
        return {
            dailyCount: 0,
            monthlyCount: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            lastResetMonth: new Date().toISOString().substring(0, 7),
        };
    }
}

/**
 * Salva os limites de chat no localStorage
 */
export function saveChatLimits(limits: ChatLimits): void {
    try {
        localStorage.setItem(CHAT_LIMITS_KEY, JSON.stringify(limits));
    } catch (error) {
        console.error('Erro ao salvar limites de chat:', error);
    }
}

/**
 * Incrementa o contador de mensagens (diário e mensal)
 */
export function incrementChatCount(): void {
    const limits = getChatLimits();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Reset diário
    if (limits.lastResetDate !== today) {
        limits.dailyCount = 0;
        limits.lastResetDate = today;
    }

    // Reset mensal
    if (limits.lastResetMonth !== currentMonth) {
        limits.monthlyCount = 0;
        limits.lastResetMonth = currentMonth;
    }

    // Incrementa contadores
    limits.dailyCount++;
    limits.monthlyCount++;

    saveChatLimits(limits);
}

/**
 * Verifica se o usuário pode enviar mensagem
 * Retorna: { canSend: boolean, reason?: string }
 */
export function canSendChatMessage(isPremium: boolean, userCreatedAt?: string): { canSend: boolean; reason?: string } {
    // Premium sempre pode enviar
    if (isPremium) {
        return { canSend: true };
    }

    // Verifica se passou 30 dias do cadastro
    if (userCreatedAt) {
        const createdDate = new Date(userCreatedAt);
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 30) {
            return {
                canSend: false,
                reason: 'Chat bloqueado após 30 dias. Assine o Premium para continuar usando! 🌟'
            };
        }
    }

    const limits = getChatLimits();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Reset diário se necessário
    if (limits.lastResetDate !== today) {
        limits.dailyCount = 0;
        limits.lastResetDate = today;
        saveChatLimits(limits);
    }

    // Reset mensal se necessário
    if (limits.lastResetMonth !== currentMonth) {
        limits.monthlyCount = 0;
        limits.lastResetMonth = currentMonth;
        saveChatLimits(limits);
    }

    // Verifica limite diário (5 mensagens/dia)
    if (limits.dailyCount >= 5) {
        return {
            canSend: false,
            reason: 'Limite diário de 5 mensagens atingido. Volte amanhã ou assine o Premium! 💬'
        };
    }

    // Verifica limite mensal (20 mensagens/mês)
    if (limits.monthlyCount >= 20) {
        return {
            canSend: false,
            reason: 'Limite mensal de 20 mensagens atingido. Assine o Premium para continuar! 🚀'
        };
    }

    return { canSend: true };
}

/**
 * Reseta os limites de chat (útil para testes)
 */
export function resetChatLimits(): void {
    localStorage.removeItem(CHAT_LIMITS_KEY);
}

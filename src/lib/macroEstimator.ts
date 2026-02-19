import { supabase } from './supabase';

interface FoodNutrition {
    descricao_alimento: string;
    kcal: number;
    carboidrato_g: number;
    proteina_g: number;
    lipideos_g: number;
}

interface FoodNutritionIndexed extends FoodNutrition {
    normalizedDescription: string;
    tokens: string[];
}

export interface MacroEstimationResult {
    calorias: number;
    carboidratos: number;
    proteina: number;
    gorduras: number;
    matchedItems: number;
    totalItems: number;
}

const COMMON_UNITS = [
    'unidade', 'unidades', 'fatia', 'fatias', 'colher', 'colheres',
    'xicara', 'xícara', 'xicaras', 'xícaras', 'copo', 'copos',
    'porcao', 'porção', 'porcoes', 'porções', 'pedaço', 'pedaços',
];

const STOP_WORDS = new Set([
    'de', 'da', 'do', 'das', 'dos', 'com', 'sem', 'ao', 'aos', 'a', 'o', 'e',
]);

// Regras para normalizar variações comuns de escrita.
const PHRASE_CANONICAL_RULES: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bpeito de galinha\b/g, replacement: 'peito de frango' },
    { pattern: /\bcostela de porco\b/g, replacement: 'costela suina' },
    { pattern: /\bcostela de porca\b/g, replacement: 'costela suina' },
];

const TOKEN_CANONICAL_MAP: Record<string, string> = {
    porco: 'suino',
    porca: 'suino',
    suina: 'suino',
    suino: 'suino',
    suinas: 'suino',
    suinos: 'suino',
    boi: 'bovino',
    vaca: 'bovino',
    gado: 'bovino',
    bovina: 'bovino',
    bovino: 'bovino',
    galinha: 'frango',
    galinhas: 'frango',
    franga: 'frango',
    frango: 'frango',
    assada: 'assado',
    cozida: 'cozido',
    grelhada: 'grelhado',
    frita: 'frito',
    refogada: 'refogado',
};

const FOOD_UNIT_GRAMS: Array<{ pattern: RegExp; grams: number }> = [
    { pattern: /\bovo(s)?\b/i, grams: 50 },
    { pattern: /pao frances|pão francês/i, grams: 50 },
    { pattern: /\bbanana\b/i, grams: 86 },
    { pattern: /maca|maçã/i, grams: 130 },
    { pattern: /\biogurte\b/i, grams: 170 },
];

function parsePtNumber(value: string): number {
    return parseFloat(value.replace(',', '.'));
}

function normalizeText(value: string): string {
    const normalized = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return PHRASE_CANONICAL_RULES.reduce(
        (text, rule) => text.replace(rule.pattern, rule.replacement),
        normalized
    );
}

function singularize(token: string): string {
    if (token.length > 3 && token.endsWith('s')) {
        return token.slice(0, -1);
    }
    return token;
}

function tokenize(value: string): string[] {
    return normalizeText(value)
        .split(' ')
        .map(singularize)
        .map((token) => TOKEN_CANONICAL_MAP[token] || token)
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function splitFoodItems(description: string): string[] {
    return description
        .split(/,| e /i)
        .map((item) => item.trim())
        .filter(Boolean);
}

function inferGrams(item: string, foodName: string): number {
    const gramsMatch = item.match(/(\d+(?:[.,]\d+)?)\s*(g|gramas?)\b/i);
    if (gramsMatch) {
        return parsePtNumber(gramsMatch[1]);
    }

    const quantityMatch = item.match(/^(\d+(?:[.,]\d+)?)\s+/);
    const quantity = quantityMatch ? parsePtNumber(quantityMatch[1]) : 1;

    const rule = FOOD_UNIT_GRAMS.find((entry) => entry.pattern.test(foodName));
    if (rule) return quantity * rule.grams;

    return quantity * 100;
}

function sanitizeItem(item: string): string {
    let cleaned = item
        .replace(/^(\d+(?:[.,]\d+)?)\s*/i, '')
        .replace(/(\d+(?:[.,]\d+)?)\s*(g|gramas?)\b/gi, '')
        .trim();

    const unitRegex = new RegExp(`^(${COMMON_UNITS.join('|')})\\s+`, 'i');
    cleaned = cleaned.replace(unitRegex, '').trim();

    return cleaned;
}

let nutritionCache: FoodNutritionIndexed[] | null = null;

async function getNutritionCache(): Promise<FoodNutritionIndexed[]> {
    if (nutritionCache) return nutritionCache;

    const { data, error } = await supabase
        .from('ayra_alimentos_nutricionais')
        .select('descricao_alimento, kcal, carboidrato_g, proteina_g, lipideos_g')
        .order('descricao_alimento', { ascending: true })
        .limit(2000);

    if (error) {
        console.error('Erro ao carregar base nutricional:', error);
        return [];
    }

    nutritionCache = (data || []).map((food) => ({
        ...(food as FoodNutrition),
        normalizedDescription: normalizeText(food.descricao_alimento),
        tokens: tokenize(food.descricao_alimento),
    }));

    return nutritionCache;
}

function scoreMatch(inputTokens: string[], inputNormalized: string, food: FoodNutritionIndexed): number {
    let score = 0;

    if (food.normalizedDescription === inputNormalized) {
        score += 10;
    } else if (food.normalizedDescription.includes(inputNormalized)) {
        score += 6;
    }

    const foodTokenSet = new Set(food.tokens);
    for (const token of inputTokens) {
        if (foodTokenSet.has(token)) {
            score += 2;
        }
    }

    if (inputTokens.length > 0 && food.tokens.includes(inputTokens[0])) {
        score += 1;
    }

    return score;
}

async function findFoodNutrition(foodName: string): Promise<FoodNutrition | null> {
    const foods = await getNutritionCache();
    if (foods.length === 0) return null;

    const inputNormalized = normalizeText(foodName);
    const inputTokens = tokenize(foodName);
    if (!inputNormalized || inputTokens.length === 0) return null;

    let best: FoodNutritionIndexed | null = null;
    let bestScore = 0;

    for (const food of foods) {
        const score = scoreMatch(inputTokens, inputNormalized, food);
        if (score > bestScore) {
            bestScore = score;
            best = food;
        }
    }

    // Evita falso positivo quando não há sobreposição mínima de termos
    if (!best || bestScore < 2) return null;
    return best;
}

export async function estimateMacrosFromDescription(description: string): Promise<MacroEstimationResult> {
    const items = splitFoodItems(description);
    if (!items.length) {
        return {
            calorias: 0,
            carboidratos: 0,
            proteina: 0,
            gorduras: 0,
            matchedItems: 0,
            totalItems: 0,
        };
    }

    let calorias = 0;
    let carboidratos = 0;
    let proteina = 0;
    let gorduras = 0;
    let matchedItems = 0;

    for (const rawItem of items) {
        const foodName = sanitizeItem(rawItem);
        if (!foodName) continue;

        const nutrition = await findFoodNutrition(foodName);
        if (!nutrition) continue;

        const grams = inferGrams(rawItem, foodName);
        const factor = grams / 100;

        calorias += (nutrition.kcal || 0) * factor;
        carboidratos += (nutrition.carboidrato_g || 0) * factor;
        proteina += (nutrition.proteina_g || 0) * factor;
        gorduras += (nutrition.lipideos_g || 0) * factor;
        matchedItems++;
    }

    return {
        calorias: Math.round(calorias),
        carboidratos: Math.round(carboidratos * 10) / 10,
        proteina: Math.round(proteina * 10) / 10,
        gorduras: Math.round(gorduras * 10) / 10,
        matchedItems,
        totalItems: items.length,
    };
}

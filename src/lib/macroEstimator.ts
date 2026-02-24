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

export interface MacroDebugItem {
    rawItem: string;
    sanitizedItem: string;
    grams: number;
    matched: boolean;
    matchedFood?: string;
    score?: number;
    overlapCount?: number;
    kcal?: number;
    carboidratos?: number;
    proteina?: number;
    gorduras?: number;
    reason?: string;
    adjustment?: string;
}

export interface MacroEstimationResult {
    calorias: number;
    carboidratos: number;
    proteina: number;
    gorduras: number;
    matchedItems: number;
    totalItems: number;
    debugItems?: MacroDebugItem[];
}

interface FindFoodResult {
    food: FoodNutrition;
    score: number;
    overlapCount: number;
}

const COMMON_UNITS = [
    'unidade', 'unidades', 'fatia', 'fatias', 'colher', 'colheres',
    'xicara', 'xícara', 'xicaras', 'xícaras', 'copo', 'copos',
    'porcao', 'porção', 'porcoes', 'porções', 'pedaço', 'pedaços',
];

const UNIT_START_WORDS = [
    'colher', 'colheres', 'fatia', 'fatias', 'xicara', 'xícara', 'xicaras', 'xícaras',
    'copo', 'copos', 'unidade', 'unidades', 'porcao', 'porção', 'porcoes', 'porções',
    'pedaço', 'pedaços',
];

const STOP_WORDS = new Set([
    'de', 'da', 'do', 'das', 'dos', 'com', 'sem', 'ao', 'aos', 'a', 'o', 'e',
]);

// Regras para normalizar variações comuns de escrita.
const PHRASE_CANONICAL_RULES: Array<{ pattern: RegExp; replacement: string }> = [
    { pattern: /\bpeito de galinha\b/g, replacement: 'peito de frango' },
    { pattern: /\bcostela de porco\b/g, replacement: 'costela suina' },
    { pattern: /\bcostela de porca\b/g, replacement: 'costela suina' },
    { pattern: /\bmacarrao espaguete\b|\bmacarrão espaguete\b/g, replacement: 'macarrao trigo' },
    { pattern: /\bqueijo ralado\b/g, replacement: 'queijo parmesao' },
    { pattern: /\bmanga espada\b/g, replacement: 'manga' },
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
    mussarela: 'mozarela',
    assada: 'assado',
    cozida: 'cozido',
    grelhada: 'grelhado',
    frita: 'frito',
    refogada: 'refogado',
};

const FOOD_UNIT_GRAMS: Array<{ pattern: RegExp; grams: number }> = [
    { pattern: /\bovo(s)?\b/i, grams: 50 },
    { pattern: /\bpao frances\b|\bpão francês\b/i, grams: 50 },
    { pattern: /\bbanana\b/i, grams: 86 },
    { pattern: /\bmaca\b|\bmaçã\b/i, grams: 130 },
    { pattern: /\bmanga\b/i, grams: 150 },
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
    const normalized = description
        .replace(/\n+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Forca separacao quando o usuario escreve varios itens em sequencia sem virgulas.
    const withNumericBreaks = normalized.replace(
        /([a-zA-ZÀ-ÿ])\s+(\d+(?:[.,]\d+)?\s*(?:g|gr|gramas?|kg|ml|l)\b)/g,
        '$1, $2'
    );

    const withCountBreaks = withNumericBreaks.replace(
        /([a-zA-ZÀ-ÿ])\s+(\d+(?:[.,]\d+)?\s+(?:pao|pão|ovos?|banana|manga|maca|maçã|fatia|fatias|colher|colheres|queijo)\b)/gi,
        '$1, $2'
    );

    const unitWordGroup = UNIT_START_WORDS.join('|');
    const withArticleBreaks = withCountBreaks.replace(
        new RegExp(`([a-zA-ZÀ-ÿ])\\s+((?:um|uma|uns|umas)\\s+(?:${unitWordGroup}|ovo(?:s)?|manga|banana|maca|maçã)\\b)`, 'gi'),
        '$1, $2'
    );

    return withArticleBreaks
        .split(/,|;|\s+e\s+/i)
        .map((item) => item.trim())
        .filter(Boolean);
}

function inferGrams(item: string, foodName: string): number {
    const gramsMatch = item.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b/i);
    if (gramsMatch) {
        return parsePtNumber(gramsMatch[1]);
    }

    const quantityMatch = item.match(/^(\d+(?:[.,]\d+)?)\s+/);
    const quantity = quantityMatch ? parsePtNumber(quantityMatch[1]) : 1;

    const isSoupSpoon = /\bcolher(?:es)?\s+de\s+sopa\b/i.test(item);
    const isTeaSpoon = /\bcolher(?:es)?\s+de\s+(cha|chá)\b/i.test(item);
    const isGenericSpoon = /\bcolher(?:es)?\b/i.test(item);
    const isSlice = /\bfatia(?:s)?\b/i.test(item);

    if (isSoupSpoon || isTeaSpoon || isGenericSpoon) {
        if (/\bqueijo\b|\bparmesao\b|\bparmesão\b/i.test(foodName)) {
            return quantity * (isTeaSpoon ? 5 : 10);
        }
        return quantity * (isTeaSpoon ? 5 : 30);
    }

    if (isSlice) {
        if (/\bpao\b|\bpão\b/.test(foodName)) {
            return quantity * 25;
        }
        if (/\bqueijo\b|\bmozarela\b|\bmu[sz]arela\b|\bparmesao\b|\bparmesão\b/i.test(foodName)) {
            return quantity * 20;
        }
        return quantity * 30;
    }

    const rule = FOOD_UNIT_GRAMS.find((entry) => entry.pattern.test(foodName));
    if (rule) return quantity * rule.grams;

    return quantity * 100;
}

function sanitizeItem(item: string): string {
    let cleaned = item
        .replace(/^(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b\s*/i, '')
        .replace(/^(\d+(?:[.,]\d+)?)\s*/i, '')
        .replace(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b/gi, '')
        .replace(/^(um|uma|uns|umas)\s+/i, '')
        .trim();

    const unitRegex = new RegExp(`^(${COMMON_UNITS.join('|')})(\\s+(de\\s+sopa|de\\s+cha|de\\s+chá))?\\s+`, 'i');
    cleaned = cleaned.replace(unitRegex, '').trim();
    cleaned = cleaned.replace(/^(g|gr|gramas?)\s+de\s+/i, '').trim();
    cleaned = cleaned.replace(/^de\s+/i, '').trim();
    cleaned = cleaned.replace(/\bcom\s+molho\s+de\s+tomate\b/i, '').trim();
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

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

    if (inputTokens.length > 0 && food.tokens[0] === inputTokens[0]) {
        score += 1;
    }

    // Evita escolher "instantaneo" quando usuário não mencionou isso.
    const inputHasInstantaneo = inputTokens.includes('instantaneo');
    const foodHasInstantaneo = food.tokens.includes('instantaneo');
    if (foodHasInstantaneo && !inputHasInstantaneo) {
        score -= 1;
    }

    // Evita casar "ovo" genérico com "clara" ou "gema" quando o usuário não especificou.
    const inputHasOvo = inputTokens.includes('ovo');
    const inputHasClara = inputTokens.includes('clara');
    const inputHasGema = inputTokens.includes('gema');
    const foodHasClara = food.tokens.includes('clara');
    const foodHasGema = food.tokens.includes('gema');
    if (inputHasOvo && !inputHasClara && !inputHasGema && (foodHasClara || foodHasGema)) {
        score -= 4;
    }

    // Se usuario escreve "pão de forma" sem especificar tipo, prioriza versão simples.
    const inputHasPaoForma = inputTokens.includes('pao') && inputTokens.includes('forma');
    const inputHasSpecificBreadType = inputTokens.some((token) =>
        ['aveia', 'milho', 'integral', 'gluten'].includes(token)
    );
    if (inputHasPaoForma && !inputHasSpecificBreadType) {
        const foodHasAveia = food.tokens.includes('aveia');
        const foodHasMilho = food.tokens.includes('milho');
        const foodHasIntegral = food.tokens.includes('integral');
        const foodHasGluten = food.tokens.includes('gluten');

        if (foodHasAveia || foodHasMilho || foodHasIntegral) {
            score -= 3;
        }
        if (foodHasGluten) {
            score += 2;
        }
    }

    return score;
}

function getOverlapCount(inputTokens: string[], foodTokens: string[]): number {
    const foodTokenSet = new Set(foodTokens);
    let overlaps = 0;

    for (const token of inputTokens) {
        if (foodTokenSet.has(token)) overlaps++;
    }

    return overlaps;
}

async function findFoodNutrition(foodName: string): Promise<FindFoodResult | null> {
    const foods = await getNutritionCache();
    if (foods.length === 0) return null;

    const inputNormalized = normalizeText(foodName);
    const inputTokens = tokenize(foodName);
    if (!inputNormalized || inputTokens.length === 0) return null;

    let best: FoodNutritionIndexed | null = null;
    let bestScore = 0;

    for (const food of foods) {
        const score = scoreMatch(inputTokens, inputNormalized, food);
        const overlapCount = getOverlapCount(inputTokens, food.tokens);
        const bestOverlapCount = best ? getOverlapCount(inputTokens, best.tokens) : 0;

        if (score > bestScore || (score === bestScore && overlapCount > bestOverlapCount)) {
            bestScore = score;
            best = food;
        }
    }

    // Evita falso positivo quando não há sobreposição mínima de termos relevantes.
    if (!best || bestScore < 2) return null;
    const overlapCount = getOverlapCount(inputTokens, best.tokens);
    const primaryToken = inputTokens[0];
    const startsWithPrimary = best.tokens[0] === primaryToken;

    // Regras de aceite:
    // - >=3 tokens: pelo menos 2 sobreposições
    // - 2 tokens: 2 sobreposições; ou 1 se o alimento base (primeiro token) for o mesmo
    // - 1 token: 1 sobreposição
    if (inputTokens.length >= 3 && overlapCount < 2) return null;
    if (inputTokens.length === 2 && overlapCount < 2 && !(overlapCount === 1 && startsWithPrimary)) return null;
    if (inputTokens.length === 1 && overlapCount < 1) return null;
    return {
        food: best,
        score: bestScore,
        overlapCount,
    };
}

function getSearchFallbacks(foodName: string): string[] {
    const normalized = normalizeText(foodName);
    const fallbacks: string[] = [];

    if (/\bcarne\b/.test(normalized) && /\bmoid/.test(normalized)) {
        fallbacks.push('carne moida');
        fallbacks.push('molho bolognesa');
    }

    if (/\bqueijo\b/.test(normalized)) {
        fallbacks.push('queijo parmesao');
    }
    if (/\bmanga\b/.test(normalized)) {
        fallbacks.push('manga');
    }
    if (/\bmacarrao\b|\bmacarrão\b/.test(normalized) || /\bespaguete\b/.test(normalized)) {
        fallbacks.push('macarrao trigo');
    }

    return fallbacks;
}

export async function estimateMacrosFromDescription(
    description: string,
    options?: { debug?: boolean }
): Promise<MacroEstimationResult> {
    const items = splitFoodItems(description);
    const debugItems: MacroDebugItem[] = [];
    const withDebug = !!options?.debug;

    if (!items.length) {
        return {
            calorias: 0,
            carboidratos: 0,
            proteina: 0,
            gorduras: 0,
            matchedItems: 0,
            totalItems: 0,
            debugItems: withDebug ? [] : undefined,
        };
    }

    let calorias = 0;
    let carboidratos = 0;
    let proteina = 0;
    let gorduras = 0;
    let matchedItems = 0;

    for (const rawItem of items) {
        const foodName = sanitizeItem(rawItem);
        const normalizedRawItem = normalizeText(rawItem);
        if (!foodName) {
            if (withDebug) {
                debugItems.push({
                    rawItem,
                    sanitizedItem: '',
                    grams: 0,
                    matched: false,
                    reason: 'item vazio após sanitização',
                });
            }
            continue;
        }

        let nutritionResult: FindFoodResult | null = null;
        let nutrition: FoodNutrition | null = null;
        const adjustmentParts: string[] = [];

        const isGroundBeefWithTomatoSauce =
            normalizedRawItem.includes('carne moida') && normalizedRawItem.includes('molho de tomate');

        if (isGroundBeefWithTomatoSauce) {
            const beefResult = await findFoodNutrition('carne moida');
            const sauceResult = await findFoodNutrition('molho de tomate');

            if (beefResult && sauceResult) {
                const beefRatio = 0.65;
                const sauceRatio = 0.35;
                nutrition = {
                    descricao_alimento: 'Blend: carne moída + molho de tomate (65/35)',
                    kcal: (beefResult.food.kcal * beefRatio) + (sauceResult.food.kcal * sauceRatio),
                    carboidrato_g: (beefResult.food.carboidrato_g * beefRatio) + (sauceResult.food.carboidrato_g * sauceRatio),
                    proteina_g: (beefResult.food.proteina_g * beefRatio) + (sauceResult.food.proteina_g * sauceRatio),
                    lipideos_g: (beefResult.food.lipideos_g * beefRatio) + (sauceResult.food.lipideos_g * sauceRatio),
                };
                adjustmentParts.push('blend carne+molho (65/35)');
            }
        }

        if (!nutrition) {
            nutritionResult = await findFoodNutrition(foodName);

            if (!nutritionResult) {
                for (const fallback of getSearchFallbacks(foodName)) {
                    nutritionResult = await findFoodNutrition(fallback);
                    if (nutritionResult) break;
                }
            }

            if (nutritionResult) {
                nutrition = nutritionResult.food;
            }
        }

        if (!nutrition) {
            if (withDebug) {
                debugItems.push({
                    rawItem,
                    sanitizedItem: foodName,
                    grams: 0,
                    matched: false,
                    reason: 'sem match na base TACO',
                });
            }
            continue;
        }

        const grams = inferGrams(rawItem, foodName);

        const hasExplicitGrams = /(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b/i.test(rawItem);
        const mentionsRaw = /\bcru\b/i.test(foodName);
        const isDryPastaMatch = /\bmacarrao\b|\bmacarrão\b/i.test(foodName) && /\btrigo\b/i.test(nutrition.descricao_alimento) && /\bcru\b/i.test(nutrition.descricao_alimento);
        let adjustedGrams = grams;

        // Usuário normalmente informa gramas de macarrão já pronto. Se caiu no item "cru",
        // converte para equivalente aproximado em base seca para não superestimar.
        if (isDryPastaMatch && hasExplicitGrams && !mentionsRaw) {
            adjustedGrams = grams * 0.30;
            adjustmentParts.push('ajuste macarrão cru->cozido (x0.30)');
        }

        const adjustedFactor = adjustedGrams / 100;
        const itemCalorias = (nutrition.kcal || 0) * adjustedFactor;
        const itemCarboidratos = (nutrition.carboidrato_g || 0) * adjustedFactor;
        const itemProteina = (nutrition.proteina_g || 0) * adjustedFactor;
        const itemGorduras = (nutrition.lipideos_g || 0) * adjustedFactor;

        calorias += itemCalorias;
        carboidratos += itemCarboidratos;
        proteina += itemProteina;
        gorduras += itemGorduras;
        matchedItems++;

        if (withDebug) {
            debugItems.push({
                rawItem,
                sanitizedItem: foodName,
                matched: true,
                matchedFood: nutrition.descricao_alimento,
                score: nutritionResult?.score,
                overlapCount: nutritionResult?.overlapCount,
                grams: Math.round(adjustedGrams * 10) / 10,
                kcal: Math.round(itemCalorias * 10) / 10,
                carboidratos: Math.round(itemCarboidratos * 10) / 10,
                proteina: Math.round(itemProteina * 10) / 10,
                gorduras: Math.round(itemGorduras * 10) / 10,
                adjustment: adjustmentParts.length ? adjustmentParts.join(' + ') : undefined,
            });
        }
    }

    return {
        calorias: Math.round(calorias),
        carboidratos: Math.round(carboidratos * 10) / 10,
        proteina: Math.round(proteina * 10) / 10,
        gorduras: Math.round(gorduras * 10) / 10,
        matchedItems,
        totalItems: items.length,
        debugItems: withDebug ? debugItems : undefined,
    };
}

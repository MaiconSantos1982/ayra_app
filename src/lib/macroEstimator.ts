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

interface FoodAlias {
    alias_norm: string;
    canonical_key: string;
    prioridade: number;
    ativo: boolean;
}

interface ReadyFood {
    canonical_key: string;
    nome_exibicao: string;
    porcao_gramas: number;
    kcal: number;
    carboidrato_g: number;
    proteina_g: number;
    lipideos_g: number;
    ativo?: boolean;
}

interface PortionRule {
    canonical_key: string;
    unidade: string;
    gramas: number;
    fator: number;
    ativo: boolean;
}

interface RecipeRow {
    id: number;
    canonical_key: string;
}

interface RecipeComponentRow {
    component_key?: string;
    component_canonical_key?: string;
    componente_nome: string;
    gramas: number;
    is_default?: boolean;
    ativo?: boolean;
}

interface ModifierRow {
    keyword?: string;
    keyword_norm?: string;
    action: 'add_component' | 'remove_component' | 'multiply_component' | 'set_portion';
    component_key?: string;
    multiplier?: number;
    gramas?: number;
    prioridade?: number;
    ativo?: boolean;
}

const COMMON_UNITS = [
    'unidade', 'unidades', 'fatia', 'fatias', 'colher', 'colheres',
    'xicara', 'xícara', 'xicaras', 'xícaras', 'copo', 'copos',
    'porcao', 'porção', 'porcoes', 'porções', 'pedaço', 'pedaços',
    'rodela', 'rodelas', 'concha', 'conchas',
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
    { pattern: /\bparmesao ralado\b|\bparmesão ralado\b/g, replacement: 'queijo parmesao' },
    { pattern: /\bmanga espada\b/g, replacement: 'manga' },
    { pattern: /\bcoca[\s-]?cola\b/g, replacement: 'refrigerante tipo cola' },
    { pattern: /\bcarne assada\b/g, replacement: 'carne bovina assada' },
    { pattern: /\bbacon\b/g, replacement: 'toucinho frito' },
    { pattern: /\bmolho de alho\b/g, replacement: 'maionese' },
    { pattern: /\bstrogonoff\b/g, replacement: 'estrogonofe' },
    { pattern: /\bbatata palha\b/g, replacement: 'batata frita tipo chips' },
    { pattern: /\bvinagrete\b/g, replacement: 'tomate molho industrializado' },
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
    coracao: 'coracao',
    corações: 'coracao',
    coracoes: 'coracao',
    latinha: 'lata',
    hamburguer: 'hamburguer',
    hambúrguer: 'hamburguer',
    meia: '0.5',
};

const FOOD_UNIT_GRAMS: Array<{ pattern: RegExp; grams: number }> = [
    { pattern: /\bovo(s)?\b/i, grams: 50 },
    { pattern: /\bpao frances\b|\bpão francês\b/i, grams: 50 },
    { pattern: /\bhamburguer\b|\bhambúrguer\b/i, grams: 120 },
    { pattern: /\barroz carreteiro\b/i, grams: 250 },
    { pattern: /\brap\s*10\b|\btortilha\b|\btortilla\b|\bwrap\b/i, grams: 40 },
    { pattern: /\bbanana\b/i, grams: 86 },
    { pattern: /\bmaca\b|\bmaçã\b/i, grams: 130 },
    { pattern: /\bmanga\b/i, grams: 150 },
    { pattern: /\biogurte\b/i, grams: 170 },
    { pattern: /\btoucinho\b/i, grams: 20 },
    { pattern: /\bbacon\b/i, grams: 20 },
    { pattern: /\bmolho de alho\b/i, grams: 15 },
    { pattern: /\bmaionese\b/i, grams: 15 },
    { pattern: /\bmolho com maionese\b/i, grams: 15 },
    { pattern: /\bbatata frita tipo chips\b|\bbatata palha\b/i, grams: 25 },
    { pattern: /\bqueijo\b/i, grams: 30 },
];

function parsePtNumber(value: string): number {
    return parseFloat(value.replace(',', '.'));
}

function parseLeadingQuantity(item: string): number {
    const trimmed = item.trim().toLowerCase();
    if (/^(meia|meio)\b/.test(trimmed)) return 0.5;
    if (/^(um|uma)\b/.test(trimmed)) return 1;
    if (/^(dois|duas)\b/.test(trimmed)) return 2;
    if (/^(tres|três)\b/.test(trimmed)) return 3;
    const quantityMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)\s+/);
    return quantityMatch ? parsePtNumber(quantityMatch[1]) : 1;
}

function parseQuantityNearUnit(item: string, unitRegexSource: string): number | null {
    const explicit = item.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*${unitRegexSource}`, 'i'));
    if (explicit) return parsePtNumber(explicit[1]);

    const half = item.match(new RegExp(`\\b(meia|meio)\\s+${unitRegexSource}`, 'i'));
    if (half) return 0.5;

    const one = item.match(new RegExp(`\\b(um|uma)\\s+${unitRegexSource}`, 'i'));
    if (one) return 1;

    return null;
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

function normalizeAliasText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
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
        /([a-zA-ZÀ-ÿ])\s+(\d+(?:[.,]\d+)?\s+(?:pao|pão|ovos?|banana|manga|maca|maçã|fatia|fatias|colher|colheres|queijo|pedaco|pedaço|pedacos|pedaços|coracao|coração|coracoes|corações|azeitona|azeitonas|rodela|rodelas|lata|latas|energetico|energético|refrigerante|agua|água)\b)/gi,
        '$1, $2'
    );

    // Ex.: "bolo ... 50% 1 energético 473 ml"
    const withPercentBreaks = withCountBreaks.replace(
        /(%|\bml\b|\bg\b)\s+(\d+(?:[.,]\d+)?\s+(?:energetico|energético|refrigerante|coca|agua|água)\b)/gi,
        '$1, $2'
    );

    const unitWordGroup = UNIT_START_WORDS.join('|');
    const withArticleBreaks = withPercentBreaks.replace(
        new RegExp(`([a-zA-ZÀ-ÿ])\\s+((?:um|uma|uns|umas)\\s+(?:${unitWordGroup}|ovo(?:s)?|manga|banana|maca|maçã)\\b)`, 'gi'),
        '$1, $2'
    );

    const chunks = withArticleBreaks
        .split(/,|;|\.|\s+e\s+/i)
        .map((item) => item.trim())
        .filter(Boolean);

    const merged: string[] = [];
    for (const chunk of chunks) {
        const unitOnlyFragment = /^(\d+(?:[.,]\d+)?)\s*(ml|l|g|gr|gramas?|colher(?:es)?(?:\s+de\s+sopa|\s+de\s+cha|\s+de\s+chá)?|fatia(?:s)?|unidade(?:s)?|lata(?:s)?)$/i.test(chunk);
        if (unitOnlyFragment && merged.length > 0) {
            merged[merged.length - 1] = `${merged[merged.length - 1]} ${chunk}`.trim();
            continue;
        }
        merged.push(chunk);
    }
    return merged;
}

function inferGrams(item: string, foodName: string): number {
    const gramsMatch = item.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b/i);
    if (gramsMatch) {
        return parsePtNumber(gramsMatch[1]);
    }

    const quantity = parseLeadingQuantity(item);

    const isSoupSpoon = /\bcolher(?:es)?\s+de\s+sopa\b/i.test(item);
    const isTeaSpoon = /\bcolher(?:es)?\s+de\s+(cha|chá)\b/i.test(item);
    const isGenericSpoon = /\bcolher(?:es)?\b/i.test(item);
    const isSlice = /\bfatia(?:s)?\b/i.test(item);
    const isPiece = /\bpedaco(?:s)?\b|\bpedaço(?:s)?\b/i.test(item);
    const isRound = /\brodela(?:s)?\b/i.test(item);
    const isCan = /\blata(?:s)?\b/i.test(item);
    const isLadle = /\bconcha(?:s)?\b/i.test(item);

    if (isSoupSpoon || isTeaSpoon || isGenericSpoon) {
        const spoonQuantity = parseQuantityNearUnit(item, 'colher(?:es)?(?:\\s+de\\s+sopa|\\s+de\\s+cha|\\s+de\\s+chá)?') ?? quantity;
        if (/\bazeite\b/.test(foodName)) {
            // 1 colher de sopa de azeite ~= 15g
            return spoonQuantity * (isTeaSpoon ? 5 : 15);
        }
        if (/\bqueijo\b|\bparmesao\b|\bparmesão\b/i.test(foodName)) {
            return spoonQuantity * (isTeaSpoon ? 5 : 10);
        }
        return spoonQuantity * (isTeaSpoon ? 5 : 30);
    }

    if (isSlice) {
        const sliceQuantity = parseQuantityNearUnit(item, 'fatia(?:s)?') ?? quantity;
        if (/\bpao\b|\bpão\b/.test(foodName)) {
            return sliceQuantity * 25;
        }
        if (/\bqueijo\b|\bmozarela\b|\bmu[sz]arela\b|\bparmesao\b|\bparmesão\b/i.test(foodName)) {
            return sliceQuantity * 20;
        }
        return sliceQuantity * 30;
    }

    // "queijo" sem unidade costuma ser cobertura/acompanhamento.
    if (/\bparmesao\b|\bparmesão\b/i.test(foodName)) {
        if (/\bralad/.test(item) || /\bpor cima\b/i.test(item)) return quantity * 10;
        return quantity * 20;
    }
    if (/\bqueijo\b/.test(foodName)) {
        return quantity * 30;
    }

    if (isPiece) {
        if (/\bcarne\b|\bbife\b/.test(foodName)) {
            return quantity * 60;
        }
        if (/\bfrango\b/.test(foodName)) {
            return quantity * 80;
        }
        return quantity * 70;
    }

    if (/\bcoracao\b|\bcoração\b/.test(foodName)) {
        return quantity * 8;
    }

    if (/\bazeiton/.test(foodName)) {
        return quantity * 3;
    }

    if (isRound && /\btomate\b/.test(foodName)) {
        return quantity * 15;
    }

    if (isCan && (/\brefrigerante\b/.test(foodName) || /\bcola\b/.test(foodName))) {
        return quantity * 350;
    }

    if (isLadle) {
        if (/\bfeij/.test(foodName)) {
            return quantity * 100;
        }
        return quantity * 90;
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
        .replace(/^(meia|meio)\s+/i, '')
        .replace(/^(um|uma|uns|umas|dois|duas|tres|três)\s+/i, '')
        .trim();

    const unitRegex = new RegExp(`^(${COMMON_UNITS.join('|')})(\\s+(de\\s+sopa|de\\s+cha|de\\s+chá))?\\s+`, 'i');
    cleaned = cleaned.replace(unitRegex, '').trim();
    cleaned = cleaned.replace(/^(g|gr|gramas?)\s+de\s+/i, '').trim();
    cleaned = cleaned.replace(/^de\s+/i, '').trim();
    cleaned = cleaned.replace(/^com\s+/i, '').trim();
    cleaned = cleaned.replace(/\bcom\s+molho\s+de\s+tomate\b/i, '').trim();
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

    return cleaned;
}

let nutritionCache: FoodNutritionIndexed[] | null = null;
let aliasCache: FoodAlias[] | null = null;
let readyFoodCache: ReadyFood[] | null = null;
let portionRulesCache: PortionRule[] | null = null;
let modifiersCache: ModifierRow[] | null = null;
let recipeCache: RecipeRow[] | null = null;
const recipeComponentsCache = new Map<string, RecipeComponentRow[]>();

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

async function getAliasesCache(): Promise<FoodAlias[]> {
    if (aliasCache) return aliasCache;

    const { data, error } = await supabase
        .from('ayra_food_aliases')
        .select('alias_norm, canonical_key, prioridade, ativo')
        .eq('ativo', true)
        .order('prioridade', { ascending: false });

    if (error) {
        console.error('Erro ao carregar aliases alimentares:', error);
        return [];
    }

    aliasCache = (data || []) as FoodAlias[];
    return aliasCache;
}

async function getReadyFoodsCache(): Promise<ReadyFood[]> {
    if (readyFoodCache) return readyFoodCache;

    const { data, error } = await supabase
        .from('ayra_alimentos_prontos')
        .select('canonical_key, nome_exibicao, porcao_gramas, kcal, carboidrato_g, proteina_g, lipideos_g, ativo')
        .eq('ativo', true);

    if (error) {
        console.error('Erro ao carregar alimentos prontos:', error);
        return [];
    }

    readyFoodCache = (data || []) as ReadyFood[];
    return readyFoodCache;
}

async function getPortionRulesCache(): Promise<PortionRule[]> {
    if (portionRulesCache) return portionRulesCache;

    const { data, error } = await supabase
        .from('ayra_food_portion_rules')
        .select('canonical_key, unidade, gramas, fator, ativo')
        .eq('ativo', true);

    if (error) {
        console.error('Erro ao carregar regras de porção:', error);
        return [];
    }

    portionRulesCache = (data || []) as PortionRule[];
    return portionRulesCache;
}

async function getModifiersCache(): Promise<ModifierRow[]> {
    if (modifiersCache) return modifiersCache;

    const { data, error } = await supabase
        .from('ayra_food_modifiers')
        .select('*');

    // A tabela pode não existir em ambientes legados.
    if (error || !data) {
        modifiersCache = [];
        return [];
    }

    modifiersCache = (data as Array<Record<string, unknown>>)
        .filter((item) => item.ativo !== false)
        .map((item) => ({
            keyword: typeof item.keyword === 'string' ? item.keyword : undefined,
            keyword_norm: typeof item.keyword_norm === 'string' ? item.keyword_norm : undefined,
            action: (item.action as ModifierRow['action']) || 'add_component',
            component_key: typeof item.component_key === 'string'
                ? item.component_key
                : (typeof item.component_canonical_key === 'string' ? item.component_canonical_key : undefined),
            multiplier: typeof item.multiplier === 'number' ? item.multiplier : undefined,
            gramas: typeof item.gramas === 'number' ? item.gramas : undefined,
            prioridade: typeof item.prioridade === 'number' ? item.prioridade : 0,
            ativo: item.ativo !== false,
        }))
        .sort((a, b) => (b.prioridade || 0) - (a.prioridade || 0));
    return modifiersCache;
}

async function getRecipesCache(): Promise<RecipeRow[]> {
    if (recipeCache) return recipeCache;

    const { data, error } = await supabase
        .from('ayra_food_recipes')
        .select('id, canonical_key');

    if (error) {
        recipeCache = [];
        return [];
    }

    recipeCache = (data || []) as RecipeRow[];
    return recipeCache;
}

async function getRecipeComponents(canonicalKey: string): Promise<RecipeComponentRow[]> {
    if (recipeComponentsCache.has(canonicalKey)) {
        return recipeComponentsCache.get(canonicalKey) || [];
    }

    const recipes = await getRecipesCache();
    const recipe = recipes.find((item) => item.canonical_key === canonicalKey);

    if (recipe) {
        const { data, error } = await supabase
            .from('ayra_food_recipe_components')
            .select('*')
            .eq('recipe_id', recipe.id)
            .eq('ativo', true);

        if (!error && data) {
            const components = (data as Array<Record<string, unknown>>).map((item) => ({
                component_key: typeof item.component_key === 'string' ? item.component_key : undefined,
                component_canonical_key: typeof item.component_canonical_key === 'string'
                    ? item.component_canonical_key
                    : undefined,
                componente_nome: typeof item.componente_nome === 'string'
                    ? item.componente_nome
                    : (typeof item.component_key === 'string' ? item.component_key : 'Componente'),
                gramas: Number(item.gramas || 0),
                is_default: item.is_default === undefined ? true : Boolean(item.is_default),
                ativo: item.ativo === undefined ? true : Boolean(item.ativo),
            })).filter((item) => item.is_default !== false);
            recipeComponentsCache.set(canonicalKey, components);
            return components;
        }
    }

    const { data: fallbackData, error: fallbackError } = await supabase
        .from('ayra_prepared_food_components')
        .select('component_canonical_key, componente_nome, gramas, ativo')
        .eq('parent_canonical_key', canonicalKey)
        .eq('ativo', true);

    if (fallbackError || !fallbackData) {
        recipeComponentsCache.set(canonicalKey, []);
        return [];
    }

    const components = (fallbackData as Array<{
        component_canonical_key: string;
        componente_nome: string;
        gramas: number;
        ativo: boolean;
    }>).map((item) => ({
        component_canonical_key: item.component_canonical_key,
        componente_nome: item.componente_nome,
        gramas: item.gramas,
        ativo: item.ativo,
        is_default: true,
    }));

    recipeComponentsCache.set(canonicalKey, components);
    return components;
}

function inferUnitKey(rawItem: string, normalizedRawItem: string): string | null {
    if (normalizedRawItem.includes('mini esfirra')) return 'mini_unidade';
    if (/\bfatia(?:s)?\b/i.test(rawItem)) return 'fatia';
    if (/\bunidade(?:s)?\b/i.test(rawItem) || /\bun\b/i.test(rawItem)) return 'unidade';
    if (/\blata(?:s)?\b/i.test(rawItem)) {
        if (/\b473\s*ml\b/i.test(rawItem)) return 'lata_473ml';
        if (/\b350\s*ml\b/i.test(rawItem)) return 'lata_350ml';
        return 'lata';
    }
    if (/\bcopo(?:s)?\b/i.test(rawItem)) return 'copo';
    return null;
}

function resolveAliasMatch(normalizedRawItem: string, rawItem: string, aliases: FoodAlias[]): FoodAlias | null {
    const aliasNormalizedRawItem = normalizeAliasText(rawItem);
    const matches = aliases
        .filter((alias) =>
            normalizedRawItem.includes(alias.alias_norm) ||
            aliasNormalizedRawItem.includes(alias.alias_norm)
        )
        .sort((a, b) => {
            if (b.prioridade !== a.prioridade) return b.prioridade - a.prioridade;
            return b.alias_norm.length - a.alias_norm.length;
        });
    return matches[0] || null;
}

function foodFromReadyFood(food: ReadyFood): FoodNutrition {
    const portionGrams = Number(food.porcao_gramas || 0);
    const factor = portionGrams > 0 ? (100 / portionGrams) : 1;

    return {
        descricao_alimento: food.nome_exibicao,
        // Converte de "por porção" para base por 100g, para manter compatibilidade
        // com o restante do motor (que sempre aplica fator grams/100).
        kcal: Number(food.kcal || 0) * factor,
        carboidrato_g: Number(food.carboidrato_g || 0) * factor,
        proteina_g: Number(food.proteina_g || 0) * factor,
        lipideos_g: Number(food.lipideos_g || 0) * factor,
    };
}

function defaultModifierGrams(componentKey: string): number {
    const normalized = normalizeText(componentKey);
    if (normalized.includes('bacon') || normalized.includes('toucinho')) return 20;
    if (normalized.includes('queijo')) return 20;
    if (normalized.includes('molho') || normalized.includes('maionese')) return 15;
    if (normalized.includes('batata') && normalized.includes('palha')) return 20;
    return 20;
}

function createNutritionFromTotals(label: string, totals: {
    grams: number;
    kcal: number;
    carboidrato_g: number;
    proteina_g: number;
    lipideos_g: number;
}): FoodNutrition {
    if (totals.grams <= 0) {
        return {
            descricao_alimento: label,
            kcal: 0,
            carboidrato_g: 0,
            proteina_g: 0,
            lipideos_g: 0,
        };
    }

    return {
        descricao_alimento: label,
        kcal: (totals.kcal / totals.grams) * 100,
        carboidrato_g: (totals.carboidrato_g / totals.grams) * 100,
        proteina_g: (totals.proteina_g / totals.grams) * 100,
        lipideos_g: (totals.lipideos_g / totals.grams) * 100,
    };
}

async function logUnmatchedItem(description: string, rawItem: string): Promise<void> {
    const item = rawItem.trim();
    if (!item) return;

    const { error } = await supabase
        .from('ayra_unmatched_food_logs')
        .insert({
            descricao_original: description,
            item_extraido: item,
        });

    if (error) {
        // Falha de log não deve interromper o fluxo de cálculo.
    }
}

function findByNormalizedDescription(foods: FoodNutritionIndexed[], exactNormalized: string): FoodNutritionIndexed | null {
    const target = normalizeText(exactNormalized);
    return foods.find((food) => food.normalizedDescription === target) || null;
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
    if (inputHasOvo && !inputTokens.includes('codorna') && food.tokens.includes('codorna')) {
        score -= 3;
    }
    if (inputHasOvo && food.tokens.includes('galinha')) {
        score += 2;
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

    // Evita escolher "arroz carreteiro" quando usuário só disse "arroz".
    const inputHasArroz = inputTokens.includes('arroz');
    const inputHasCarreteiro = inputTokens.includes('carreteiro');
    const foodHasCarreteiro = food.tokens.includes('carreteiro');
    if (inputHasArroz && !inputHasCarreteiro && foodHasCarreteiro) {
        score -= 4;
    }
    if (inputHasArroz && !inputTokens.includes('integral') && food.tokens.includes('integral')) {
        score -= 2;
    }

    // Evita "feijão broto cru" para pedido genérico de feijão em refeição pronta.
    const inputHasFeijao = inputTokens.some((token) => token.startsWith('feij'));
    if (inputHasFeijao) {
        if (food.tokens.includes('broto') || food.tokens.includes('cru')) {
            score -= 5;
        }
        if (food.tokens.includes('carioca') || food.tokens.includes('preto') || food.tokens.includes('cozido')) {
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
    if (/\bcarne\b/.test(normalized) && /\bassad/.test(normalized)) {
        // Em descrição genérica, prioriza corte mais "simples" e evita costela por padrão.
        fallbacks.push('carne bovina acem moido cozido');
    }

    if (/\bqueijo\b/.test(normalized)) {
        fallbacks.push('queijo parmesao');
    }
    if (/\btoucinho\b|\bbacon\b/.test(normalized)) {
        fallbacks.push('toucinho frito');
        fallbacks.push('toucinho cru');
    }
    if (/\bmolho\b/.test(normalized) && /\balho\b/.test(normalized)) {
        fallbacks.push('maionese');
        fallbacks.push('salada de legumes com maionese');
        fallbacks.push('tomate molho industrializado');
    }
    if (/\brefrigerante\b/.test(normalized) || /\bcola\b/.test(normalized)) {
        fallbacks.push('refrigerante tipo cola');
    }
    if (/\bcoracao\b/.test(normalized)) {
        fallbacks.push('frango coracao grelhado');
    }
    if (/\barroz\b/.test(normalized) && /\bcarreteiro\b/.test(normalized)) {
        fallbacks.push('arroz carreteiro');
    }
    if (/\barroz\b/.test(normalized) && !/\bcarreteiro\b/.test(normalized)) {
        fallbacks.push('arroz tipo 1 cozido');
    }
    if (/\bfeij/.test(normalized)) {
        fallbacks.push('feijao carioca cozido');
    }
    if (/\bovo\b/.test(normalized) && !/\bcodorna\b/.test(normalized)) {
        fallbacks.push('ovo de galinha inteiro cozido');
    }
    if (/\bazeite\b/.test(normalized)) {
        fallbacks.push('azeite de');
    }
    if (/\bestrogonofe\b/.test(normalized)) {
        fallbacks.push('estrogonofe de');
    }
    if (/\bmanga\b/.test(normalized)) {
        fallbacks.push('manga');
    }
    if (/\bmacarrao\b|\bmacarrão\b/.test(normalized) || /\bespaguete\b/.test(normalized)) {
        fallbacks.push('macarrao trigo');
    }
    if (/\brap\s*10\b|\btortilha\b|\btortilla\b|\bwrap\b/.test(normalized)) {
        fallbacks.push('pao trigo forma integral');
    }
    if (/\bcachorro\s*quente\b|\bhot\s*dog\b/.test(normalized)) {
        fallbacks.push('pao trigo frances');
        fallbacks.push('hamburguer bovino cru');
    }
    if (/\bpao\b|\bpão\b/.test(normalized) && /\bmanteiga\b/.test(normalized)) {
        fallbacks.push('pao trigo frances');
        fallbacks.push('manteiga com sal');
    }

    return fallbacks;
}

async function resolveComponentToNutrition(
    componentKey: string | undefined,
    componentName: string,
    grams: number,
    readyFoods: ReadyFood[]
): Promise<FoodNutrition | null> {
    const key = componentKey ? normalizeText(componentKey).replace(/\s+/g, '_') : '';
    const readyByKey = key ? readyFoods.find((item) => item.canonical_key === key) : null;
    if (readyByKey) return foodFromReadyFood(readyByKey);

    const readyByName = readyFoods.find((item) => normalizeText(item.nome_exibicao) === normalizeText(componentName));
    if (readyByName) return foodFromReadyFood(readyByName);

    const searchTerms = [componentName];
    if (componentKey) searchTerms.push(componentKey.replace(/_/g, ' '));

    for (const term of searchTerms) {
        const direct = await findFoodNutrition(term);
        if (direct) return direct.food;
        for (const fallback of getSearchFallbacks(term)) {
            const fallbackFound = await findFoodNutrition(fallback);
            if (fallbackFound) return fallbackFound.food;
        }
    }

    if (grams > 0) {
        return null;
    }
    return null;
}

async function resolveUsingV2Data(
    description: string,
    rawItem: string,
    normalizedRawItem: string
): Promise<{ nutrition: FoodNutrition; grams: number; adjustment?: string } | null> {
    const aliases = await getAliasesCache();
    const readyFoods = await getReadyFoodsCache();
    const portionRules = await getPortionRulesCache();

    if (!aliases.length || !readyFoods.length) return null;

    const aliasMatch = resolveAliasMatch(normalizedRawItem, rawItem, aliases);
    if (!aliasMatch) return null;

    const readyFood = readyFoods.find((item) => item.canonical_key === aliasMatch.canonical_key);
    if (!readyFood) return null;

    const quantity = parseLeadingQuantity(rawItem);
    const explicitGramsMatch = rawItem.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramas?)\b/i);
    const unitKey = inferUnitKey(rawItem, normalizedRawItem);
    const rule = unitKey
        ? portionRules.find((item) => item.canonical_key === aliasMatch.canonical_key && item.unidade === unitKey)
        : null;

    let baseGrams = Number(readyFood.porcao_gramas || 0);
    if (rule) {
        baseGrams = Number(rule.gramas || baseGrams) * Number(rule.fator || 1);
    }

    let resolvedGrams = quantity * baseGrams;
    if (explicitGramsMatch) {
        resolvedGrams = parsePtNumber(explicitGramsMatch[1]);
    }

    let adjustment = `alias V2: ${aliasMatch.canonical_key}`;
    if (rule) adjustment += ` + porção(${rule.unidade})`;

    const recipeComponents = await getRecipeComponents(aliasMatch.canonical_key);
    const modifiers = await getModifiersCache();
    const matchedModifiers = modifiers.filter((item) => {
        const key = normalizeText(item.keyword_norm || item.keyword || '');
        return !!key && normalizedRawItem.includes(key);
    });

    if (!recipeComponents.length) {
        return {
            nutrition: foodFromReadyFood(readyFood),
            grams: Math.max(0, resolvedGrams),
            adjustment,
        };
    }

    const workingComponents = recipeComponents.map((item) => ({
        componentKey: item.component_canonical_key || item.component_key || '',
        componentName: item.componente_nome || '',
        grams: Number(item.gramas || 0),
    }));

    for (const modifier of matchedModifiers) {
        const multiplier = Number(modifier.multiplier || 1);
        const modKey = modifier.component_key || '';

        if (modifier.action === 'remove_component' && modKey) {
            for (let i = workingComponents.length - 1; i >= 0; i--) {
                if (workingComponents[i].componentKey === modKey) {
                    workingComponents.splice(i, 1);
                }
            }
            continue;
        }

        if (modifier.action === 'multiply_component' && modKey) {
            for (const component of workingComponents) {
                if (component.componentKey === modKey) {
                    component.grams = component.grams * (multiplier || 1);
                }
            }
            continue;
        }

        if (modifier.action === 'add_component' && modKey) {
            workingComponents.push({
                componentKey: modKey,
                componentName: modKey.replace(/_/g, ' '),
                grams: Number(modifier.gramas || defaultModifierGrams(modKey)),
            });
            continue;
        }

        if (modifier.action === 'set_portion') {
            resolvedGrams = resolvedGrams * (multiplier || 1);
        }
    }

    const defaultRecipeGrams = workingComponents.reduce((sum, item) => sum + item.grams, 0);
    const recipeFactor = defaultRecipeGrams > 0 ? resolvedGrams / defaultRecipeGrams : 1;

    let totalKcal = 0;
    let totalCarb = 0;
    let totalProt = 0;
    let totalFat = 0;
    let totalResolvedGrams = 0;

    for (const component of workingComponents) {
        const componentFinalGrams = component.grams * recipeFactor;
        const nutrition = await resolveComponentToNutrition(
            component.componentKey,
            component.componentName,
            componentFinalGrams,
            readyFoods
        );

        if (!nutrition) continue;

        const factor = componentFinalGrams / 100;
        totalKcal += (nutrition.kcal || 0) * factor;
        totalCarb += (nutrition.carboidrato_g || 0) * factor;
        totalProt += (nutrition.proteina_g || 0) * factor;
        totalFat += (nutrition.lipideos_g || 0) * factor;
        totalResolvedGrams += componentFinalGrams;
    }

    if (totalResolvedGrams <= 0) {
        await logUnmatchedItem(description, rawItem);
        return null;
    }

    const readyBaselineFactor = Number(readyFood.porcao_gramas || 0) > 0
        ? (resolvedGrams / Number(readyFood.porcao_gramas))
        : 1;
    const readyBaseline = {
        kcal: Number(readyFood.kcal || 0) * readyBaselineFactor,
        carboidrato_g: Number(readyFood.carboidrato_g || 0) * readyBaselineFactor,
        proteina_g: Number(readyFood.proteina_g || 0) * readyBaselineFactor,
        lipideos_g: Number(readyFood.lipideos_g || 0) * readyBaselineFactor,
    };

    // Se a receita resolveu poucos componentes, usa o alimento pronto como baseline
    // para evitar subestimar em itens montados (ex.: cachorro-quente).
    const minCoverageRatio = 0.6;
    if (resolvedGrams > 0 && (totalResolvedGrams / resolvedGrams) < minCoverageRatio) {
        return {
            nutrition: foodFromReadyFood(readyFood),
            grams: Math.max(0, resolvedGrams),
            adjustment: `${adjustment} + fallback_pronto_baixa_cobertura`,
        };
    }

    // Se a receita montar um valor muito abaixo do baseline pronto, aplica um piso.
    if (totalKcal < readyBaseline.kcal * 0.75) {
        return {
            nutrition: foodFromReadyFood(readyFood),
            grams: Math.max(0, resolvedGrams),
            adjustment: `${adjustment} + fallback_pronto_piso`,
        };
    }

    adjustment += ` + receita(${workingComponents.length} componentes)`;

    return {
        nutrition: createNutritionFromTotals(readyFood.nome_exibicao, {
            grams: totalResolvedGrams,
            kcal: totalKcal,
            carboidrato_g: totalCarb,
            proteina_g: totalProt,
            lipideos_g: totalFat,
        }),
        grams: totalResolvedGrams,
        adjustment,
    };
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

    const foods = await getNutritionCache();

    const composeFromQueries = async (
        parts: Array<{ query: string; grams: number }>,
        label: string
    ): Promise<{ nutrition: FoodNutrition; grams: number } | null> => {
        let totalKcal = 0;
        let totalCarb = 0;
        let totalProt = 0;
        let totalFat = 0;
        let totalGrams = 0;

        for (const part of parts) {
            const result = await findFoodNutrition(part.query);
            if (!result) return null;
            const factor = part.grams / 100;
            totalKcal += (result.food.kcal || 0) * factor;
            totalCarb += (result.food.carboidrato_g || 0) * factor;
            totalProt += (result.food.proteina_g || 0) * factor;
            totalFat += (result.food.lipideos_g || 0) * factor;
            totalGrams += part.grams;
        }

        if (totalGrams <= 0) return null;

        return {
            nutrition: {
                descricao_alimento: label,
                kcal: (totalKcal / totalGrams) * 100,
                carboidrato_g: (totalCarb / totalGrams) * 100,
                proteina_g: (totalProt / totalGrams) * 100,
                lipideos_g: (totalFat / totalGrams) * 100,
            },
            grams: totalGrams,
        };
    };

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
        let forcedGrams: number | null = null;

        const v2Resolved = await resolveUsingV2Data(description, rawItem, normalizedRawItem);
        if (v2Resolved) {
            nutrition = v2Resolved.nutrition;
            forcedGrams = v2Resolved.grams;
            if (v2Resolved.adjustment) adjustmentParts.push(v2Resolved.adjustment);
        }

        const isGroundBeefWithTomatoSauce =
            normalizedRawItem.includes('carne moida') && normalizedRawItem.includes('molho de tomate');

        const isBreadWithButter =
            normalizedRawItem.includes('pao frances com manteiga') ||
            normalizedRawItem.includes('pao de forma com manteiga');
        const isHotDog =
            normalizedRawItem.includes('cachorro quente') || normalizedRawItem.includes('hot dog');

        if (!nutrition && isGroundBeefWithTomatoSauce) {
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

        if (!nutrition && isBreadWithButter) {
            const composite = await composeFromQueries(
                [
                    { query: 'pao trigo frances', grams: 50 },
                    { query: 'manteiga com sal', grams: 10 },
                ],
                'Blend: pão francês + manteiga'
            );
            if (composite) {
                nutrition = composite.nutrition;
                forcedGrams = composite.grams;
                adjustmentParts.push('blend pão+manteiga (50g+10g)');
            }
        }

        if (!nutrition && isHotDog) {
            const composite = await composeFromQueries(
                [
                    { query: 'pao trigo frances', grams: 50 },
                    { query: 'hamburguer bovino cru', grams: 50 },
                    { query: 'maionese', grams: 10 },
                ],
                'Blend: cachorro-quente (pão+salsicha proxy+maionese)'
            );
            if (composite) {
                nutrition = composite.nutrition;
                forcedGrams = composite.grams;
                adjustmentParts.push('blend cachorro-quente padrão');
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

        // Evita superestimativa quando "carne assada" genérica cai em costela.
        if (
            nutrition &&
            normalizedRawItem.includes('carne assada') &&
            nutrition.descricao_alimento.toLowerCase().includes('costela')
        ) {
            const leanBeef = findByNormalizedDescription(foods, 'carne bovina acem moido cozido');
            if (leanBeef) {
                nutritionResult = {
                    food: leanBeef,
                    score: nutritionResult?.score ?? 0,
                    overlapCount: nutritionResult?.overlapCount ?? 0,
                };
                nutrition = leanBeef;
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
            await logUnmatchedItem(description, rawItem);
            continue;
        }

        const grams = forcedGrams ?? inferGrams(rawItem, foodName);

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

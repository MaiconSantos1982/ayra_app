export interface AyraCadastro {
    id: number;
    id_usuario: string;
    nome: string | null;
    telefone?: string | null;
    idade?: string | null;
    problemas_de_saude?: string | null;
    restricoes: string | null;
    cadastro_completo?: string | null;
    objetivo?: string | null;
    dificuldade?: string | null;
    tem_nutri_ou_dieta?: string | null;
    peso_altura?: string | null;
    info_extra?: string | null;
    plano: 'free' | 'premium';
    created_at: string;
}

export interface AyraMetas {
    id: number;
    id_usuario: string;
    data_inicio: string;
    // Metas nutricionais
    calorias_diarias: number;
    proteina_g: number;
    carboidrato_g: number;
    gordura_g: number;
    // Metas de estilo de vida
    agua_ml?: number | null;
    dias_exercicio_semana?: number | null;
    horas_sono?: number | null;
    // Metas de acompanhamento
    peso_corporal_kg?: number | null;
    meta_consistencia_dias?: number | null;
    created_at: string;
}

export interface AyraDiarioHeader {
    id: number;
    id_usuario: string;
    data_consumo: string;
    calorias_total_dia: number;
    observacoes: string | null;
    created_at: string;
}

export interface AyraDiarioDetalhes {
    id: number;
    id_diario_header: number;
    horario_refeicao: string;
    tipo_refeicao: 'Café' | 'Almoço' | 'Jantar' | 'Lanche';
    alimento_descricao: string;
    macros_estimados_json: {
        calorias?: number;
        proteina?: number;
        carboidrato?: number;
        gordura?: number;
    };
    flag_restricao: boolean;
    created_at: string;
}

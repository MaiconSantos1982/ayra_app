# 🗂️ Diagrama de Relacionamento - Tabelas Supabase

```
┌─────────────────────────────────────────────────────────────────┐
│                         auth.users (Supabase Auth)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ id (UUID)                                                 │   │
│  │ email                                                     │   │
│  │ created_at                                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ (FK: id_usuario)
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌──────────────┐    ┌──────────────────┐
│ ayra_cadastro │    │  ayra_metas  │    │ ayra_diario_     │
│               │    │              │    │    lifestyle     │
├───────────────┤    ├──────────────┤    ├──────────────────┤
│ id (PK)       │    │ id (PK)      │    │ id (PK)          │
│ id_usuario    │    │ id_usuario   │    │ id_usuario       │
│ nome          │    │ calorias     │    │ data_registro    │
│ telefone      │    │ proteina_g   │    │ agua_ml          │
│ idade         │    │ carboidrato  │    │ exercicio_feito  │
│ restricoes    │    │ gordura_g    │    │ horas_sono       │
│ objetivo      │    │ agua_ml      │    │ humor            │
│ plano         │    │ peso_kg      │    │ peso_kg          │
│ chat_id       │    └──────────────┘    └──────────────────┘
│ assinatura    │
└───────────────┘
        │
        │ (usado para alertas)
        │
        ▼
┌──────────────────────────────────────────────┐
│         ayra_diario_header                   │
├──────────────────────────────────────────────┤
│ id (PK)                                      │
│ id_usuario (FK → auth.users)                 │
│ data_consumo (UNIQUE com id_usuario)         │
│ calorias_total_dia                           │
└──────────────────┬───────────────────────────┘
                   │
                   │ (FK: id_diario_header)
                   │
                   ▼
        ┌──────────────────────┐
        │ ayra_diario_detalhes │
        ├──────────────────────┤
        │ id (PK)              │
        │ id_diario_header     │
        │ horario_refeicao     │
        │ tipo_refeicao        │
        │ alimento_descricao   │
        │ macros_estimados     │
        │ flag_restricao       │
        └──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│              TABELAS ADMIN (Métricas de Negócio)            │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐    ┌─────────────────────┐
│ ayra_subscriptions   │    │ ayra_conversion_    │
│                      │    │      events         │
├──────────────────────┤    ├─────────────────────┤
│ id (PK)              │    │ id (PK)             │
│ id_usuario           │    │ id_usuario          │
│ plano                │    │ converted_at        │
│ status               │    │ days_to_convert     │
│ started_at           │    │ source              │
│ ends_at              │    └─────────────────────┘
│ valor_mensal         │
└──────────────────────┘

┌──────────────────────┐    ┌─────────────────────┐
│ ayra_churn_events    │    │ ayra_user_activity  │
│                      │    │                     │
├──────────────────────┤    ├─────────────────────┤
│ id (PK)              │    │ id (PK)             │
│ id_usuario           │    │ id_usuario          │
│ churned_at           │    │ data_acesso         │
│ reason               │    │ feature_used        │
│ days_subscribed      │    │ duration_seconds    │
└──────────────────────┘    └─────────────────────┘

┌──────────────────────┐
│ ayra_daily_revenue   │
│                      │
├──────────────────────┤
│ id (PK)              │
│ data                 │
│ receita_total        │
│ novos_assinantes     │
│ cancelamentos        │
└──────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│          BIBLIOTECA DE ALIMENTOS (Opcional)                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│    tabela_taco       │  (Pública - Todos podem ler)
│                      │
├──────────────────────┤
│ id (PK)              │
│ codigo_taco          │
│ nome_alimento        │
│ categoria            │
│ energia_kcal         │
│ proteina_g           │
│ lipideos_g           │
│ carboidrato_g        │
│ fibra_g              │
│ palavras_chave[]     │
│ popular              │
└──────────┬───────────┘
           │
           │ (FK: id_alimento)
           │
           ▼
┌──────────────────────────┐
│ ayra_alimentos_favoritos │
├──────────────────────────┤
│ id (PK)                  │
│ id_usuario               │
│ id_alimento              │
│ apelido                  │
│ porcao_favorita_g        │
└──────────────────────────┘

┌──────────────────────────┐
│ ayra_templates_refeicao  │
├──────────────────────────┤
│ id (PK)                  │
│ id_usuario               │
│ nome_template            │
│ tipo_refeicao            │
│ itens_json               │
│ total_calorias           │
│ total_proteina_g         │
└──────────────────────────┘
```

---

## 🔑 Legendas

- **PK** = Primary Key (Chave Primária)
- **FK** = Foreign Key (Chave Estrangeira)
- **UUID** = Identificador único universal
- **→** = Referência/Relacionamento

---

## 📊 Fluxo de Dados Típico

### 1️⃣ **Novo Usuário**
```
1. Usuário se registra → auth.users (Supabase Auth)
2. Preenche anamnese → ayra_cadastro
3. Define metas → ayra_metas
```

### 2️⃣ **Uso Diário**
```
1. Registra refeição → ayra_diario_header + ayra_diario_detalhes
2. Registra água/sono/exercício → ayra_diario_lifestyle
3. Chat com Ayra → webhook n8n (usa dados de ayra_cadastro)
```

### 3️⃣ **Conversão Premium**
```
1. Usuário assina → ayra_subscriptions
2. Evento registrado → ayra_conversion_events
3. Campo 'plano' atualizado → ayra_cadastro (free → premium)
```

### 4️⃣ **Métricas Admin**
```
1. Acesso diário → ayra_user_activity
2. Receita → ayra_daily_revenue
3. Cancelamento → ayra_churn_events
```

---

## 🎯 Tabelas por Prioridade de Implementação

### **Fase 1: MVP (Essencial)**
1. ✅ `ayra_cadastro` - Perfil do usuário
2. ✅ `ayra_diario_header` - Cabeçalho do diário
3. ✅ `ayra_diario_detalhes` - Refeições
4. ✅ `ayra_diario_lifestyle` - Água, sono, exercício

### **Fase 2: Funcionalidades Avançadas**
5. ⚡ `ayra_metas` - Metas personalizadas
6. ⚡ `ayra_subscriptions` - Sistema de assinatura

### **Fase 3: Admin e Analytics**
7. 📊 `ayra_conversion_events`
8. 📊 `ayra_churn_events`
9. 📊 `ayra_user_activity`
10. 📊 `ayra_daily_revenue`

### **Fase 4: Biblioteca de Alimentos (Opcional)**
11. 📚 `tabela_taco`
12. 📚 `ayra_alimentos_favoritos`
13. 📚 `ayra_templates_refeicao`

---

## 🔒 Segurança (RLS - Row Level Security)

Todas as tabelas de usuário têm RLS habilitado:

```sql
-- Usuários só veem seus próprios dados
auth.uid() = id_usuario
```

**Exceção**: `tabela_taco` é pública (todos podem ler)

---

## 📝 Campos Importantes para Integração n8n

### **ayra_cadastro.chat_id**
- Armazena ID do chat do WhatsApp/Telegram
- Usado para vincular conversas ao usuário
- **MANTER** este campo na sua estrutura

### **ayra_cadastro.restricoes**
- Alergias e restrições alimentares
- Enviado no payload do webhook para contexto da IA
- Exemplo: "alergia a amendoim, intolerância à lactose"

### **ayra_cadastro.objetivo**
- Objetivo do usuário
- Usado para personalizar respostas da IA
- Exemplo: "ganhar massa muscular", "emagrecer"

---

**Criado em**: 02/12/2025  
**Versão**: 1.0

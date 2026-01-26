# 🍽️ Sistema de Registro de Refeições com Tracking Nutricional

## 📋 Resumo das Implementações

Este documento resume as melhorias implementadas no sistema de registro de refeições do Ayra, adicionando funcionalidades de tracking de calorias, macronutrientes e registro retroativo.

---

## ✅ Funcionalidades Implementadas

### 1. **Registro de Calorias e Macronutrientes**

#### Estrutura de Dados Atualizada
- Adicionados campos opcionais em `MealRecord`:
  - `calorias?: number` - Calorias totais da refeição
  - `proteina?: number` - Proteína em gramas
  - `carboidratos?: number` - Carboidratos em gramas
  - `gorduras?: number` - Gorduras em gramas

#### Arquivo: `src/lib/localStorage.ts`
```typescript
export interface MealRecord {
    id: string;
    tipo: string;
    descricao: string;
    timestamp: string;
    foto?: string;
    // Novos campos nutricionais
    calorias?: number;
    proteina?: number;
    carboidratos?: number;
    gorduras?: number;
}
```

### 2. **Registro com Data Retroativa** 📅

#### Funcionalidade
- Seletor de data no formulário de registro
- Data padrão: hoje
- Permite registrar refeições em dias anteriores
- Validação: não permite datas futuras
- Indicador visual quando está em modo retroativo

#### Interface
```tsx
<input
    type="date"
    value={selectedDate}
    max={new Date().toISOString().split('T')[0]}
    onChange={(e) => setSelectedDate(e.target.value)}
/>
```

### 3. **Campos Opcionais de Macronutrientes**

#### UI Expansível
- Botão "Adicionar valores nutricionais (opcional)"
- Seção expansível/retrátil com animação
- 4 campos numéricos:
  - Calorias (kcal)
  - Proteína (g)
  - Carboidratos (g)
  - Gorduras (g)
- Dica visual para o usuário sobre onde encontrar informações nutricionais

### 4. **Cálculo Automático de Totais Diários**

#### Nova Função: `getDailyNutrition()`
```typescript
export function getDailyNutrition(date?: string): {
    calorias: number;
    proteina: number;
    carboidratos: number;
    gorduras: number;
}
```

**Funcionalidade:**
- Soma automaticamente todos os valores nutricionais das refeições do dia
- Suporta data específica ou usa dia atual como padrão
- Retorna 0 para valores não informados

### 5. **Integração com Dashboard**

#### Atualizações
- **Dashboard agora usa dados REAIS** de calorias e macros
- Substituídos valores mockados por cálculos baseados em refeições
- Atualização automática ao registrar novas refeições
- Progresso visual baseado em metas vs consumo real

#### Implementação
```typescript
const loadTodayLifestyle = () => {
    const nutrition = getDailyNutrition(today);
    setDailyProgress(prev => ({
        ...prev,
        calories: nutrition.calorias,
        protein: nutrition.proteina,
        carbs: nutrition.carboidratos,
        fat: nutrition.gorduras
    }));
};
```

### 6. **Histórico com Resumo Nutricional**

#### Novo Card: "Nutrição do Dia"
- Exibido no topo do histórico de cada dia
- Grid 2x2 com cards coloridos:
  - **Calorias** (verde/primary)
  - **Proteína** (azul)
  - **Carboidratos** (amarelo)
  - **Gorduras** (laranja)
- Mensagem quando não há valores nutricionais registrados

---

## 📁 Arquivos Modificados

### 1. `src/lib/localStorage.ts`
- ✅ Interface `MealRecord` atualizada
- ✅ Função `addMeal()` com parâmetro `date` opcional
- ✅ Nova função `getDailyNutrition()`

### 2. `src/pages/Register.tsx`
- ✅ Seletor de data adicionado
- ✅ Estado `selectedDate` gerenciado
- ✅ Seção expansível de macronutrientes
- ✅ 4 campos numéricos para valores nutricionais
- ✅ Salvamento integrado (demo e Supabase)
- ✅ Reset de campos após submissão

### 3. `src/pages/Dashboard.tsx`
- ✅ Importação de `getDailyNutrition`
- ✅ Cálculo automático de valores reais
- ✅ Atualização do estado `dailyProgress`
- ✅ Substituição de valores mockados

### 4. `src/pages/HistoryPage.tsx`
- ✅ Novo card de resumo nutricional
- ✅ Exibição de totais por dia
- ✅ Ícone `Target` para identificação visual
- ✅ Tratamento de dias sem dados

---

## 🎯 Fluxo de Uso

### Registro de Refeição

1. **Usuário acessa "Registro Diário"**
2. **Seleciona a data** (padrão: hoje, pode voltar dias anteriores)
3. **Escolhe o tipo de refeição** (Café, Almoço, Jantar, etc.)
4. **Descreve o que comeu**
5. **[OPCIONAL] Clica em "Adicionar valores nutricionais"**
   - Preenche calorias, proteína, carbos e gorduras
6. **Clica em "Salvar Refeição"**

### Visualização de Dados

#### Dashboard
- **Nutrição em tempo real** - Valores atualizados automaticamente
- **Barras de progresso** - Comparação com metas diárias
- **Cards de macros** - Proteína, Carbos e Gorduras

#### Histórico
- **Card de resumo nutricional** no topo de cada dia
- **Lista de refeições** com descrição e horário
- **Navegação por data** usando setas ou seletor

---

## 💾 Armazenamento

### Modo Demo (localStorage)
```javascript
{
  "tipo_refeicao": "Café",
  "alimento_descricao": "Omelete com 3 ovos...",
  "horario_refeicao": "08:30",
  "calorias": 450,
  "proteina": 35,
  "carboidratos": 5,
  "gorduras": 28
}
```

### Modo Supabase
```javascript
{
  "id_diario_header": 123,
  "tipo_refeicao": "Café",
  "alimento_descricao": "Omelete com 3 ovos...",
  "horario_refeicao": "08:30",
  "macros_estimados_json": {
    "calorias": 450,
    "proteina": 35,
    "carboidrato": 5,
    "gordura": 28
  }
}
```

---

## 🔄 Compatibilidade com Dados Antigos

### Retrocompatibilidade
- ✅ Refeições antigas sem valores nutricionais continuam funcionando
- ✅ Função `getDailyNutrition()` retorna 0 para valores ausentes
- ✅ Interface mostra "Nenhum valor nutricional registrado" quando apropriado

---

## 🎨 Design e UX

### Elementos Visuais
- 📅 **Indicador de data retroativa** (texto amarelo)
- 🔽 **Ícone animado** no botão expansível de macros
- 💡 **Dica contextual** sobre onde encontrar informações nutricionais
- ✅ **Feedback visual** ao salvar
- 🎨 **Cards coloridos** no resumo nutricional (primary, azul, amarelo, laranja)

### Responsividade
- Grid 2x2 para campos de macros
- Grid 2x2 para resumo nutricional
- Adaptável a diferentes tamanhos de tela

---

## 🚀 Próximos Passos (Sugestões)

### Funcionalidades Futuras
1. **Integração com IA** - Estimativa automática de macros via descrição
2. **Scanner de código de barras** - Leitura de rótulos
3. **Biblioteca de alimentos** - Base de dados comum
4. **Análise semanal/mensal** - Gráficos de evolução
5. **Exportação de dados** - Relatórios em PDF
6. **Metas personalizadas** - Por período (café da manhã, almoço, etc.)

---

## 📊 Métricas Disponíveis

### Dashboard (Tempo Real)
- ✅ Calorias consumidas vs meta
- ✅ Proteína consumida vs meta
- ✅ Carboidratos consumidos vs meta
- ✅ Gorduras consumidas vs meta
- ✅ Progresso diário visual

### Histórico
- ✅ Total diário de calorias
- ✅ Total diário de cada macronutriente
- ✅ Lista completa de refeições
- ✅ Navegação entre datas

### Progresso (Futuro)
- ⏳ Média semanal de calorias
- ⏳ Média mensal de macros
- ⏳ Gráficos de evolução
- ⏳ Comparação período a período

---

## 🐛 Tratamento de Erros

### Validações Implementadas
- ✅ Data não pode ser futura
- ✅ Valores nutricionais opcionais (não obrigatórios)
- ✅ Números não negativos para macros
- ✅ Descrição obrigatória da refeição

### Casos Extremos
- ✅ Dia sem refeições registradas
- ✅ Refeições sem valores nutricionais
- ✅ Valores parciais (só calorias, por exemplo)

---

## 🎓 Guia de Uso para o Usuário

### Registro Simples
1. Descrever a refeição
2. Clicar em "Salvar"
3. Pronto! ✅

### Registro Completo (com macros)
1. Descrever a refeição
2. Clicar em "Adicionar valores nutricionais"
3. Preencher os campos desejados
4. Clicar em "Salvar"
5. Visualizar no Dashboard imediatamente!

### Registro Retroativo
1. Alterar a data no seletor
2. Ver indicador amarelo "📅 Registrando em data retroativa"
3. Preencher normalmente
4. Salvar
5. Conferir no histórico da data selecionada

---

**✨ Todas as funcionalidades estão prontas e integradas!**

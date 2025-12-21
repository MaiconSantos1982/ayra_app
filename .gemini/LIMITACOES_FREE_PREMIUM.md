# 📋 LIMITAÇÕES FREE vs PREMIUM NO AYRA

## 🔍 Resumo das Limitações Encontradas

Sim, existem **2 limitações principais** implementadas no código para diferenciar planos Free e Premium:

---

## 1. 💬 **Chat com Ayra (IA)** - Limite de Mensagens

**Arquivo:** `src/pages/Chat.tsx`

### Limitação Free:
- **Máximo de 7 mensagens por dia**
- Contador visível no header: `3/7`
- Input e botões desabilitados ao atingir limite
- Alert ao tentar enviar após limite

### Código:
```typescript
// Linha 22-23
const [count, setCount] = useState(3);
const maxCount = 7;

// Linha 39-41
const userData = getUserData();
const isPremium = userData?.premium || false;

// Linha 59-62
if (!isPremium && count >= maxCount) {
    alert('Limite de mensagens diárias atingido. Assine o Premium para continuar!');
    return;
}

// Linha 74
if (!isPremium) setCount(prev => prev + 1);

// Linha 239-243 - Contador no Header
{!isPremium && (
    <span className="text-xs bg-[#25D366]/20 text-[#25D366] px-2 py-1 rounded-full border border-[#25D366]/30">
        {count}/{maxCount}
    </span>
)}

// Linha 388 - Input desabilitado
disabled={!isPremium && count >= maxCount || isLoading}

// Linha 402 - Botão enviar desabilitado
disabled={!isPremium && count >= maxCount || isLoading}

// Linha 410 - Botão microfone desabilitado
disabled={!isPremium && count >= maxCount}
```

### Premium:
- ✅ **Mensagens ilimitadas**
- ✅ Sem contador
- ✅ Sem bloqueios

---

## 2. 📅 **Histórico** - Limite de Dias

**Arquivo:** `src/pages/HistoryPage.tsx`

### Limitação Free:
- **Apenas 3 dias de histórico** (hoje + 2 dias anteriores)
- Modal de upgrade ao tentar acessar dias mais antigos
- Badge "3 dias" no header

### Código:
```typescript
// Linha 14-15
const isPremium = userData?.premium || false;
const FREE_HISTORY_DAYS = 3; // Free: 3 dias (hoje + 2 anteriores)

// Linha 22-32 - Verifica se pode ver a data
const canViewDate = (dateStr: string) => {
    if (isPremium) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetDate = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    return diffDays < FREE_HISTORY_DAYS;
};

// Linha 40-43 - Bloqueia navegação
if (!canViewDate(newDate)) {
    setShowUpgradeModal(true);
    return;
}

// Linha 153-159 - Badge no Header
{!isPremium && (
    <div className="bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
        <p className="text-yellow-500 text-xs font-semibold">
            {FREE_HISTORY_DAYS} dias
        </p>
    </div>
)}

// Linha 94-147 - Modal de Upgrade
{showUpgradeModal && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-3xl p-6 max-w-md w-full border border-yellow-500/30 relative">
            {/* Conteúdo do modal com benefícios Premium */}
        </div>
    </div>
)}
```

### Premium:
- ✅ **Histórico ilimitado**
- ✅ Sem restrições de datas
- ✅ Sem modal de upgrade

---

## 📊 Tabela Comparativa

| Funcionalidade | Free | Premium |
|----------------|------|---------|
| **Chat com Ayra** | 7 mensagens/dia | ✅ Ilimitado |
| **Histórico** | 3 dias | ✅ Ilimitado |
| **Registro de Refeições** | ✅ Ilimitado | ✅ Ilimitado |
| **Registro de Hábitos** | ✅ Ilimitado | ✅ Ilimitado |
| **Metas** | ✅ Ilimitado | ✅ Ilimitado |
| **Perfil** | ✅ Ilimitado | ✅ Ilimitado |
| **Anamnese** | ✅ Ilimitado | ✅ Ilimitado |

---

## 🎯 Funcionalidades SEM Limitação

As seguintes funcionalidades **não têm limitação** entre Free e Premium:

1. ✅ **Registro de Refeições** - Ilimitado para todos
2. ✅ **Registro de Hábitos** (água, sono, exercício, humor) - Ilimitado
3. ✅ **Metas** - Configuração ilimitada
4. ✅ **Perfil** - Acesso completo
5. ✅ **Anamnese** - Dados pessoais ilimitados
6. ✅ **Onboarding** - Acesso completo

---

## 🔐 Como Verificar o Plano

### No Código:

```typescript
// Método 1: Via localStorage (usado na maioria dos lugares)
const userData = getUserData();
const isPremium = userData?.premium || false;

// Método 2: Via AuthContext (mais atualizado)
const { user } = useAuth();
const isPremium = user?.premium || false;

// Método 3: Via profile (legado)
const isPremium = profile?.plano === 'premium';
```

### No Supabase:

```sql
-- Verificar plano do usuário
SELECT id, nome, email, plano, created_at
FROM ayra_cadastro
WHERE email = 'usuario@email.com';

-- Plano NULL ou vazio = Freemium
-- Plano 'premium' = Premium
```

---

## 🚀 Como Alterar Plano para Premium

### 1. Via Supabase Dashboard:

1. Acesse Supabase Dashboard
2. Vá em "Table Editor" → `ayra_cadastro`
3. Encontre o usuário
4. Edite a coluna `plano` para `'premium'`
5. Salve
6. No app, vá em `/perfil`
7. Clique em "Atualizar Status do Plano"

### 2. Via SQL:

```sql
-- Tornar usuário Premium
UPDATE ayra_cadastro
SET plano = 'premium', updated_at = NOW()
WHERE email = 'usuario@email.com';

-- Tornar usuário Freemium
UPDATE ayra_cadastro
SET plano = NULL, updated_at = NOW()
WHERE email = 'usuario@email.com';
```

---

## 💡 Sugestões de Novas Limitações

Se você quiser adicionar mais limitações no futuro:

### 1. **Análise Nutricional com IA**
- Free: Não disponível
- Premium: Disponível

### 2. **Gráficos de Evolução**
- Free: Não disponível
- Premium: Disponível

### 3. **Exportar Dados**
- Free: Não disponível
- Premium: Disponível

### 4. **Notificações Push**
- Free: Básicas
- Premium: Personalizadas

### 5. **Suporte Prioritário**
- Free: Email
- Premium: WhatsApp/Chat

### 6. **Receitas Personalizadas**
- Free: 5 receitas
- Premium: Ilimitadas

---

## 📝 Arquivos Relacionados

### Arquivos com Verificação de Premium:

1. **`src/pages/Chat.tsx`** - Limite de mensagens
2. **`src/pages/HistoryPage.tsx`** - Limite de histórico
3. **`src/pages/ProfileSimple.tsx`** - Exibe status do plano
4. **`src/pages/PremiumPage.tsx`** - Página de upgrade
5. **`src/contexts/AuthContext.tsx`** - Gerencia estado premium
6. **`src/lib/supabaseAuth.ts`** - Sincroniza plano com Supabase
7. **`src/lib/localStorage.ts`** - Armazena dados localmente

### Arquivos SEM Verificação de Premium:

1. `src/pages/RegisterSimple.tsx` - Registro de refeições
2. `src/pages/MetasPage.tsx` - Configuração de metas
3. `src/pages/OnboardingSimple.tsx` - Onboarding
4. `src/pages/AnamnesePage.tsx` - Dados pessoais
5. `src/pages/Dashboard.tsx` - Dashboard principal

---

## 🎨 UI de Limitações

### Chat - Contador de Mensagens:
```
┌─────────────────────────────┐
│ Ayra              [3/7]     │ ← Badge verde mostrando uso
└─────────────────────────────┘
```

### Histórico - Badge de Dias:
```
┌─────────────────────────────┐
│ Histórico 📅    [3 dias]    │ ← Badge amarelo
└─────────────────────────────┘
```

### Modal de Upgrade:
```
┌─────────────────────────────┐
│         👑                  │
│  Upgrade para Premium       │
│                             │
│  ✓ Histórico ilimitado      │
│  ✓ Chat ilimitado           │
│  ✓ Análise com IA           │
│  ✓ Gráficos de evolução     │
│                             │
│  [Fazer Upgrade Agora]      │
└─────────────────────────────┘
```

---

## ✅ Conclusão

**Sim, existem limitações implementadas:**

1. ✅ **Chat:** 7 mensagens/dia (Free) vs Ilimitado (Premium)
2. ✅ **Histórico:** 3 dias (Free) vs Ilimitado (Premium)

**Funcionalidades sem limitação:**
- Registro de refeições
- Registro de hábitos
- Metas
- Perfil
- Anamnese

**Como funciona:**
- Verificação via `isPremium` (localStorage ou AuthContext)
- Plano armazenado no Supabase (`ayra_cadastro.plano`)
- Botão "Atualizar Status" sincroniza com Supabase
- Modais de upgrade incentivam conversão

---

**Tudo documentado e funcionando! 🎉**

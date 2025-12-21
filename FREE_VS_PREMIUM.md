# 💎 Plano Free vs Premium - Ayra

## 📊 Comparação de Recursos

### **🆓 Plano Free (Gratuito)**

#### **Recursos Incluídos:**
- ✅ **Registro de Refeições**: Ilimitado
  - Foto + descrição
  - Todos os tipos de refeição
  
- ✅ **Hábitos Diários**: Ilimitado
  - Água
  - Exercício
  - Sono
  - Humor

- ✅ **Histórico**: 3 dias ⭐
  - Visualizar últimos 3 dias (hoje + 2 anteriores)
  - Navegação entre dias

- ✅ **Chat com Ayra (IA)**: 3 mensagens/dia ⭐
  - Perguntas sobre nutrição
  - Dicas básicas

- ✅ **Streak**: Básico
  - Contador de dias consecutivos

- ✅ **Export de Dados**: Básico
  - JSON simples

---

### **👑 Plano Premium**

#### **Tudo do Free +**

- ✅ **Histórico Ilimitado**
  - Ver todos os dias desde o início
  - Sem limite de tempo

- ✅ **Chat com Ayra (IA): Ilimitado**
  - Mensagens ilimitadas
  - Respostas mais detalhadas
  - Análise nutricional completa

- ✅ **Análise Nutricional com IA**
  - Análise automática de fotos
  - Estimativa de calorias e macros
  - Sugestões personalizadas

- ✅ **Gráficos de Evolução**
  - Peso ao longo do tempo
  - Consumo de água
  - Horas de sono
  - Frequência de exercícios

- ✅ **Relatórios em PDF**
  - Exportar relatórios semanais
  - Exportar relatórios mensais
  - Compartilhar com nutricionista

- ✅ **Receitas Personalizadas**
  - Baseadas no seu objetivo
  - Considerando suas restrições
  - Passo a passo com fotos

- ✅ **Planos de Refeição**
  - Sugestões diárias
  - Lista de compras automática

- ✅ **Sem Anúncios**
  - Experiência premium
  - Sem interrupções

- ✅ **Suporte Prioritário**
  - Resposta em até 24h
  - Chat direto com suporte

---

## 🔧 Como Implementar as Limitações

### **1. Histórico Limitado (Free)**

```typescript
// src/pages/HistoryPage.tsx

const canViewDate = (date: string) => {
  const userData = getUserData();
  const isPremium = userData?.premium || false;
  
  if (isPremium) return true;
  
  // Free: apenas últimos 7 dias
  const today = new Date();
  const selectedDate = new Date(date);
  const diffDays = Math.floor((today - selectedDate) / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
};

// No botão de dia anterior:
const goToPreviousDay = () => {
  const date = new Date(selectedDate);
  date.setDate(date.getDate() - 1);
  const newDate = date.toISOString().split('T')[0];
  
  if (!canViewDate(newDate)) {
    alert('⭐ Upgrade para Premium para ver histórico completo!');
    return;
  }
  
  setSelectedDate(newDate);
};
```

### **2. Chat Limitado (Free)**

```typescript
// src/pages/Chat.tsx

const [messageCount, setMessageCount] = useState(0);
const MAX_FREE_MESSAGES = 5;

const canSendMessage = () => {
  const userData = getUserData();
  const isPremium = userData?.premium || false;
  
  if (isPremium) return true;
  
  // Conta mensagens do dia
  const today = new Date().toISOString().split('T')[0];
  const todayMessages = messages.filter(m => 
    m.timestamp.startsWith(today) && m.sender === 'user'
  );
  
  return todayMessages.length < MAX_FREE_MESSAGES;
};

const handleSend = () => {
  if (!canSendMessage()) {
    alert('⭐ Limite de mensagens atingido! Upgrade para Premium para mensagens ilimitadas.');
    return;
  }
  
  // Envia mensagem...
};
```

### **3. Adicionar Campo Premium no localStorage**

```typescript
// src/lib/localStorage.ts

export interface UserData {
  profile: UserProfile;
  goals: Goals;
  dailyRecords: Record<string, DailyData>;
  streak: number;
  lastAccess: string;
  premium: boolean; // NOVO
  premiumExpiry?: string; // NOVO (opcional)
}

// Atualizar initializeUserData:
export function initializeUserData(profile: UserProfile): UserData {
  const initialData: UserData = {
    profile,
    goals: { /* ... */ },
    dailyRecords: {},
    streak: 0,
    lastAccess: new Date().toISOString(),
    premium: false, // NOVO
  };
  
  saveUserData(initialData);
  return initialData;
}

// Nova função para ativar premium:
export function activatePremium(expiryDate?: string): void {
  const data = getUserData();
  if (!data) return;
  
  data.premium = true;
  if (expiryDate) {
    data.premiumExpiry = expiryDate;
  }
  
  saveUserData(data);
}
```

### **4. Atualizar ProfileSimple para Mostrar Status**

```typescript
// src/pages/ProfileSimple.tsx

const isPremium = userData?.premium || false;

// No card de plano:
<p className="text-white font-bold">
  {isPremium ? 'Plano Premium ⭐' : 'Plano Free'}
</p>
<p className="text-gray-300 text-sm">
  {isPremium 
    ? 'Você tem acesso a todos os recursos!' 
    : 'Upgrade para Premium'
  }
</p>

// Botão só aparece se não for premium:
{!isPremium && (
  <button
    onClick={() => window.open('https://youtu.be/SLioH4rHjFc', '_blank')}
    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:scale-105 transition-transform"
  >
    Upgrade
  </button>
)}
```

---

## 💰 Preço Sugerido

- **Free**: R$ 0,00/mês
- **Premium**: R$ 19,90/mês ou R$ 199,00/ano (economize 16%)

---

## 🎯 Estratégia de Conversão

1. **Mostrar valor do Premium**
   - Destacar recursos bloqueados
   - "Upgrade para ver mais"
   - Badges "Premium" nos recursos

2. **Trial Gratuito**
   - 7 dias grátis de Premium
   - Sem cartão de crédito

3. **Upsells no Momento Certo**
   - Ao atingir limite de mensagens
   - Ao tentar ver histórico antigo
   - Após 7 dias de uso

4. **Social Proof**
   - "Junte-se a X usuários Premium"
   - Depoimentos

---

## 📝 Checklist de Implementação

- [ ] Adicionar campo `premium` no localStorage
- [ ] Implementar limitação de histórico (7 dias)
- [ ] Implementar limitação de chat (5 msg/dia)
- [ ] Atualizar ProfileSimple com status
- [ ] Criar página de checkout/pagamento
- [ ] Integrar com gateway de pagamento (Stripe, Mercado Pago)
- [ ] Criar sistema de verificação de assinatura
- [ ] Adicionar badges "Premium" nos recursos
- [ ] Implementar trial gratuito
- [ ] Criar emails de conversão

---

**Link de Upgrade Atual:** https://youtu.be/SLioH4rHjFc

Quando estiver pronto para implementar pagamentos, podemos integrar com:
- Stripe
- Mercado Pago
- Hotmart
- Kiwify

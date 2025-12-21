# 📡 WEBHOOK - FORMATO COMPLETO DE DADOS

## 🎯 Payload Atualizado

O webhook agora envia **dados completos do perfil do usuário** junto com cada mensagem para fornecer contexto à IA.

---

## 📦 Estrutura do Payload

### Exemplo Completo:

```json
{
  "message": "Qual a melhor dieta para ganhar massa muscular?",
  "userId": 1,
  "userName": "Maicon",
  "timestamp": "2025-12-21T19:45:03.264Z",
  "userProfile": {
    "nome": "Maicon",
    "idade": "42",
    "objetivo": "Ganhar massa muscular",
    "restricoes": "Intolerante à lactose",
    "peso": 85,
    "altura": 1.75,
    "segueDieta": true,
    "customDiet": [
      {
        "id": "meal_1",
        "tipo": "Café da manhã",
        "horario": "07:00",
        "descricao": "Ovos mexidos com aveia"
      },
      {
        "id": "meal_2",
        "tipo": "Almoço",
        "horario": "12:00",
        "descricao": "Frango grelhado com batata doce e brócolis"
      }
    ],
    "goals": {
      "calories": 2500,
      "protein": 180,
      "carbs": 250,
      "fat": 70,
      "water": 3000,
      "exercise": 60,
      "sleep": 8
    },
    "premium": false
  }
}
```

---

## 📋 Campos do Payload

### Campos Principais:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `message` | string | Mensagem enviada pelo usuário | "Qual a melhor dieta?" |
| `userId` | number \| string | ID do usuário no Supabase | 1 ou "anonymous" |
| `userName` | string | Nome do usuário | "Maicon" |
| `timestamp` | string (ISO) | Data/hora do envio | "2025-12-21T19:45:03.264Z" |
| `userProfile` | object \| null | Dados completos do perfil | Ver abaixo |

---

### Objeto `userProfile`:

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `nome` | string | Nome completo | "Maicon" |
| `idade` | string \| undefined | Idade | "42" |
| `objetivo` | string \| undefined | Objetivo nutricional | "Ganhar massa muscular" |
| `restricoes` | string \| undefined | Restrições alimentares | "Intolerante à lactose" |
| `peso` | number \| undefined | Peso em kg | 85 |
| `altura` | number \| undefined | Altura em metros | 1.75 |
| `segueDieta` | boolean \| undefined | Se segue dieta personalizada | true |
| `customDiet` | array \| undefined | Refeições da dieta | Ver abaixo |
| `goals` | object | Metas nutricionais | Ver abaixo |
| `premium` | boolean | Se é usuário premium | false |

---

### Array `customDiet`:

Cada item da dieta contém:

```json
{
  "id": "meal_1",
  "tipo": "Café da manhã",
  "horario": "07:00",
  "descricao": "Ovos mexidos com aveia"
}
```

| Campo | Tipo | Descrição | Valores Possíveis |
|-------|------|-----------|-------------------|
| `id` | string | ID único da refeição | "meal_1", "meal_2", etc |
| `tipo` | string | Tipo de refeição | "Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar", "Ceia", "Outros" |
| `horario` | string | Horário (HH:MM) | "07:00", "12:00", etc |
| `descricao` | string | Descrição da refeição | "Ovos mexidos com aveia" |

---

### Objeto `goals`:

```json
{
  "calories": 2500,
  "protein": 180,
  "carbs": 250,
  "fat": 70,
  "water": 3000,
  "exercise": 60,
  "sleep": 8
}
```

| Campo | Tipo | Unidade | Descrição |
|-------|------|---------|-----------|
| `calories` | number | kcal | Meta de calorias diárias |
| `protein` | number | g | Meta de proteínas |
| `carbs` | number | g | Meta de carboidratos |
| `fat` | number | g | Meta de gorduras |
| `water` | number | ml | Meta de água |
| `exercise` | number | min | Meta de exercícios (minutos) |
| `sleep` | number | h | Meta de sono (horas) |

---

## 🎯 Casos de Uso para a IA

Com esses dados, a IA pode:

### 1. **Personalizar Respostas**
```
Usuário: "O que devo comer no café da manhã?"

IA (com contexto):
"Oi Maicon! Considerando seu objetivo de ganhar massa muscular 
e sua intolerância à lactose, recomendo:
- 4 ovos mexidos (proteína)
- 80g de aveia (carboidrato complexo)
- 1 banana (energia rápida)
- Leite de amêndoas (sem lactose)

Isso te dará aproximadamente 600 kcal e 35g de proteína!"
```

### 2. **Ajustar Recomendações às Metas**
```
Usuário: "Estou comendo muito?"

IA (com contexto):
"Sua meta é 2500 kcal/dia. Vejo que você já tem uma dieta 
planejada. Vou analisar suas refeições atuais e te dar 
feedback personalizado!"
```

### 3. **Respeitar Restrições**
```
Usuário: "Pode me dar uma receita de shake?"

IA (com contexto):
"Claro! Como você tem intolerância à lactose, vou sugerir 
um shake sem laticínios:
- 1 scoop de whey isolado (sem lactose)
- 1 banana
- 200ml de leite de coco
- 1 colher de pasta de amendoim"
```

### 4. **Considerar Horários**
```
Usuário: "O que comer agora?"

IA (com contexto):
"São 12:00. Vejo que você costuma almoçar nesse horário.
Sua dieta sugere: Frango grelhado com batata doce e brócolis.
Quer que eu sugira variações dessa refeição?"
```

### 5. **Diferenciar Premium vs Free**
```
if (userProfile.premium) {
  // Análise nutricional completa
  // Gráficos de evolução
  // Receitas ilimitadas
} else {
  // Respostas básicas
  // Sugestão de upgrade
}
```

---

## 🔍 Validação no n8n

### Verificar se `userProfile` existe:

```javascript
// No n8n
if ($json.userProfile) {
  // Usuário tem perfil completo
  const objetivo = $json.userProfile.objetivo;
  const restricoes = $json.userProfile.restricoes;
  const metas = $json.userProfile.goals;
  
  // Usar dados para personalizar resposta
} else {
  // Usuário sem perfil (primeiro acesso)
  // Sugerir completar onboarding
}
```

---

## 📊 Exemplo de Fluxo Completo

### 1. Usuário Envia Mensagem:
```
"Preciso de ajuda com minha dieta"
```

### 2. Webhook Recebe:
```json
{
  "message": "Preciso de ajuda com minha dieta",
  "userId": 1,
  "userName": "Maicon",
  "timestamp": "2025-12-21T19:45:03.264Z",
  "userProfile": {
    "nome": "Maicon",
    "objetivo": "Ganhar massa muscular",
    "restricoes": "Intolerante à lactose",
    "goals": {
      "calories": 2500,
      "protein": 180
    },
    "premium": false
  }
}
```

### 3. IA Processa com Contexto:
```
Prompt para IA:
"Você é Ayra, assistente nutricional.
Usuário: Maicon, 42 anos
Objetivo: Ganhar massa muscular
Restrições: Intolerante à lactose
Meta: 2500 kcal, 180g proteína
Plano: Free

Pergunta: Preciso de ajuda com minha dieta

Responda de forma personalizada e empática."
```

### 4. IA Responde:
```
"Oi Maicon! 👋

Vejo que seu objetivo é ganhar massa muscular e você tem 
intolerância à lactose. Vou te ajudar!

Para atingir sua meta de 2500 kcal e 180g de proteína, 
recomendo:

🍳 Café da manhã (600 kcal, 35g prot):
- 4 ovos mexidos
- 80g aveia
- 1 banana

🍗 Almoço (800 kcal, 60g prot):
- 200g frango grelhado
- 200g batata doce
- Brócolis à vontade

E assim por diante...

Quer que eu crie um plano completo? Assine o Premium 
para análises detalhadas! 🌟"
```

---

## ✅ Benefícios

1. **Contexto Completo:** IA sabe tudo sobre o usuário
2. **Respostas Personalizadas:** Baseadas em objetivos reais
3. **Respeita Restrições:** Nunca sugere alimentos proibidos
4. **Considera Metas:** Ajusta calorias e macros
5. **Diferencia Planos:** Premium recebe mais detalhes

---

## 🔧 Implementação no n8n

### Exemplo de Nó de Processamento:

```javascript
// Extrair dados do webhook
const message = $json.message;
const userProfile = $json.userProfile;

// Construir prompt para IA
let prompt = `Você é Ayra, assistente nutricional.\n\n`;

if (userProfile) {
  prompt += `Usuário: ${userProfile.nome}\n`;
  if (userProfile.idade) prompt += `Idade: ${userProfile.idade} anos\n`;
  if (userProfile.objetivo) prompt += `Objetivo: ${userProfile.objetivo}\n`;
  if (userProfile.restricoes) prompt += `Restrições: ${userProfile.restricoes}\n`;
  if (userProfile.peso) prompt += `Peso: ${userProfile.peso}kg\n`;
  if (userProfile.altura) prompt += `Altura: ${userProfile.altura}m\n`;
  
  prompt += `\nMetas Diárias:\n`;
  prompt += `- Calorias: ${userProfile.goals.calories} kcal\n`;
  prompt += `- Proteínas: ${userProfile.goals.protein}g\n`;
  prompt += `- Carboidratos: ${userProfile.goals.carbs}g\n`;
  prompt += `- Gorduras: ${userProfile.goals.fat}g\n`;
  
  prompt += `\nPlano: ${userProfile.premium ? 'Premium ⭐' : 'Free'}\n`;
}

prompt += `\nPergunta do usuário: ${message}\n\n`;
prompt += `Responda de forma personalizada, empática e profissional.`;

return { prompt };
```

---

**Webhook completo e pronto para uso! 🚀**

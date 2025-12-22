# 📢 Como Enviar Notificações para Todos os Dispositivos

## 🎯 3 Maneiras de Enviar Notificações Broadcast

---

## ✨ **Opção 1: Usar a Página de Admin (MAIS FÁCIL)**

### 📱 Acesso:
1. Faça login no Ayra
2. Vá em **Perfil**
3. Role até **"Notificações Push"**
4. Clique em **"Enviar Notificação para Todos"**

### 📝 Como Usar:
1. **Título**: Digite o título da notificação (máx. 50 caracteres)
2. **Mensagem**: Digite a mensagem (máx. 150 caracteres)
3. **Link**: URL que abrirá ao clicar (opcional, padrão: `/`)
4. **Preview**: Veja como ficará antes de enviar
5. **Enviar**: Clique em "Enviar para Todos"

### ✅ O que acontece:
- Sistema busca **todos os dispositivos** com notificações habilitadas
- Envia a notificação via Edge Function do Supabase
- Mostra quantos foram enviados com sucesso
- Remove subscrições inválidas automaticamente

**URL**: `https://seu-app.vercel.app/broadcast`

---

## 🔧 **Opção 2: Via Terminal/Script (Para Desenvolvedores)**

### Criar um script para enviar notificações:

```javascript
// send-notification.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'SUA_SUPABASE_URL',
  'SUA_SERVICE_ROLE_KEY' // NÃO USE ANON KEY!
);

async function sendBroadcast() {
  const { data, error } = await supabase.functions.invoke('send-push-notification', {
    body: {
      title: '🎉 Nova Atualização!',
      body: 'Confira as novidades que preparamos para você!',
      url: '/dashboard',
      icon: '/icon-192.png',
      badge: '/apple-touch-icon.png'
    }
  });

  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Sucesso!', data);
  }
}

sendBroadcast();
```

### Executar:
```bash
node send-notification.js
```

---

## ☁️ **Opção 3: Via API/cURL (Para Automações)**

### Enviar via cURL:

```bash
curl -X POST 'https://SEU_PROJETO.supabase.co/functions/v1/send-push-notification' \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Lembrete de Água",
    "body": "Hora de beber água! 💧",
    "url": "/dashboard",
    "icon": "/icon-192.png"
  }'
```

### Enviar para usuário específico:

```bash
curl -X POST 'https://SEU_PROJETO.supabase.co/functions/v1/send-push-notification' \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario",
    "title": "Mensagem Pessoal",
    "body": "Sua meta foi atingida! 🎯"
  }'
```

### Enviar para múltiplos usuários:

```bash
curl -X POST 'https://SEU_PROJETO.supabase.co/functions/v1/send-push-notification' \
  -H "Authorization: Bearer SUA_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["uuid-1", "uuid-2", "uuid-3"],
    "title": "Grupo de Estudos",
    "body": "Nova aula disponível!"
  }'
```

---

## 📋 **Parâmetros Disponíveis**

### Obrigatórios:
- `title` (string): Título da notificação
- `body` (string): Corpo da mensagem

### Opcionais:
- `userId` (string): ID do usuário específico
- `userIds` (array): Array de IDs para envio em lote
- `url` (string): URL de destino (padrão: "/")
- `icon` (string): URL do ícone (padrão: "/icon-192.png")
- `badge` (string): URL do badge (padrão: "/apple-touch-icon.png")
- `tag` (string): Tag para agrupar notificações
- `requireInteraction` (boolean): Manter até usuário clicar
- `actions` (array): Botões de ação
- `data` (object): Dados customizados

### Exemplo Completo:

```json
{
  "title": "🏆 Nova Conquista!",
  "body": "Você completou 7 dias seguidos!",
  "url": "/conquistas",
  "icon": "/icon-192.png",
  "badge": "/apple-touch-icon.png",
  "tag": "achievement-7days",
  "requireInteraction": true,
  "actions": [
    { "action": "view", "title": "Ver Conquista" },
    { "action": "share", "title": "Compartilhar" }
  ],
  "data": {
    "achievement_id": "7-day-streak",
    "points": 100
  }
}
```

---

## 🔐 **Segurança - IMPORTANTE!**

### ⚠️ **NÃO EXPONHA a Service Role Key!**

A Service Role Key **NUNCA** deve estar no código frontend. Use apenas:
- Edge Functions do Supabase ✅
- Backend/API próprio ✅
- Scripts locais/admin ✅

### ✅ **Como Configurar Corretamente:**

1. **Edge Function (Recomendado)**:
   - Crie a função no Supabase
   - Configure secrets no Dashboard
   - Chame via Supabase Client (usa anon key)

2. **Backend Próprio**:
   - Guarde Service Role Key em variáveis de ambiente
   - Nunca commite no Git
   - Use autenticação para rotas de envio

---

## 📊 **Monitoramento**

### Ver total de subscrições ativas:

```sql
SELECT COUNT(*) FROM push_subscriptions;
```

### Ver por usuário:

```sql
SELECT user_id, COUNT(*) as devices
FROM push_subscriptions
GROUP BY user_id;
```

### Limpar subscrições antigas (>30 dias sem atualizar):

```sql
DELETE FROM push_subscriptions
WHERE updated_at < NOW() - INTERVAL '30 days';
```

---

## 🧪 **Testar o Sistema**

### 1. Teste Local (página de admin):
```
http://localhost:5173/broadcast
```

### 2. Teste em Produção:
```
https://seu-app.vercel.app/broadcast
```

### 3. Teste via API:
Use o cURL acima substituindo as URLs

---

## 📱 **Exemplos de Uso**

### Lembrete de Água:
```javascript
{
  "title": "💧 Hora de Hidratar",
  "body": "Beba um copo de água agora!",
  "url": "/registro"
}
```

### Nova Receita:
```javascript
{
  "title": "🍳 Nova Receita Disponível",
  "body": "Salada Mediterrânea - Saudável e deliciosa!",
  "url": "/receitas/salada-mediterranea"
}
```

### Meta Alcançada:
```javascript
{
  "title": "🎯 Meta Alcançada!",
  "body": "Parabéns! Você atingiu sua meta semanal de calorias.",
  "url": "/progresso",
  "requireInteraction": true
}
```

### Atualização do App:
```javascript
{
  "title": "✨ Atualização Disponível",
  "body": "Novos recursos e melhorias foram adicionados!",
  "url": "/"
}
```

---

## ❓ **FAQ**

### P: Quanto tempo leva para enviar?
**R**: Instantâneo! As notificações são enviadas em paralelo.

### P: Tem limite de envios?
**R**: Depende do plano do Supabase. Padrão: 500.000 invocações/mês.

### P: E se o usuário desabilitou notificações?
**R**: Ele não receberá. Sistema só envia para quem habilitou.

### P: Funciona offline?
**R**: Sim! Service Worker entrega quando voltar online.

### P: Posso agendar notificações?
**R**: Sim! Use Supabase Cron Jobs ou serviços como n8n/Zapier.

---

## 🚀 **Próximos Passos**

1. ✅ Configure a Edge Function (se ainda não fez)
2. ✅ Teste na página de admin
3. ✅ Envie sua primeira notificação broadcast
4. ✅ Configure automações (opcional)

---

## 📚 **Recursos Adicionais**

- **Documentação Completa**: `PUSH_NOTIFICATIONS_README.md`
- **Exemplos Práticos**: `PUSH_EXAMPLES.md`
- **Setup Rápido**: `SETUP_PUSH_NOTIFICATIONS.md`
- **Guia iPhone**: `IPHONE_PUSH_GUIDE.md`

---

**Sistema de Notificações Push Ayra** | Desenvolvido com VAPID 🔔

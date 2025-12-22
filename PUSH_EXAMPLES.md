# 💡 Exemplos Práticos de Uso - Push Notifications

Este arquivo contém exemplos práticos de como usar o sistema de notificações push no Ayra.

---

## 📱 1. Integração Básica em Componente

### Exemplo: Página de Dashboard com status de notificações

```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, BellOff } from 'lucide-react';

function Dashboard() {
  const { isEnabled, isSupported } = usePushNotifications();

  return (
    <div>
      <h1>Dashboard</h1>
      
      {isSupported && (
        <div className="notification-status">
          {isEnabled ? (
            <div className="flex items-center gap-2 text-green-500">
              <Bell className="w-4 h-4" />
              <span>Notificações ativas</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-500">
              <BellOff className="w-4 h-4" />
              <span>Ative as notificações em Configurações</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 🔔 2. Botão de Toggle Rápido

### Exemplo: Toggle inline para habilitar/desabilitar

```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell } from 'lucide-react';

function QuickNotificationToggle() {
  const { isEnabled, isLoading, enableNotifications, disableNotifications } = usePushNotifications();

  const handleToggle = async () => {
    try {
      if (isEnabled) {
        await disableNotifications();
      } else {
        await enableNotifications();
      }
    } catch (error) {
      console.error('Erro ao alternar notificações:', error);
      alert('Erro ao alterar configuração de notificações');
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white"
    >
      <Bell className="w-4 h-4" />
      {isLoading ? 'Processando...' : isEnabled ? 'Notificações ON' : 'Notificações OFF'}
    </button>
  );
}
```

---

## ⏰ 3. Lembrete de Água (Frontend)

### Exemplo: Enviar lembrete local depois de X minutos

```tsx
import { useEffect } from 'react';
import { showTestNotification } from '../lib/pushNotifications';

function WaterReminder() {
  useEffect(() => {
    // Enviar lembrete a cada 2 horas
    const interval = setInterval(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        if (registration) {
          await registration.showNotification('💧 Hora de beber água!', {
            body: 'Você está hidratado hoje? Beba um copo de água agora.',
            icon: '/icon-192.png',
            badge: '/apple-touch-icon.png',
            tag: 'water-reminder',
            data: { url: '/dashboard' }
          });
        }
      } catch (error) {
        console.error('Erro ao enviar lembrete:', error);
      }
    }, 2 * 60 * 60 * 1000); // 2 horas

    return () => clearInterval(interval);
  }, []);

  return null;
}
```

---

## 🎯 4. Notificação de Conquista Desbloqueada

### Exemplo: Enviar notificação quando usuário desbloqueia badge

```tsx
async function unlockAchievement(achievementName: string) {
  // Lógica para desbloquear conquista...
  
  // Enviar notificação
  const registration = await navigator.serviceWorker.getRegistration('/');
  if (registration) {
    await registration.showNotification('🏆 Nova Conquista!', {
      body: `Parabéns! Você desbloqueou: ${achievementName}`,
      icon: '/icon-192.png',
      badge: '/apple-touch-icon.png',
      tag: 'achievement',
      requireInteraction: true, // Mantém até usuário clicar
      data: { 
        url: '/conquistas',
        achievementName 
      },
      actions: [
        { action: 'view', title: '👀 Ver Conquista' },
        { action: 'share', title: '🔗 Compartilhar' }
      ]
    });
  }
}
```

---

## 📤 5. Enviar Notificação via Backend (Edge Function)

### Exemplo: Função auxiliar para enviar notificação

```typescript
// src/lib/sendPushNotification.ts

import { supabase } from './supabase';

interface SendNotificationParams {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  url?: string;
  icon?: string;
  requireInteraction?: boolean;
}

export async function sendPushNotification(params: SendNotificationParams) {
  const { data, error } = await supabase.functions.invoke('send-push-notification', {
    body: params
  });

  if (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }

  return data;
}

// Uso:
// await sendPushNotification({
//   userId: 'user-uuid',
//   title: 'Nova Meta',
//   body: 'Você atingiu 75% da sua meta de água!',
//   url: '/progresso'
// });
```

---

## 📊 6. Notificação em Lote (Múltiplos Usuários)

### Exemplo: Enviar para todos usuários com meta de peso

```typescript
async function notifyWeightGoalUsers() {
  // Buscar usuários com meta de peso próxima
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('has_weight_goal', true);

  if (!users || users.length === 0) return;

  const userIds = users.map(u => u.id);

  await sendPushNotification({
    userIds,
    title: '⚖️ Lembrete Semanal',
    body: 'Não esqueça de registrar seu peso esta semana!',
    url: '/registro'
  });
}
```

---

## 🔄 7. Verificar Status Antes de Ação

### Exemplo: Avisar usuário se notificações estão desabilitadas

```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';

function MetasPage() {
  const { isEnabled, isSupported, enableNotifications } = usePushNotifications();

  const createGoal = async () => {
    // Criar meta...
    
    // Sugerir habilitar notificações se estiverem desabilitadas
    if (isSupported && !isEnabled) {
      const shouldEnable = confirm(
        'Deseja receber lembretes sobre sua meta? Habilite as notificações!'
      );
      
      if (shouldEnable) {
        try {
          await enableNotifications();
          alert('Notificações habilitadas! Você receberá lembretes sobre suas metas.');
        } catch (error) {
          console.error('Erro ao habilitar:', error);
        }
      }
    }
  };

  return (
    <button onClick={createGoal}>
      Criar Nova Meta
    </button>
  );
}
```

---

## 🕐 8. Notificações Agendadas (Backend)

### Exemplo: Agendar notificação para hora específica

```typescript
// Usando Supabase Edge Functions + Deno Cron ou similar

// supabase/functions/scheduled-notifications/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const now = new Date();
  const hour = now.getHours();

  // Enviar lembrete de almoço às 12h
  if (hour === 12) {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('lunch_reminder', true);

    if (users && users.length > 0) {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userIds: users.map(u => u.id),
          title: '🍽️ Hora do Almoço!',
          body: 'Não esqueça de registrar sua refeição.',
          url: '/registro'
        }
      });
    }
  }

  return new Response('OK', { status: 200 });
});
```

---

## 📈 9. Analytics de Notificações

### Exemplo: Rastrear cliques em notificações

```javascript
// No Service Worker (public/sw.js)

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Enviar analytics
  const notificationData = event.notification.data;
  
  fetch('/api/analytics/notification-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tag: event.notification.tag,
      action: event.action,
      timestamp: new Date().toISOString(),
      ...notificationData
    })
  });

  // Abrir URL
  const urlToOpen = notificationData?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
```

---

## 🎨 10. Notificação Rica (com imagem)

### Exemplo: Notificação com imagem de conquista

```typescript
async function sendRichNotification() {
  const registration = await navigator.serviceWorker.getRegistration('/');
  
  if (registration) {
    await registration.showNotification('🏅 Streak de 7 dias!', {
      body: 'Incrível! Você registrou suas refeições por 7 dias seguidos!',
      icon: '/icon-192.png',
      badge: '/apple-touch-icon.png',
      image: '/achievements/7-day-streak.png', // Imagem grande
      tag: 'streak-7',
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/conquistas' },
      actions: [
        { action: 'view', title: 'Ver Conquistas' },
        { action: 'share', title: 'Compartilhar' }
      ]
    });
  }
}
```

---

## 🚨 11. Notificação de Alerta Crítico

### Exemplo: Alerta para usuário diabético

```typescript
async function sendCriticalAlert(userId: string) {
  await sendPushNotification({
    userId,
    title: '⚠️ Alerta Importante',
    body: 'Seu nível de glicose está fora da faixa normal. Consulte seu médico.',
    url: '/saude/glicose',
    requireInteraction: true, // Não desaparece automaticamente
  });
}
```

---

## 🔕 12. Notificações Silenciosas (Data-only)

### Exemplo: Sincronizar dados em background

```javascript
// Service Worker
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  if (data.silent) {
    // Não mostrar notificação, apenas processar dados
    event.waitUntil(
      fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(data.payload)
      })
    );
  } else {
    // Mostrar notificação normal
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon
      })
    );
  }
});
```

---

## 📞 13. Integração com Chat

### Exemplo: Notificar nova mensagem do chat

```typescript
// Quando receber nova mensagem
async function onNewChatMessage(message: ChatMessage) {
  const { userId, senderName, text } = message;

  await sendPushNotification({
    userId,
    title: `💬 ${senderName}`,
    body: text.substring(0, 100), // Primeiros 100 caracteres
    url: '/chat',
    icon: '/icon-192.png',
    tag: 'chat', // Substitui notificações anteriores de chat
    actions: [
      { action: 'reply', title: 'Responder' },
      { action: 'view', title: 'Ver Chat' }
    ]
  });
}
```

---

## 🎯 14. Onboarding: Pedir Permissão no Momento Certo

### Exemplo: Pedir no final do onboarding

```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';

function OnboardingFinal() {
  const { enableNotifications } = usePushNotifications();

  const handleComplete = async () => {
    // Completar onboarding...
    
    // Perguntar sobre notificações
    const wantsNotifications = confirm(
      '🔔 Deseja receber lembretes e atualizações?\n\n' +
      'Você pode mudar isso depois nas Configurações.'
    );

    if (wantsNotifications) {
      try {
        await enableNotifications();
      } catch (error) {
        console.error('Usuário negou permissão');
      }
    }

    // Redirecionar para dashboard
    navigate('/dashboard');
  };

  return (
    <button onClick={handleComplete}>
      Começar a Usar Ayra
    </button>
  );
}
```

---

## 🧪 15. Ambiente de Teste

### Exemplo: Helper para testar notificações em desenvolvimento

```typescript
// src/lib/devTools.ts

export const NotificationDevTools = {
  // Enviar notificação de teste
  async test(title = 'Teste', body = 'Esta é uma notificação de teste') {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/apple-touch-icon.png'
      });
    }
  },

  // Limpar todas as notificações
  async clearAll() {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      const notifications = await registration.getNotifications();
      notifications.forEach(n => n.close());
    }
  },

  // Ver subscrições ativas
  async getSubscription() {
    const registration = await navigator.serviceWorker.getRegistration('/');
    if (registration) {
      const sub = await registration.pushManager.getSubscription();
      console.log('Subscrição atual:', sub);
      return sub;
    }
  }
};

// Uso no console do navegador:
// NotificationDevTools.test('Olá', 'Mundo!')
// NotificationDevTools.clearAll()
// NotificationDevTools.getSubscription()
```

---

**💡 Dica**: Estes exemplos podem ser adaptados conforme suas necessidades específicas!

Para mais informações, consulte:
- `PUSH_NOTIFICATIONS_README.md` - Documentação completa
- `SETUP_PUSH_NOTIFICATIONS.md` - Guia de setup
- `IMPLEMENTATION_SUMMARY.md` - Resumo da implementação

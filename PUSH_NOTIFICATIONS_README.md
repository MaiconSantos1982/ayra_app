# Sistema de Notificações Push com VAPID

Este documento descreve como configurar e usar o sistema de notificações push no Ayra.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Uso](#uso)
- [Deploy](#deploy)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O sistema de notificações push foi implementado usando:

- **VAPID (Voluntary Application Server Identification)**: Protocolo padrão para autenticação de push notifications
- **Service Worker**: Gerencia notificações em background
- **Supabase**: Armazena subscrições de usuários
- **Edge Functions**: Envia notificações via backend

## ✅ Pré-requisitos

- Node.js 18+ instalado
- Projeto configurado no Supabase
- HTTPS habilitado (obrigatório para Service Workers)

## ⚙️ Configuração

### 1. Gerar Chaves VAPID

As chaves VAPID já foram geradas. Você receberá:

```
Public Key: BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA
Private Key: fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8
```

Para gerar novas chaves (se necessário):

```bash
npx web-push generate-vapid-keys
```

### 2. Configurar Variáveis de Ambiente

#### Local (.env)

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_anon_key
VITE_VAPID_PUBLIC_KEY=BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA
VAPID_PRIVATE_KEY=fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8
```

#### Vercel

Configure as mesmas variáveis no painel da Vercel:

1. Vá em Settings → Environment Variables
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY` (opcional para frontend)

### 3. Criar Tabela no Supabase

Execute o SQL no SQL Editor do Supabase:

```bash
# O arquivo está em: schema_push_notifications.sql
```

Ou execute via linha de comando:

```bash
supabase db push
```

### 4. Criar Edge Function (Opcional - para envio via backend)

Se você quiser enviar notificações via backend:

1. Instale o Supabase CLI:
```bash
npm install -g supabase
```

2. Faça login:
```bash
supabase login
```

3. Crie a função:
```bash
supabase functions new send-push-notification
```

4. Copie o conteúdo de `supabase_edge_function_send_push.ts` para:
```
supabase/functions/send-push-notification/index.ts
```

5. Configure as variáveis de ambiente no Supabase Dashboard:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`

6. Faça deploy:
```bash
supabase functions deploy send-push-notification
```

## 📁 Estrutura de Arquivos

```
/
├── public/
│   ├── sw.js                          # Service Worker
│   └── manifest.json                  # PWA Manifest
├── src/
│   ├── lib/
│   │   └── pushNotifications.ts       # Funções do cliente
│   ├── hooks/
│   │   └── usePushNotifications.ts    # Hook React
│   └── components/
│       └── PushNotificationSettings.tsx # Componente UI
├── schema_push_notifications.sql       # Schema do banco
└── supabase_edge_function_send_push.ts # Edge Function
```

## 🚀 Uso

### No Componente React

```tsx
import PushNotificationSettings from '../components/PushNotificationSettings';

function Settings() {
  return (
    <div>
      <h2>Configurações</h2>
      <PushNotificationSettings />
    </div>
  );
}
```

### Usando o Hook Diretamente

```tsx
import { usePushNotifications } from '../hooks/usePushNotifications';

function MyComponent() {
  const {
    isSupported,
    isEnabled,
    isLoading,
    enableNotifications,
    disableNotifications,
    sendTestNotification
  } = usePushNotifications();

  const handleEnable = async () => {
    try {
      await enableNotifications();
      console.log('Notificações habilitadas!');
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      {isSupported ? (
        <button onClick={handleEnable} disabled={isLoading}>
          {isEnabled ? 'Desabilitar' : 'Habilitar'} Notificações
        </button>
      ) : (
        <p>Navegador não suporta notificações</p>
      )}
    </div>
  );
}
```

### Enviando Notificações (Backend)

#### Via Edge Function:

```bash
curl -X POST https://[project-ref].supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer [anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid",
    "title": "Nova Mensagem",
    "body": "Você tem uma nova mensagem!",
    "url": "/messages",
    "icon": "/icon-192.png"
  }'
```

#### Parâmetros:

- `userId` (string): ID do usuário para enviar (opcional)
- `userIds` (string[]): Array de IDs para envio em lote (opcional)
- `title` (string): Título da notificação **obrigatório**
- `body` (string): Corpo da mensagem **obrigatório**
- `url` (string): URL para abrir ao clicar (padrão: "/")
- `icon` (string): URL do ícone (padrão: "/icon-192.png")
- `badge` (string): URL do badge (padrão: "/apple-touch-icon.png")
- `tag` (string): Tag para agrupar notificações
- `requireInteraction` (boolean): Mantém notificação até interação
- `actions` (array): Botões de ação na notificação
- `data` (object): Dados customizados

## 🚢 Deploy

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Tabela `push_subscriptions` criada no Supabase
- [ ] Edge Function deployada (se usar backend)
- [ ] Service Worker acessível em `/sw.js`
- [ ] Manifest.json configurado
- [ ] HTTPS habilitado
- [ ] Testado em produção

### Comandos:

```bash
# Build local
npm run build

# Deploy na Vercel
vercel --prod

# Deploy Edge Function
supabase functions deploy send-push-notification
```

## 🔧 Troubleshooting

### Notificações não aparecem

1. **Verifique permissões**: Certifique-se de que o usuário concedeu permissão
2. **Verifique HTTPS**: Service Workers só funcionam em HTTPS
3. **Limpe o cache**: Desregistre o SW antigo e registre novamente
4. **Verifique console**: Procure por erros no console do navegador

```javascript
// Desregistrar service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister());
});
```

### Service Worker não registra

1. Verifique se o arquivo está em `/public/sw.js`
2. Certifique-se de que o scope está correto (`/`)
3. Verifique se está em HTTPS (ou localhost)

### Erro "VAPID_PUBLIC_KEY não configurada"

Adicione a chave no arquivo `.env`:

```env
VITE_VAPID_PUBLIC_KEY=BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA
```

### Push não chega no iOS

Safari no iOS tem suporte limitado a Push Notifications. Considere:
- Usar PWA instalado (Add to Home Screen)
- Implementar notificações in-app como fallback

## 📱 Compatibilidade de Navegadores

| Navegador | Desktop | Mobile |
|-----------|---------|--------|
| Chrome    | ✅      | ✅     |
| Firefox   | ✅      | ✅     |
| Safari    | ✅*     | ⚠️**   |
| Edge      | ✅      | ✅     |

*Safari 16+ (macOS Ventura+)  
**Safari iOS requer PWA instalado

## 📚 Recursos Adicionais

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Spec](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN - Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

## 🔐 Segurança

- **Nunca** exponha a `VAPID_PRIVATE_KEY` no frontend
- Use HTTPS sempre (obrigatório para Service Workers)
- Valide permissões antes de subscrever
- Implemente rate limiting no backend
- Limpe subscrições inválidas/expiradas regularmente

## 🎨 Personalização

### Customizar Notificação

Edite o Service Worker (`public/sw.js`) na seção `push` event:

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/seu-icone.png',
    badge: '/seu-badge.png',
    // ... mais opções
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### Adicionar Botões de Ação

```javascript
const options = {
  body: 'Nova mensagem',
  actions: [
    { action: 'view', title: 'Ver' },
    { action: 'dismiss', title: 'Dispensar' }
  ]
};
```

---

**Desenvolvido com ❤️ para Ayra**

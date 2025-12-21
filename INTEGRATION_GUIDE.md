# 🚀 Guia de Integração - MVP Simplificado

## 📋 Arquivos Criados

Foram criados os seguintes arquivos para o MVP simplificado:

### **Core:**
1. ✅ `src/lib/localStorage.ts` - Sistema de armazenamento local
2. ✅ `schema_simplified.sql` - Schema simplificado do Supabase

### **Páginas:**
3. ✅ `src/pages/DashboardSimple.tsx` - Dashboard otimizado
4. ✅ `src/pages/RegisterSimple.tsx` - Registro de refeição
5. ✅ `src/pages/OnboardingSimple.tsx` - Onboarding 3 perguntas
6. ✅ `src/pages/ChatSimple.tsx` - Chat com IA
7. ✅ `src/pages/ProfileSimple.tsx` - Perfil do usuário

### **Documentação:**
8. ✅ `MVP_SIMPLIFICATION_GUIDE.md` - Guia completo
9. ✅ `INTEGRATION_GUIDE.md` - Este arquivo

---

## 🔧 Passo a Passo de Integração

### **1. Atualizar Supabase**

Execute o schema simplificado no SQL Editor do Supabase:

```bash
# 1. Acesse: https://app.supabase.com
# 2. Selecione seu projeto
# 3. Vá em "SQL Editor"
# 4. Copie e cole o conteúdo de: schema_simplified.sql
# 5. Clique em "Run"
```

### **2. Atualizar App.tsx**

Substitua as rotas antigas pelas novas:

```typescript
// src/App.tsx
import DashboardSimple from './pages/DashboardSimple';
import RegisterSimple from './pages/RegisterSimple';
import OnboardingSimple from './pages/OnboardingSimple';
import ChatSimple from './pages/ChatSimple';
import ProfileSimple from './pages/ProfileSimple';

// Dentro do <Routes>:
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route index element={<Navigate to="/inicio" replace />} />
  <Route path="inicio" element={<DashboardSimple />} />
  <Route path="registro" element={<RegisterSimple />} />
  <Route path="chat" element={<ChatSimple />} />
  <Route path="perfil" element={<ProfileSimple />} />
  <Route path="onboarding" element={<OnboardingSimple />} />
</Route>
```

### **3. Atualizar AuthContext**

Modifique o AuthContext para verificar onboarding:

```typescript
// src/contexts/AuthContext.tsx
import { getUserData } from '../lib/localStorage';

// Dentro do useEffect após login:
useEffect(() => {
  if (session) {
    const userData = getUserData();
    
    // Se não tem dados locais, redireciona para onboarding
    if (!userData) {
      navigate('/onboarding');
    }
  }
}, [session]);
```

### **4. Atualizar Layout (Navegação)**

Simplifique a navegação para apenas as páginas essenciais:

```typescript
// src/components/Layout.tsx
const navItems = [
  { path: '/inicio', label: 'Início', icon: Home },
  { path: '/registro', label: 'Registrar', icon: Plus },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/perfil', label: 'Perfil', icon: User },
];
```

### **5. Configurar Webhook (Opcional)**

Se quiser usar n8n ou outra IA:

```typescript
// .env
VITE_WEBHOOK_URL=https://seu-webhook.n8n.cloud/webhook/ayra-chat
```

---

## 📱 Estrutura Final do App

```
/login          → AuthPage (já existe)
/onboarding     → OnboardingSimple (novo)
/inicio         → DashboardSimple (novo)
/registro       → RegisterSimple (novo)
/chat           → ChatSimple (novo)
/perfil         → ProfileSimple (novo)
```

---

## 🗑️ Arquivos que Podem Ser Removidos (Opcional)

Para deixar o projeto mais limpo, você pode remover:

```bash
# Páginas antigas (manter como backup ou deletar)
src/pages/Dashboard.tsx
src/pages/Register.tsx
src/pages/AnamnesePage.tsx
src/pages/MetasPage.tsx
src/pages/ProgressPage.tsx
src/pages/AchievementsPage.tsx
src/pages/RankingPage.tsx
src/pages/RegistroDiarioPage.tsx
src/pages/SettingsPage.tsx
src/pages/AdminDashboard.tsx
src/pages/CheckoutPage.tsx
src/pages/PremiumPage.tsx
src/pages/SuccessPage.tsx

# Schemas antigos
schema.sql
schema_admin.sql
```

**Recomendação:** Mova para uma pasta `_old/` em vez de deletar:

```bash
mkdir src/pages/_old
mv src/pages/Dashboard.tsx src/pages/_old/
mv src/pages/Register.tsx src/pages/_old/
# ... etc
```

---

## ✅ Checklist de Implementação

### **Backend:**
- [ ] Executar `schema_simplified.sql` no Supabase
- [ ] Verificar se tabelas foram criadas:
  - [ ] `ayra_users`
  - [ ] `ayra_chat_history`
- [ ] Testar autenticação

### **Frontend:**
- [ ] Atualizar `App.tsx` com novas rotas
- [ ] Atualizar `AuthContext.tsx` para verificar onboarding
- [ ] Atualizar `Layout.tsx` com navegação simplificada
- [ ] Configurar `VITE_WEBHOOK_URL` (se usar IA)

### **Testes:**
- [ ] Testar fluxo completo:
  1. [ ] Login
  2. [ ] Onboarding (primeira vez)
  3. [ ] Dashboard
  4. [ ] Registrar refeição
  5. [ ] Chat
  6. [ ] Perfil
  7. [ ] Export/Import de dados
  8. [ ] Logout

### **Mobile:**
- [ ] Testar em Chrome DevTools (modo mobile)
- [ ] Testar em dispositivo real (iOS/Android)
- [ ] Verificar responsividade
- [ ] Testar captura de foto

---

## 🎨 Customizações Opcionais

### **1. Adicionar PWA (Progressive Web App)**

Crie `public/manifest.json`:

```json
{
  "name": "Ayra - Nutrição Inteligente",
  "short_name": "Ayra",
  "description": "Seu assistente de nutrição com IA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#120d1d",
  "theme_color": "#39ff14",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Adicione no `index.html`:

```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#39ff14">
<meta name="apple-mobile-web-app-capable" content="yes">
```

### **2. Adicionar Service Worker (Offline)**

Crie `public/sw.js`:

```javascript
const CACHE_NAME = 'ayra-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

Registre no `main.tsx`:

```typescript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### **3. Adicionar Notificações Push**

```typescript
// Pedir permissão
const permission = await Notification.requestPermission();

if (permission === 'granted') {
  new Notification('Ayra', {
    body: 'Não esqueça de registrar suas refeições hoje!',
    icon: '/icon-192.png',
  });
}
```

---

## 🐛 Troubleshooting

### **Erro: "getUserData is not a function"**
- Verifique se importou corretamente: `import { getUserData } from '../lib/localStorage'`

### **Erro: "Table ayra_users does not exist"**
- Execute o `schema_simplified.sql` no Supabase

### **Erro: "Cannot read property 'profile' of null"**
- Usuário não completou onboarding. Redirecione para `/onboarding`

### **Foto não aparece**
- Verifique se o navegador suporta `FileReader`
- Teste em HTTPS (necessário para câmera)

### **Chat não funciona**
- Verifique se `VITE_WEBHOOK_URL` está configurado
- Teste com respostas padrão primeiro (já implementado)

---

## 📊 Próximos Passos

Após implementar o MVP, considere adicionar:

1. **Analytics**: Google Analytics ou Mixpanel
2. **Error Tracking**: Sentry
3. **A/B Testing**: Optimizely
4. **Feedback**: Hotjar ou similar
5. **Push Notifications**: OneSignal
6. **Ranking**: Implementar tabela de ranking
7. **Gráficos**: Chart.js ou Recharts
8. **Premium**: Sistema de pagamento (Stripe)

---

## 🚀 Deploy

### **Vercel (Recomendado):**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Configurar variáveis de ambiente na dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_WEBHOOK_URL (opcional)
```

### **Netlify:**

```bash
# 1. Build
npm run build

# 2. Deploy pasta dist/
netlify deploy --prod --dir=dist
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs do Supabase
3. Teste em modo incógnito
4. Limpe cache e localStorage

---

**Boa sorte com o lançamento! 🎉**

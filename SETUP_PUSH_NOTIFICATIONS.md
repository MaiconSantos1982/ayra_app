# 🚀 Setup Rápido - Push Notifications

## Passo a Passo para Configuração

### 1️⃣ Configurar Variáveis de Ambiente

Adicione as chaves VAPID geradas ao seu arquivo `.env`:

```bash
# Abra o arquivo .env e adicione:
VITE_VAPID_PUBLIC_KEY=BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA
VAPID_PRIVATE_KEY=fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8
```

### 2️⃣ Criar Tabela no Supabase

Acesse o SQL Editor no Supabase Dashboard e execute:

```sql
-- Copie e cole o conteúdo do arquivo: schema_push_notifications.sql
```

Ou via linha de comando (se tiver Supabase CLI):

```bash
supabase db push
```

### 3️⃣ Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

### 4️⃣ Testar

1. Abra a aplicação em **HTTPS** (obrigatório!) ou `localhost`
2. Vá para Configurações (`/settings` ou `/configuracoes`)
3. Role até a seção "Notificações Push"
4. Clique no toggle para habilitar
5. Aceite a permissão do navegador
6. Clique em "Enviar notificação de teste"

## ✅ Checklist de Verificação

- [x] Chaves VAPID geradas
- [ ] `.env` configurado com `VITE_VAPID_PUBLIC_KEY`
- [ ] Tabela `push_subscriptions` criada no Supabase
- [ ] Servidor reiniciado
- [ ] Testado em HTTPS ou localhost
- [ ] Permissão de notificações concedida
- [ ] Notificação de teste recebida

## 🎯 Próximos Passos (Opcional)

### Para Deploy em Produção:

1. **Configurar no Vercel**:
   - Vá em Settings → Environment Variables
   - Adicione `VITE_VAPID_PUBLIC_KEY`

2. **Criar Edge Function (para enviar notificações do backend)**:
   ```bash
   # Instalar Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Criar função
   supabase functions new send-push-notification
   
   # Copiar código de: supabase_edge_function_send_push.ts
   # Para: supabase/functions/send-push-notification/index.ts
   
   # Deploy
   supabase functions deploy send-push-notification
   ```

3. **Configurar variáveis no Supabase**:
   - Dashboard → Project Settings → Edge Functions
   - Adicione:
     - `VAPID_PUBLIC_KEY`
     - `VAPID_PRIVATE_KEY`

## 🧪 Como Testar Push Notifications

### Teste Local (via componente):
1. Abra `/settings`
2. Habilite notificações
3. Clique em "Enviar notificação de teste"

### Teste via Backend (se deployou Edge Function):
```bash
curl -X POST https://[seu-projeto].supabase.co/functions/v1/send-push-notification \
  -H "Authorization: Bearer [sua-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario",
    "title": "Teste",
    "body": "Sua notificação funciona! 🎉"
  }'
```

## 🐛 Problemas Comuns

### "VAPID_PUBLIC_KEY não configurada"
- Verifique se adicionou no `.env`
- Reinicie o servidor (`npm run dev`)

### "Service Worker não registrado"
- Verifique se está em HTTPS ou localhost
- Limpe o cache do navegador
- No DevTools → Application → Service Workers → Unregister

### Notificação não aparece
- Verifique se concedeu permissão no navegador
- Veja o console para erros
- Teste em Chrome/Firefox primeiro (melhor suporte)

## 📱 Compatibilidade

| Navegador | Suporte |
|-----------|---------|
| Chrome Desktop | ✅ |
| Chrome Mobile | ✅ |
| Firefox Desktop | ✅ |
| Firefox Mobile | ✅ |
| Safari Desktop | ✅ (16+) |
| Safari iOS | ⚠️ PWA apenas |
| Edge | ✅ |

## 📚 Arquivos Criados

- ✅ `public/sw.js` - Service Worker
- ✅ `src/lib/pushNotifications.ts` - Funções cliente
- ✅ `src/hooks/usePushNotifications.ts` - Hook React
- ✅ `src/components/PushNotificationSettings.tsx` - Componente UI
- ✅ `schema_push_notifications.sql` - Schema banco
- ✅ `supabase_edge_function_send_push.ts` - Edge Function
- ✅ `PUSH_NOTIFICATIONS_README.md` - Documentação completa

---

**Pronto para começar! 🚀**

Qualquer dúvida, consulte o `PUSH_NOTIFICATIONS_README.md` para documentação completa.

# 🚀 Deploy da Edge Function de Push Notifications

## 📋 Pré-requisitos

1. Supabase CLI instalado:
```bash
brew install supabase/tap/supabase
```

2. Login no Supabase:
```bash
supabase login
```

## 🔑 Configurar Secrets (Variáveis de Ambiente)

Execute no terminal:

```bash
# VAPID Public Key
supabase secrets set VAPID_PUBLIC_KEY=BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA

# VAPID Private Key  
supabase secrets set VAPID_PRIVATE_KEY=fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8
```

## 📤 Deploy da Edge Function

```bash
# Link ao projeto Supabase (primeira vez)
supabase link --project-ref ztlddoutgextdmyiwoxl

# Deploy da função
supabase functions deploy send-push-notification
```

## ✅ Testar a Edge Function

Após deploy, teste via curl:

```bash
curl -X POST \
  'https://ztlddoutgextdmyiwoxl.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer SEU_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "Teste",
    "body": "Notificação de teste!",
    "url": "/",
    "broadcast": true
  }'
```

## 🔍 Ver Logs (Debug)

```bash
supabase functions logs send-push-notification
```

## 📝 Notas

- As variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetadas automaticamente
- O broadcast agora funcionará via Edge Function (sem CORS)
- Subscrições expiradas (410) são removidas automaticamente

# 📢 Script de Broadcast de Notificações

Este script permite enviar notificações Push para todos os usuários inscritos no Ayra.

## 📋 Pré-requisitos

1. Node.js instalado
2. Dependências instaladas:
   ```bash
   npm install web-push dotenv
   ```
3. Arquivo `.env` configurado com:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VAPID_PRIVATE_KEY` (opcional, já tem fallback no script)

## 🚀 Como Usar

Execute no terminal na raiz do projeto:

```bash
node send-broadcast.cjs "Título da Notificação" "Mensagem do corpo" "/url-destino"
```

### Exemplos:

**Aviso de Manutenção:**
```bash
node send-broadcast.cjs "⚠️ Manutenção" "O sistema ficará instável por 10min."
```

**Nova Funcionalidade:**
```bash
node send-broadcast.cjs "🚀 Novidade!" "Confira a nova área de Dashboards." "/dashboard"
```

## 🛠️ Resolução de Problemas

Se receber erro de Chave VAPID:
- Verifique se as chaves no script `send-broadcast.cjs` correspondem às chaves usadas no frontend (`src/lib/pushNotifications.ts`).

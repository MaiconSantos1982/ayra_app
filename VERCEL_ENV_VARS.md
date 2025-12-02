# 🔐 Variáveis de Ambiente para Vercel

## Configuração na Vercel

Ao fazer deploy na Vercel, adicione estas variáveis de ambiente:

### VITE_SUPABASE_URL
**Descrição:** URL do projeto Supabase
**Onde encontrar:** Supabase → Settings → API → Project URL
**Exemplo:** `https://xxxxxxxxxxx.supabase.co`
**Ambientes:** Production, Preview, Development

### VITE_SUPABASE_ANON_KEY
**Descrição:** Chave pública/anônima do Supabase
**Onde encontrar:** Supabase → Settings → API → Project API keys → anon/public
**Exemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (chave longa)
**Ambientes:** Production, Preview, Development

---

## Como Adicionar na Vercel

1. No dashboard do projeto, vá em **Settings** → **Environment Variables**
2. Para cada variável:
   - **Name:** Cole o nome exato (ex: `VITE_SUPABASE_URL`)
   - **Value:** Cole o valor do Supabase
   - **Environments:** Marque todos (Production, Preview, Development)
   - Clique em **Add**

---

## ⚠️ Importante

- **NUNCA** commite o arquivo `.env` no Git
- As variáveis devem começar com `VITE_` para serem acessíveis no frontend
- Após adicionar/modificar variáveis, faça um novo deploy (Redeploy)

---

## 🔍 Verificar Configuração

Após o deploy, você pode verificar se as variáveis estão funcionando:

1. Abra o console do navegador na aplicação
2. Digite: `console.log(import.meta.env.VITE_SUPABASE_URL)`
3. Deve mostrar a URL do Supabase (não `undefined`)

---

## 📝 Arquivo .env Local

Para desenvolvimento local, crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Este arquivo já está no `.gitignore` e não será commitado.

# ✅ Checklist de Deploy - Ayra

## 📋 Preparação (Concluído ✅)

- [x] Criar arquivo `vercel.json` com configuração de SPA routing
- [x] Atualizar `.gitignore` para excluir arquivos sensíveis
- [x] Criar guia de deploy completo
- [x] Atualizar README com informações de deploy

---

## 🎯 Próximos Passos (Você precisa fazer)

### 1️⃣ Configurar Git e GitHub

- [ ] Inicializar repositório Git local
  ```bash
  git init
  git add .
  git commit -m "Initial commit - Ayra project"
  ```

- [ ] Criar repositório no GitHub
  - Acesse: https://github.com/new
  - Nome: `ayra`
  - Visibilidade: Private (recomendado)
  - NÃO inicialize com README

- [ ] Conectar repositório local ao GitHub
  ```bash
  git remote add origin https://github.com/SEU_USUARIO/ayra.git
  git branch -M main
  git push -u origin main
  ```

### 2️⃣ Deploy na Vercel

- [ ] Acessar [Vercel](https://vercel.com) e fazer login
- [ ] Clicar em "Add New..." → "Project"
- [ ] Importar repositório `ayra` do GitHub
- [ ] Verificar configurações:
  - Framework: Vite ✅
  - Build Command: `npm run build` ✅
  - Output Directory: `dist` ✅

### 3️⃣ Configurar Variáveis de Ambiente

- [ ] Adicionar `VITE_SUPABASE_URL`
  - Onde encontrar: Supabase → Settings → API → Project URL
  
- [ ] Adicionar `VITE_SUPABASE_ANON_KEY`
  - Onde encontrar: Supabase → Settings → API → Project API keys → anon/public

- [ ] Marcar para todos os ambientes (Production, Preview, Development)

### 4️⃣ Fazer Deploy

- [ ] Clicar em "Deploy"
- [ ] Aguardar build (~1-2 minutos)
- [ ] Testar a aplicação na URL fornecida

---

## 🎉 Pós-Deploy (Opcional)

- [ ] Configurar domínio personalizado
- [ ] Configurar proteção de branches no GitHub
- [ ] Configurar ambiente de staging
- [ ] Adicionar badge de deploy no README

---

## 📝 Notas Importantes

**Credenciais do Supabase:**
- URL: `https://[seu-projeto].supabase.co`
- Anon Key: `eyJ...` (chave longa)

**URL da aplicação após deploy:**
- Será algo como: `https://ayra-[hash].vercel.app`
- Você pode personalizar depois

**Deploy contínuo:**
- Após configurado, todo `git push` fará deploy automático! ✨

---

## 🆘 Precisa de Ajuda?

Veja o guia completo em: `.agent/workflows/deploy-vercel.md`

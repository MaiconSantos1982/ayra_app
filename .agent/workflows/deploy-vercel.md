---
description: Como fazer deploy do Ayra na Vercel usando GitHub
---

# 🚀 Deploy do Ayra na Vercel + GitHub

Este guia mostra como colocar o projeto Ayra em produção usando Vercel e GitHub.

## Pré-requisitos

- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Projeto Supabase configurado

---

## Passo 1: Inicializar Git e Criar Repositório no GitHub

### 1.1 Inicializar Git localmente

```bash
cd /Users/maiconsilvasantos/Downloads/Projetos/Ayra
git init
git add .
git commit -m "Initial commit - Ayra project"
```

### 1.2 Criar repositório no GitHub

1. Acesse [GitHub](https://github.com) e faça login
2. Clique no botão **"New"** (ou **"+"** → **"New repository"**)
3. Configure o repositório:
   - **Repository name**: `ayra`
   - **Description**: "Aplicação mobile-first de nutrição com IA"
   - **Visibility**: Private (recomendado) ou Public
   - **NÃO** marque "Initialize this repository with a README"
4. Clique em **"Create repository"**

### 1.3 Conectar repositório local ao GitHub

Copie os comandos que o GitHub mostra e execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/ayra.git
git branch -M main
git push -u origin main
```

> **Nota**: Substitua `SEU_USUARIO` pelo seu username do GitHub.

---

## Passo 2: Deploy na Vercel

### 2.1 Importar projeto do GitHub

1. Acesse [Vercel](https://vercel.com) e faça login (pode usar sua conta do GitHub)
2. Clique em **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Selecione o repositório **`ayra`** que você criou
5. Clique em **"Import"**

### 2.2 Configurar o projeto

A Vercel detectará automaticamente que é um projeto Vite. Verifique as configurações:

- **Framework Preset**: Vite
- **Root Directory**: `./` (raiz)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2.3 Configurar variáveis de ambiente

**IMPORTANTE**: Você precisa adicionar as variáveis de ambiente do Supabase:

1. Na página de configuração do projeto, role até **"Environment Variables"**
2. Adicione as seguintes variáveis:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Sua URL do Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Sua chave anônima do Supabase |

3. Para cada variável:
   - Cole o **Name**
   - Cole o **Value**
   - Selecione **"Production"**, **"Preview"** e **"Development"**
   - Clique em **"Add"**

> **Onde encontrar essas credenciais?**
> 1. Acesse seu projeto no [Supabase](https://supabase.com)
> 2. Vá em **Settings** → **API**
> 3. Copie a **URL** e a **anon/public key**

### 2.4 Fazer o deploy

1. Clique em **"Deploy"**
2. Aguarde o build (leva ~1-2 minutos)
3. Quando concluído, você verá uma tela de sucesso com confetes! 🎉

---

## Passo 3: Acessar sua aplicação

Após o deploy, a Vercel fornecerá:

- **URL de produção**: `https://ayra.vercel.app` (ou similar)
- **URL personalizada**: Você pode configurar um domínio próprio depois

Clique em **"Visit"** para ver sua aplicação rodando!

---

## Passo 4: Configurar domínio personalizado (Opcional)

Se você tiver um domínio próprio:

1. No dashboard do projeto na Vercel, vá em **"Settings"** → **"Domains"**
2. Clique em **"Add"**
3. Digite seu domínio (ex: `ayra.com.br`)
4. Siga as instruções para configurar os DNS

---

## 🔄 Fluxo de Trabalho Contínuo

Agora, sempre que você fizer alterações:

```bash
# 1. Faça suas alterações no código
# 2. Commit e push para o GitHub
git add .
git commit -m "Descrição das alterações"
git push

# 3. A Vercel fará deploy automático! ✨
```

A Vercel detecta automaticamente novos commits e faz o deploy.

---

## 🐛 Solução de Problemas

### Build falhou?

1. Verifique os logs de build na Vercel
2. Teste localmente: `npm run build`
3. Certifique-se de que todas as dependências estão no `package.json`

### Variáveis de ambiente não funcionam?

1. Verifique se os nomes começam com `VITE_`
2. Confirme que estão configuradas para "Production"
3. Faça um novo deploy: **"Deployments"** → **"..."** → **"Redeploy"**

### Rotas 404?

O arquivo `vercel.json` já está configurado para SPA routing. Se ainda tiver problemas, verifique se ele está no repositório.

---

## 📊 Monitoramento

Na Vercel você pode:

- Ver analytics de acesso
- Monitorar performance
- Ver logs de erro
- Configurar notificações

Acesse: **Dashboard do projeto** → **"Analytics"**

---

## 🎯 Próximos Passos

- [ ] Configurar domínio personalizado
- [ ] Configurar proteção de branches no GitHub
- [ ] Configurar ambientes de staging/preview
- [ ] Adicionar CI/CD com testes automatizados
- [ ] Configurar monitoramento de erros (Sentry)

---

## 📚 Recursos Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Vite](https://vitejs.dev)
- [Documentação Supabase](https://supabase.com/docs)

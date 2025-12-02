# Ayra - Nutrição Inteligente

Aplicação mobile-first de nutrição com IA, construída com React, TypeScript, Tailwind CSS e Supabase.

## 🚀 Tecnologias

- **Frontend**: Vite + React + TypeScript
- **Estilização**: Tailwind CSS (tema Dark Mode com Roxo Profundo e Verde Neon)
- **Backend**: Supabase (Autenticação e Database)
- **Roteamento**: React Router DOM
- **Ícones**: Lucide React

## 📦 Instalação

```bash
# Clone o repositório
cd Ayra

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais do Supabase
```

## 🔧 Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL do projeto e a chave anônima
4. Cole no arquivo `.env`:
   ```
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_aqui
   ```
5. Execute o script SQL em `schema.sql` no SQL Editor do Supabase

## 🎨 Features

### ✅ Autenticação
- Login/Registro com Supabase Auth
- Rotas protegidas
- Gerenciamento de sessão

### ✅ Dashboard
- Banner de alerta de alergias
- Card de consistência (streak)
- Resumo diário de macros com barras de progresso
- Gráfico premium (blur para usuários free)

### ✅ Registro de Refeições
- Formulário rápido com seletor de tipo de refeição
- Integração com Supabase
- Salvamento em `ayra_diario_header` e `ayra_diario_detalhes`

### ✅ Chat Assistant
- Interface de chat com Ayra (IA)
- Limite de mensagens para usuários free
- Mensagens contextuais baseadas no perfil

### ✅ Perfil
- Informações do usuário
- Status de assinatura
- Banner de upsell para Premium
- Logout

## 🏃‍♂️ Executar

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📱 Design

- **Mobile First**: Otimizado para smartphones
- **Dark Mode**: Tema escuro com Roxo Profundo (#120d1d)
- **Neon Green**: Cor de destaque (#39ff14)
- **Animações**: Transições suaves e micro-interações
- **Glassmorphism**: Efeitos de vidro fosco nos cards

## 🚀 Deploy

Para fazer deploy na Vercel:

```bash
# Use o workflow de deploy
# Veja o guia completo em: .agent/workflows/deploy-vercel.md
```

**Resumo rápido:**
1. Crie um repositório no GitHub
2. Faça push do código
3. Importe o projeto na Vercel
4. Configure as variáveis de ambiente (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
5. Deploy automático! ✨

## 📄 Licença

Projeto privado - Todos os direitos reservados


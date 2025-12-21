# 🚀 Ayra SaaS - Roadmap Completo

## 📋 Visão Geral

Transformar o Ayra de MVP local para SaaS completo com:
- ✅ Autenticação real com Supabase
- ✅ Sincronização de dados em nuvem
- ✅ PWA instalável (iOS e Android)
- ✅ Sistema de notificações
- ✅ Painel de administração
- ✅ Integração com IA (envio de dados)

---

## 🎯 FASE 1: Autenticação e Dados (CRÍTICO)

### 1.1 Sistema de Login com Email

**Objetivo:** Substituir login demo por autenticação real

**Tarefas:**

#### Backend (Supabase)
- [ ] **Verificar/Criar tabela `ayra_cadastro`**
  - Campos necessários:
    ```sql
    - id (uuid, primary key)
    - email (text, unique)
    - created_at (timestamp)
    - last_login (timestamp)
    - premium (boolean, default: false)
    - premium_expiry (timestamp, nullable)
    ```

- [ ] **Configurar Supabase Auth**
  - Habilitar Email Auth (sem senha ou com Magic Link)
  - Configurar templates de email
  - Configurar redirect URLs

#### Frontend
- [ ] **Atualizar `AuthPage.tsx`**
  - Remover login demo
  - Adicionar campo de email
  - Implementar `supabase.auth.signInWithOtp()` (Magic Link)
  - Adicionar loading states
  - Mensagens de feedback (Toast)

- [ ] **Atualizar `AuthContext.tsx`**
  - Gerenciar sessão real do Supabase
  - Sincronizar com `ayra_cadastro`
  - Manter estado de autenticação

**Estimativa:** 4-6 horas

---

### 1.2 Migração de localStorage para Supabase

**Objetivo:** Sincronizar todos os dados do usuário na nuvem

**Tarefas:**

#### Estrutura de Tabelas Supabase

```sql
-- Já existentes (verificar)
✅ ayra_cadastro (usuários)
✅ ayra_metas (metas nutricionais)
✅ ayra_diario_lifestyle (água, sono, exercício)

-- A CRIAR/VERIFICAR
□ ayra_perfil (dados pessoais)
  - id_usuario (uuid, FK)
  - nome (text)
  - idade (integer)
  - peso (decimal)
  - altura (decimal)
  - objetivo (text)
  - restricoes (text)
  - segue_dieta (boolean)
  - telefone (text)
  - acompanhamento_nutricional (text)

□ ayra_dieta_personalizada (refeições da dieta)
  - id (uuid, PK)
  - id_usuario (uuid, FK)
  - tipo (text) -- 'Café da manhã', 'Almoço', etc
  - horario (time)
  - descricao (text)
  - created_at (timestamp)

□ ayra_refeicoes (registro de refeições)
  - id (uuid, PK)
  - id_usuario (uuid, FK)
  - tipo (text)
  - descricao (text)
  - foto_url (text, nullable)
  - data_hora (timestamp)
  - created_at (timestamp)

□ ayra_fotos (armazenamento de fotos)
  - Usar Supabase Storage
  - Bucket: 'ayra-meal-photos'
  - Estrutura: {user_id}/{timestamp}.jpg
```

#### Migração de Código

- [ ] **Criar `src/lib/supabaseSync.ts`**
  - Funções para sync de dados
  - Estratégia de merge (local vs cloud)
  - Offline-first com sync posterior

- [ ] **Atualizar todas as páginas**
  - AnamnesePage → salvar em `ayra_perfil` + `ayra_dieta_personalizada`
  - MetasPage → já usa `ayra_metas` ✅
  - RegisterSimple → salvar em `ayra_refeicoes` + Storage
  - RegistroDiarioPage → já usa `ayra_diario_lifestyle` ✅

- [ ] **Implementar upload de fotos**
  - Converter base64 para Blob
  - Upload para Supabase Storage
  - Salvar URL pública no banco

**Estimativa:** 8-12 horas

---

## 🎯 FASE 2: Integração com IA (Envio de Dados)

### 2.1 Endpoint de Envio de Dados

**Objetivo:** Enviar dados do usuário para a Ayra IA processar

**Tarefas:**

#### Backend (Supabase Edge Function ou API externa)

- [ ] **Criar função para coletar dados do usuário**
  ```typescript
  interface AyraUserData {
    nome: string;
    idade?: number;
    peso?: number;
    altura?: number;
    objetivo?: string;
    restricoes?: string;
    dieta_personalizada?: Array<{
      tipo: string;
      horario: string;
      descricao: string;
    }>;
    metas?: {
      calorias: number;
      proteina: number;
      carboidrato: number;
      gordura: number;
    };
  }
  ```

- [ ] **Criar Edge Function `send-to-ai`**
  - Endpoint: `/functions/v1/send-to-ai`
  - Coletar dados do usuário
  - Formatar JSON
  - Enviar para API da IA
  - Retornar resposta

#### Frontend

- [ ] **Atualizar `Chat.tsx`**
  - Botão "Enviar Dados para Ayra"
  - Coletar dados do Supabase
  - Chamar Edge Function
  - Mostrar feedback (Toast)

**Estimativa:** 4-6 horas

---

## 🎯 FASE 3: PWA (Progressive Web App)

### 3.1 Configuração PWA

**Objetivo:** Tornar o app instalável em iOS e Android

**Tarefas:**

#### Arquivos de Configuração

- [ ] **Criar/Atualizar `manifest.json`**
  ```json
  {
    "name": "Ayra - Nutrição Inteligente",
    "short_name": "Ayra",
    "description": "Seu assistente de nutrição com IA",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0f0f23",
    "theme_color": "#00ff88",
    "orientation": "portrait",
    "icons": [
      {
        "src": "/icons/icon-72x72.png",
        "sizes": "72x72",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-96x96.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-128x128.png",
        "sizes": "128x128",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-144x144.png",
        "sizes": "144x144",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-152x152.png",
        "sizes": "152x152",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-384x384.png",
        "sizes": "384x384",
        "type": "image/png"
      },
      {
        "src": "/icons/icon-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }
  ```

- [ ] **Criar Service Worker (`sw.js`)**
  - Cache de assets estáticos
  - Offline fallback
  - Estratégia de cache (Network First para API, Cache First para assets)

- [ ] **Atualizar `index.html`**
  - Link para manifest
  - Meta tags para iOS
  - Theme color

#### Ícones do App

- [ ] **Criar ícones em todos os tamanhos**
  - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
  - Formato PNG com fundo
  - Design: Logo Ayra com fundo gradiente

- [ ] **Criar splash screens (iOS)**
  - Vários tamanhos para diferentes dispositivos
  - Usar ferramenta: https://appsco.pe/developer/splash-screens

**Estimativa:** 3-4 horas

---

### 3.2 Tela de Instalação PWA

**Objetivo:** Guiar usuário na instalação do app

**Tarefas:**

- [ ] **Criar `InstallPWA.tsx`**
  - Detectar se já está instalado
  - Detectar plataforma (iOS/Android/Desktop)
  - Mostrar instruções específicas
  - Botão de instalação rápida (Android/Desktop)

- [ ] **Instruções por Plataforma**

  **iOS:**
  ```
  1. Toque no ícone de compartilhar (quadrado com seta)
  2. Role para baixo e toque em "Adicionar à Tela de Início"
  3. Toque em "Adicionar"
  4. Pronto! O Ayra está instalado
  ```

  **Android:**
  ```
  1. Toque nos três pontos (⋮) no canto superior
  2. Toque em "Instalar app" ou "Adicionar à tela inicial"
  3. Toque em "Instalar"
  4. Pronto! O Ayra está instalado
  ```

- [ ] **Integrar na `AuthPage.tsx`**
  - Mostrar prompt de instalação após login
  - Opção "Instalar depois"
  - Salvar preferência (não mostrar novamente)

**Estimativa:** 2-3 horas

---

## 🎯 FASE 4: Sistema de Notificações

### 4.1 Notificações Push

**Objetivo:** Enviar lembretes e mensagens aos usuários

**Tarefas:**

#### Backend (Supabase)

- [ ] **Criar tabela `ayra_notificacoes`**
  ```sql
  - id (uuid, PK)
  - id_usuario (uuid, FK, nullable) -- null = broadcast
  - tipo (text) -- 'reminder', 'broadcast', 'achievement'
  - titulo (text)
  - mensagem (text)
  - enviada_em (timestamp)
  - lida (boolean, default: false)
  - data_agendamento (timestamp, nullable)
  ```

- [ ] **Criar tabela `ayra_push_tokens`**
  ```sql
  - id (uuid, PK)
  - id_usuario (uuid, FK)
  - token (text, unique)
  - plataforma (text) -- 'web', 'ios', 'android'
  - ativo (boolean, default: true)
  - created_at (timestamp)
  ```

- [ ] **Configurar Firebase Cloud Messaging (FCM)**
  - Criar projeto Firebase
  - Obter credenciais
  - Configurar no Supabase

- [ ] **Criar Edge Function `send-notification`**
  - Enviar notificação individual
  - Enviar broadcast (todos os usuários)
  - Agendar notificações

#### Frontend

- [ ] **Implementar Service Worker para Push**
  - Registrar service worker
  - Solicitar permissão de notificações
  - Salvar token no Supabase

- [ ] **Criar `NotificationManager.tsx`**
  - Solicitar permissão
  - Gerenciar tokens
  - Exibir notificações in-app

- [ ] **Lembretes Automáticos**
  - Beber água (a cada 2h)
  - Registrar refeições (horários da dieta)
  - Registrar peso semanal
  - Configuráveis pelo usuário

**Estimativa:** 8-10 horas

---

### 4.2 Painel de Admin (Super Admin)

**Objetivo:** Interface para enviar mensagens broadcast

**Tarefas:**

- [ ] **Criar tabela `ayra_admins`**
  ```sql
  - id (uuid, PK)
  - email (text, unique)
  - role (text) -- 'super_admin', 'admin'
  - created_at (timestamp)
  ```

- [ ] **Criar `AdminPage.tsx`**
  - Login de admin
  - Dashboard com estatísticas
  - Envio de notificações broadcast
  - Visualizar usuários
  - Gerenciar premium

- [ ] **Funcionalidades de Broadcast**
  - Título e mensagem
  - Preview
  - Envio imediato ou agendado
  - Filtros (apenas free, apenas premium, todos)

**Estimativa:** 6-8 horas

---

## 🎯 FASE 5: Melhorias e Polimento

### 5.1 Otimizações

- [ ] **Performance**
  - Lazy loading de componentes
  - Otimização de imagens
  - Code splitting

- [ ] **SEO**
  - Meta tags dinâmicas
  - Open Graph
  - Sitemap

- [ ] **Analytics**
  - Google Analytics ou Plausible
  - Tracking de eventos importantes

### 5.2 Testes

- [ ] **Testes de Integração**
  - Fluxo de login
  - Sincronização de dados
  - Notificações

- [ ] **Testes em Dispositivos**
  - iOS (Safari)
  - Android (Chrome)
  - Desktop

**Estimativa:** 4-6 horas

---

## 📊 Resumo de Estimativas

| Fase | Descrição | Horas | Prioridade |
|------|-----------|-------|------------|
| **FASE 1** | Autenticação e Dados | 12-18h | 🔴 CRÍTICA |
| **FASE 2** | Integração com IA | 4-6h | 🟡 ALTA |
| **FASE 3** | PWA | 5-7h | 🟡 ALTA |
| **FASE 4** | Notificações | 14-18h | 🟢 MÉDIA |
| **FASE 5** | Melhorias | 4-6h | 🟢 MÉDIA |
| **TOTAL** | | **39-55h** | |

---

## 🚦 Ordem de Implementação Recomendada

### Sprint 1 (Semana 1) - FUNDAÇÃO
1. ✅ Sistema de Login com Email (FASE 1.1)
2. ✅ Migração para Supabase (FASE 1.2)
3. ✅ Testes de autenticação

### Sprint 2 (Semana 2) - PWA
1. ✅ Configuração PWA (FASE 3.1)
2. ✅ Tela de Instalação (FASE 3.2)
3. ✅ Ícones e assets
4. ✅ Testes em dispositivos

### Sprint 3 (Semana 3) - IA
1. ✅ Integração com IA (FASE 2.1)
2. ✅ Testes de envio de dados

### Sprint 4 (Semana 4) - NOTIFICAÇÕES
1. ✅ Sistema de Notificações (FASE 4.1)
2. ✅ Painel de Admin (FASE 4.2)
3. ✅ Testes de notificações

### Sprint 5 (Semana 5) - POLIMENTO
1. ✅ Otimizações (FASE 5.1)
2. ✅ Testes finais (FASE 5.2)
3. ✅ Deploy em produção

---

## 🔧 Ferramentas e Serviços Necessários

### Já Configurados
- ✅ Supabase (Backend)
- ✅ Vite (Build)
- ✅ React Router (Navegação)
- ✅ Lucide Icons

### A Configurar
- [ ] Firebase Cloud Messaging (Notificações Push)
- [ ] Supabase Storage (Upload de fotos)
- [ ] Supabase Edge Functions (API serverless)
- [ ] PWA Builder (Geração de assets)
- [ ] Vercel/Netlify (Deploy)

---

## 📝 Checklist de Pré-Requisitos

### Supabase
- [ ] Projeto criado
- [ ] Auth configurado (Email)
- [ ] Tabelas criadas (ver estrutura acima)
- [ ] Storage bucket criado (`ayra-meal-photos`)
- [ ] RLS (Row Level Security) configurado
- [ ] Edge Functions habilitadas

### Firebase (para Push Notifications)
- [ ] Projeto criado
- [ ] FCM configurado
- [ ] Credenciais obtidas
- [ ] Service Account criado

### Design
- [ ] Logo do Ayra em alta resolução
- [ ] Ícones em todos os tamanhos
- [ ] Splash screens (iOS)
- [ ] Screenshots para stores (futuro)

### Domínio e Deploy
- [ ] Domínio registrado (ex: ayra.app)
- [ ] SSL configurado
- [ ] Deploy automatizado (CI/CD)

---

## 🎨 Considerações de Design

### Ícone do App
**Sugestões:**
1. Logo "A" estilizado com gradiente verde (#00ff88) para roxo (#9945ff)
2. Fundo escuro (#0f0f23) ou transparente
3. Bordas arredondadas (iOS style)
4. Versão simplificada para tamanhos pequenos

### Cores do Tema
- Primary: `#00ff88` (verde neon)
- Secondary: `#9945ff` (roxo)
- Background: `#0f0f23` (azul escuro)
- Card: `#1a1a2e` (cinza escuro)

---

## ⚠️ Pontos de Atenção

### Segurança
- [ ] Validar todos os inputs
- [ ] Sanitizar dados antes de salvar
- [ ] Implementar rate limiting
- [ ] Proteger rotas de admin
- [ ] Criptografar dados sensíveis

### Performance
- [ ] Otimizar queries do Supabase
- [ ] Implementar paginação
- [ ] Cache de dados frequentes
- [ ] Lazy loading de imagens

### UX
- [ ] Feedback visual em todas as ações
- [ ] Loading states
- [ ] Error handling
- [ ] Offline mode gracioso

---

## 📚 Documentação Necessária

- [ ] README atualizado
- [ ] Guia de instalação para desenvolvedores
- [ ] Documentação da API
- [ ] Guia do usuário
- [ ] FAQ

---

## 🎯 Métricas de Sucesso

### Técnicas
- [ ] Tempo de carregamento < 2s
- [ ] PWA score > 90 (Lighthouse)
- [ ] Uptime > 99.5%
- [ ] Taxa de erro < 1%

### Negócio
- [ ] Taxa de instalação PWA > 30%
- [ ] Retenção D7 > 40%
- [ ] Conversão Free → Premium > 5%
- [ ] NPS > 50

---

## 🚀 Próximos Passos Imediatos

1. **Revisar este roadmap** com a equipe
2. **Priorizar funcionalidades** (pode ajustar ordem)
3. **Configurar Supabase** (tabelas e auth)
4. **Começar FASE 1.1** (Login com email)

---

**Última atualização:** 2025-12-21
**Versão:** 1.0
**Status:** 📋 Planejamento

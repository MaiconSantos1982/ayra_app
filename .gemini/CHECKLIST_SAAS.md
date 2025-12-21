# ✅ Checklist Prático - Ayra SaaS

## 🎯 PRIORIDADE 1: AUTENTICAÇÃO (Começar AGORA)

### Supabase Setup
- [ ] Acessar dashboard do Supabase
- [ ] Verificar se tabela `ayra_cadastro` existe
- [ ] Se não existir, criar com SQL:
```sql
CREATE TABLE ayra_cadastro (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  premium BOOLEAN DEFAULT FALSE,
  premium_expiry TIMESTAMP
);
```
- [ ] Habilitar Email Auth em Authentication > Providers
- [ ] Configurar Email Templates (opcional, mas recomendado)
- [ ] Anotar as credenciais (já deve ter em `.env`)

### Código - Login
- [ ] Atualizar `AuthPage.tsx` para usar email real
- [ ] Remover botão "Login Demo"
- [ ] Adicionar campo de email
- [ ] Implementar Magic Link ou OTP
- [ ] Adicionar Toast para feedback
- [ ] Testar fluxo completo

**Tempo estimado:** 2-3 horas

---

## 🎯 PRIORIDADE 2: MIGRAÇÃO DE DADOS

### Criar Tabelas no Supabase
Execute este SQL no Supabase SQL Editor:

```sql
-- Perfil do usuário
CREATE TABLE ayra_perfil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  idade INTEGER,
  peso DECIMAL(5,2),
  altura DECIMAL(4,2),
  objetivo TEXT,
  restricoes TEXT,
  segue_dieta BOOLEAN DEFAULT FALSE,
  telefone TEXT,
  acompanhamento_nutricional TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_usuario)
);

-- Dieta personalizada
CREATE TABLE ayra_dieta_personalizada (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  horario TIME NOT NULL,
  descricao TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refeições registradas
CREATE TABLE ayra_refeicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  foto_url TEXT,
  data_hora TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ayra_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayra_dieta_personalizada ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayra_refeicoes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (usuário só vê seus dados)
CREATE POLICY "Users can view own profile" ON ayra_perfil
  FOR SELECT USING (auth.uid() = id_usuario);

CREATE POLICY "Users can insert own profile" ON ayra_perfil
  FOR INSERT WITH CHECK (auth.uid() = id_usuario);

CREATE POLICY "Users can update own profile" ON ayra_perfil
  FOR UPDATE USING (auth.uid() = id_usuario);

-- Repetir para outras tabelas...
```

### Código - Sincronização
- [ ] Criar `src/lib/supabaseSync.ts`
- [ ] Implementar funções de sync
- [ ] Atualizar `AnamnesePage.tsx` para salvar no Supabase
- [ ] Atualizar `RegisterSimple.tsx` para salvar no Supabase
- [ ] Testar sincronização

**Tempo estimado:** 6-8 horas

---

## 🎯 PRIORIDADE 3: PWA

### Ícones
- [ ] Criar logo do Ayra em alta resolução (1024x1024)
- [ ] Gerar ícones em todos os tamanhos usando: https://realfavicongenerator.net/
- [ ] Baixar e colocar em `/public/icons/`
- [ ] Verificar que tem todos os tamanhos:
  - icon-72x72.png
  - icon-96x96.png
  - icon-128x128.png
  - icon-144x144.png
  - icon-152x152.png
  - icon-192x192.png
  - icon-384x384.png
  - icon-512x512.png

### Manifest
- [ ] Criar `/public/manifest.json` (ver roadmap para template)
- [ ] Adicionar link no `index.html`:
```html
<link rel="manifest" href="/manifest.json">
```
- [ ] Adicionar meta tags para iOS no `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Ayra">
<link rel="apple-touch-icon" href="/icons/icon-192x192.png">
```

### Service Worker
- [ ] Instalar Vite PWA plugin:
```bash
npm install -D vite-plugin-pwa
```
- [ ] Configurar em `vite.config.ts`
- [ ] Testar instalação no Chrome (Desktop)
- [ ] Testar instalação no Safari (iOS)
- [ ] Testar instalação no Chrome (Android)

### Tela de Instalação
- [ ] Criar componente `InstallPWA.tsx`
- [ ] Adicionar na `AuthPage.tsx` (após login)
- [ ] Testar em diferentes dispositivos

**Tempo estimado:** 4-5 horas

---

## 🎯 PRIORIDADE 4: INTEGRAÇÃO COM IA

### Backend
- [ ] Decidir onde hospedar a IA (já tem endpoint?)
- [ ] Criar Edge Function no Supabase ou API externa
- [ ] Implementar coleta de dados do usuário
- [ ] Formatar JSON conforme especificação
- [ ] Testar envio

### Frontend
- [ ] Adicionar botão "Enviar Dados para Ayra" no Chat
- [ ] Implementar função de coleta de dados
- [ ] Chamar API/Edge Function
- [ ] Mostrar feedback (Toast)
- [ ] Testar fluxo completo

**Tempo estimado:** 3-4 horas

---

## 🎯 PRIORIDADE 5: NOTIFICAÇÕES

### Firebase Setup
- [ ] Criar projeto no Firebase Console
- [ ] Habilitar Cloud Messaging
- [ ] Baixar credenciais (service account JSON)
- [ ] Adicionar ao Supabase (se usar Edge Functions)

### Tabelas
```sql
CREATE TABLE ayra_notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  enviada_em TIMESTAMP DEFAULT NOW(),
  lida BOOLEAN DEFAULT FALSE,
  data_agendamento TIMESTAMP
);

CREATE TABLE ayra_push_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES ayra_cadastro(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  plataforma TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Código
- [ ] Implementar Service Worker para Push
- [ ] Solicitar permissão de notificações
- [ ] Salvar token no Supabase
- [ ] Criar sistema de lembretes (água, refeições)
- [ ] Testar notificações

**Tempo estimado:** 8-10 horas

---

## 🎯 PRIORIDADE 6: PAINEL ADMIN

### Tabelas
```sql
CREATE TABLE ayra_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir primeiro admin (VOCÊ)
INSERT INTO ayra_admins (email, role) 
VALUES ('seu-email@exemplo.com', 'super_admin');
```

### Código
- [ ] Criar rota `/admin`
- [ ] Criar `AdminPage.tsx`
- [ ] Implementar login de admin
- [ ] Dashboard com estatísticas
- [ ] Interface de envio de broadcast
- [ ] Testar envio de notificações

**Tempo estimado:** 6-8 horas

---

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Testar em produção local (`npm run build` + `npm run preview`)
- [ ] Verificar todas as variáveis de ambiente
- [ ] Testar PWA em dispositivos reais
- [ ] Verificar performance (Lighthouse)
- [ ] Testar fluxo completo (login → uso → logout)

### Deploy
- [ ] Escolher plataforma (Vercel/Netlify recomendado)
- [ ] Configurar variáveis de ambiente
- [ ] Configurar domínio (se tiver)
- [ ] Fazer deploy
- [ ] Testar em produção
- [ ] Configurar SSL (automático na Vercel/Netlify)

### Pós-Deploy
- [ ] Testar instalação PWA em produção
- [ ] Testar notificações em produção
- [ ] Monitorar erros (Sentry recomendado)
- [ ] Configurar analytics

---

## 🎨 Design - Ícone do App

### Opção 1: Usar IA para gerar
Prompt para DALL-E/Midjourney:
```
App icon for a nutrition AI assistant called "Ayra". 
Modern, minimalist design with:
- Letter "A" stylized
- Gradient from neon green (#00ff88) to purple (#9945ff)
- Dark background (#0f0f23)
- Rounded corners
- Professional and trustworthy feel
- 1024x1024px
```

### Opção 2: Contratar designer
- Fiverr: $20-50
- 99designs: $200-500
- Upwork: $50-200

### Opção 3: Fazer você mesmo
- Usar Figma (grátis)
- Usar Canva (grátis)
- Exportar em todos os tamanhos

---

## 📊 Ordem de Implementação Sugerida

### Semana 1 (CRÍTICO)
1. ✅ Login com email (PRIORIDADE 1)
2. ✅ Migração de dados (PRIORIDADE 2)
3. ✅ Testes básicos

### Semana 2 (IMPORTANTE)
1. ✅ PWA (PRIORIDADE 3)
2. ✅ Integração com IA (PRIORIDADE 4)
3. ✅ Testes em dispositivos

### Semana 3 (DESEJÁVEL)
1. ✅ Notificações (PRIORIDADE 5)
2. ✅ Painel Admin (PRIORIDADE 6)
3. ✅ Testes finais

### Semana 4 (POLIMENTO)
1. ✅ Otimizações
2. ✅ Deploy em produção
3. ✅ Monitoramento

---

## 🚨 Bloqueadores Potenciais

### Técnicos
- [ ] Credenciais do Supabase configuradas?
- [ ] Firebase configurado (para notificações)?
- [ ] Endpoint da IA disponível?
- [ ] Domínio registrado (opcional)?

### Design
- [ ] Logo/ícone do app pronto?
- [ ] Cores definidas?
- [ ] Screenshots para stores (futuro)?

### Negócio
- [ ] Modelo de monetização definido?
- [ ] Preço do premium definido?
- [ ] Termos de uso prontos?
- [ ] Política de privacidade pronta?

---

## 💡 Dicas Importantes

1. **Comece simples:** Implemente PRIORIDADE 1 e 2 primeiro. O resto pode esperar.

2. **Teste em dispositivos reais:** PWA se comporta diferente em iOS vs Android.

3. **Backup dos dados:** Antes de migrar para Supabase, faça backup do localStorage.

4. **Versionamento:** Use Git para cada feature implementada.

5. **Documentação:** Anote decisões importantes e problemas encontrados.

6. **Performance:** Otimize imagens e use lazy loading.

7. **Segurança:** NUNCA exponha credenciais no código. Use variáveis de ambiente.

---

## 📞 Precisa de Ajuda?

Quando estiver pronto para começar qualquer fase, me avise e eu:
1. Crio o código necessário
2. Explico cada parte
3. Ajudo a debugar problemas
4. Testo junto com você

**Próximo passo sugerido:** Começar com PRIORIDADE 1 (Login com email)?

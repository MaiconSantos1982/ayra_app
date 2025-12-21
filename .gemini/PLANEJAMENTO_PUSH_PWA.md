# 🔔 Planejamento: Sistema de Push Notifications

Para implementar notificações push que funcionem em Android, iOS (PWA) e Desktop, a estratégia recomendada é utilizar o **OneSignal**.

## Por que OneSignal?
- **Gratuito** para até 10k inscritos (suficiente para iniciar).
- **Compatibilidade:** Resolve a complexidade de Web Push no iOS (que exige passos específicos).
- **Dashboard Pronta:** Já vem com painel para disparos, mas permite disparar via API (para seu Admin).

---

## 🏗️ Arquitetura do Sistema

### 1. Front-end (Cliente)
- **Service Worker:** OneSignal fornece um worker pronto.
- **Permissão:** Solicitar permissão automaticamente ou via botão "Ativar Notificações".
- **Vínculo:** Associar o `OneSignal Player ID` ao `user_id` do Supabase para disparos individuais.

### 2. Back-end (Supabase + Admin)
- **Tabela `notifications`:** Histórico de disparos.
- **Disparo:** O Admin chama a API do OneSignal.
- **Segurança:** A API Key do OneSignal fica protegida (não exposta no front).

---

## 📋 Passo a Passo de Implementação

### Fase 1: Configuração OneSignal
1. [ ] Criar conta no OneSignal.
2. [ ] Configurar Web Push (gerar App ID).
3. [ ] Baixar arquivos do SDK (`OneSignalSDKWorker.js`) e colocar na pasta `public`.

### Fase 2: Integração React
1. [ ] Instalar `react-onesignal`.
2. [ ] Inicializar no `App.tsx` ou `AuthProvider`.
3. [ ] Criar lógica para salvar o `subscription_id` na tabela de usuários do Supabase.

### Fase 3: Página Admin de Disparos
1. [ ] Criar página `/admin/push`.
2. [ ] Formulário: Título, Mensagem, Link, Segmento (Todos ou Usuário Específico).
3. [ ] Integração: Botão dispara requisição para API OneSignal.

---

## 📱 Sobre a Instalação PWA (Item 1 do pedido)

Enquanto você avalia o plano acima, vou prosseguir com a implementação do **Popup de Instalação PWA**, que não depende de serviço externo.

### Estratégia PWA Install:
1. **Componente `InstallPrompt`:**
   - **Android/Chrome:** Botão "Instalar App" (usa evento nativo).
   - **iOS:** Instruções animadas ("Toque em Compartilhar -> Adicionar à Tela de Início").
2. **Lógica de Exibição:**
   - Aparece após 10s no primeiro acesso.
   - Não aparece se já estiver instalado (modo `display-mode: standalone`).
   - Botão fixo no Perfil/Configurações.

---

**Posso começar implementando o Popup de Instalação PWA agora?**
E sobre as notificações, concorda em usar o OneSignal? (É o padrão da indústria para React PWAs).

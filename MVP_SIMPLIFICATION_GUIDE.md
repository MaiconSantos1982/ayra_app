# 🚀 Guia de Simplificação - Ayra MVP

## 📋 Resumo das Mudanças

Este documento descreve a simplificação do Ayra para um **MVP mobile-first** pronto para lançamento rápido.

---

## 🎯 Arquitetura Simplificada

### **Dados Locais (localStorage)**
✅ Armazenados no dispositivo do usuário:
- Perfil (nome, idade, peso, altura)
- Metas nutricionais
- Registros de refeições (com fotos)
- Água, sono, exercício, humor
- Histórico de progresso
- Streak (dias consecutivos)

### **Dados no Supabase**
✅ Apenas o essencial:
- Autenticação (email/telefone)
- Nome e plano (free/premium)
- Pontuação para ranking
- Histórico de chat (memória da IA)

---

## 📁 Arquivos Criados

### 1. **`src/lib/localStorage.ts`**
Sistema completo de gerenciamento de dados locais com:
- Funções para salvar/carregar dados
- Cálculo automático de streak
- Export/import de dados (backup)
- Histórico de peso
- Estatísticas gerais

### 2. **`schema_simplified.sql`**
Schema simplificado do Supabase com apenas 2 tabelas:
- `ayra_users` - Perfil + plano + pontuação
- `ayra_chat_history` - Memória da IA

### 3. **`src/pages/DashboardSimple.tsx`**
Dashboard otimizado para mobile:
- Visualização rápida do dia
- Cards de hábitos (água, exercício, sono, humor)
- Últimas refeições
- Streak e estatísticas
- Acesso rápido ao registro

### 4. **`src/pages/RegisterSimple.tsx`**
Registro de refeição simplificado:
- Seleção visual do tipo de refeição
- Captura de foto (opcional)
- Descrição rápida
- Salvamento local instantâneo

### 5. **`src/pages/OnboardingSimple.tsx`**
Onboarding com apenas 3 perguntas:
- Nome
- Objetivo
- Restrições alimentares (opcional)

---

## 🔧 Próximos Passos para Implementação

### **Passo 1: Atualizar Supabase**
```bash
# 1. Acesse o Supabase Dashboard
# 2. Vá em SQL Editor
# 3. Execute o arquivo: schema_simplified.sql
```

### **Passo 2: Atualizar Rotas (App.tsx)**
Substituir rotas complexas pelas simplificadas:

```typescript
// Antes (complexo)
<Route path="inicio" element={<Dashboard />} />
<Route path="registro" element={<Register />} />
<Route path="perfil/dados-pessoais" element={<AnamnesePage />} />

// Depois (simplificado)
<Route path="inicio" element={<DashboardSimple />} />
<Route path="registro" element={<RegisterSimple />} />
<Route path="onboarding" element={<OnboardingSimple />} />
```

### **Passo 3: Atualizar AuthContext**
Modificar para verificar se usuário completou onboarding:

```typescript
// Após login, verificar se tem dados locais
const userData = getUserData();
if (!userData) {
  navigate('/onboarding');
} else {
  navigate('/inicio');
}
```

### **Passo 4: Remover Páginas Complexas (Opcional)**
Para o MVP, você pode remover/ocultar:
- ❌ `AnamnesePage.tsx` (substituído por OnboardingSimple)
- ❌ `MetasPage.tsx` (metas fixas por enquanto)
- ❌ `ProgressPage.tsx` (implementar depois)
- ❌ `AchievementsPage.tsx` (implementar depois)
- ❌ `RankingPage.tsx` (implementar depois)
- ❌ `AdminDashboard.tsx` (implementar depois)
- ❌ `CheckoutPage.tsx` (implementar depois)
- ❌ `RegistroDiarioPage.tsx` (substituído por RegisterSimple)

**Manter apenas:**
- ✅ `DashboardSimple.tsx`
- ✅ `RegisterSimple.tsx`
- ✅ `OnboardingSimple.tsx`
- ✅ `Chat.tsx` (simplificar depois)
- ✅ `Profile.tsx` (simplificar depois)
- ✅ `AuthPage.tsx`

---

## 🎨 Melhorias de UI/UX Mobile

### **Já Implementadas:**
✅ Design mobile-first em todas as páginas novas
✅ Botões grandes e fáceis de tocar
✅ Gradientes e cores vibrantes
✅ Feedback visual imediato
✅ Navegação simplificada
✅ Cards com informações claras

### **Recomendações Adicionais:**
1. **Adicionar PWA** (Progressive Web App)
   - Permitir instalação no celular
   - Funcionar offline
   - Ícone na tela inicial

2. **Otimizar Imagens**
   - Comprimir fotos antes de salvar
   - Limitar tamanho máximo

3. **Adicionar Haptic Feedback**
   - Vibração ao completar ações
   - Feedback tátil em botões importantes

4. **Melhorar Performance**
   - Lazy loading de imagens
   - Virtualização de listas longas

---

## 📊 Sistema de Pontuação (Gamificação)

### **Pontos por Ação:**
- 📝 Registrar refeição: **+10 pontos**
- 💧 Completar meta de água: **+5 pontos**
- 🏃 Fazer exercício: **+15 pontos**
- 😴 Dormir bem (meta atingida): **+10 pontos**
- 🔥 Streak de 7 dias: **+50 pontos**
- 🔥 Streak de 30 dias: **+200 pontos**

### **Níveis:**
- Nível = Pontuação / 100
- Exemplo: 250 pontos = Nível 2

### **Implementação:**
```typescript
// Ao registrar refeição
import { supabase } from './lib/supabase';

async function addPoints(points: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await supabase.rpc('update_user_score', {
    user_id: user.id,
    points_to_add: points
  });
}

// Exemplo de uso
addMeal({ tipo: 'Almoço', descricao: 'Arroz e feijão' });
addPoints(10); // +10 pontos por registrar refeição
```

---

## 🔐 Autenticação Simplificada

### **Opções de Login:**
1. **Email + Senha** (já implementado)
2. **Magic Link** (email sem senha)
3. **Telefone + OTP** (SMS)

### **Recomendação para MVP:**
Usar apenas **Email + Magic Link** (mais simples):

```typescript
// Login sem senha
const { error } = await supabase.auth.signInWithOtp({
  email: 'usuario@email.com',
  options: {
    emailRedirectTo: 'https://seu-app.com/inicio'
  }
});
```

---

## 💾 Backup e Exportação de Dados

### **Já Implementado:**
- ✅ Backup automático no localStorage
- ✅ Função de exportar dados (JSON)
- ✅ Função de importar dados

### **Como Usar:**
```typescript
import { exportData, importData } from './lib/localStorage';

// Exportar dados
const jsonData = exportData();
// Criar download do arquivo
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'ayra-backup.json';
a.click();

// Importar dados
const success = importData(jsonString);
if (success) {
  alert('Dados importados com sucesso!');
}
```

---

## 🚀 Checklist de Lançamento do MVP

### **Backend (Supabase):**
- [ ] Executar `schema_simplified.sql`
- [ ] Configurar autenticação por email
- [ ] Testar criação de usuário
- [ ] Testar salvamento de chat

### **Frontend:**
- [ ] Atualizar rotas no `App.tsx`
- [ ] Atualizar `AuthContext` para usar localStorage
- [ ] Testar fluxo completo:
  - [ ] Login
  - [ ] Onboarding
  - [ ] Dashboard
  - [ ] Registro de refeição
  - [ ] Chat
  - [ ] Perfil
- [ ] Testar em dispositivos móveis reais

### **Deploy:**
- [ ] Build de produção (`npm run build`)
- [ ] Deploy na Vercel
- [ ] Configurar variáveis de ambiente
- [ ] Testar app em produção

### **Testes:**
- [ ] Testar offline (dados locais)
- [ ] Testar export/import de dados
- [ ] Testar em diferentes navegadores mobile
- [ ] Testar em diferentes tamanhos de tela

---

## 📱 Funcionalidades do MVP

### **✅ Implementadas:**
1. Login/Registro
2. Onboarding simplificado
3. Dashboard com visão do dia
4. Registro rápido de refeições
5. Armazenamento local de dados
6. Sistema de streak
7. Chat com IA (já existente)

### **🔜 Para Próximas Versões:**
1. Ranking global
2. Gráficos de progresso
3. Sistema de conquistas
4. Plano premium
5. Notificações push
6. Compartilhamento social
7. Receitas personalizadas
8. Análise nutricional automática (IA)

---

## 🎯 Métricas para Acompanhar

### **Engajamento:**
- DAU (Daily Active Users)
- Refeições registradas por dia
- Streak médio dos usuários
- Taxa de retenção (D1, D7, D30)

### **Conversão:**
- Taxa de conclusão do onboarding
- Usuários que registram primeira refeição
- Usuários que voltam no dia seguinte

### **Técnicas:**
- Tempo de carregamento
- Taxa de erro
- Uso de armazenamento local

---

## 💡 Dicas de Lançamento

1. **Comece pequeno**: Lance para um grupo de teste primeiro
2. **Colete feedback**: Use ferramentas como Hotjar ou Google Analytics
3. **Itere rápido**: Faça melhorias semanais
4. **Monitore erros**: Use Sentry ou similar
5. **Comunique-se**: Mantenha usuários informados sobre novidades

---

## 📞 Suporte

Se precisar de ajuda com a implementação:
1. Revise este guia
2. Consulte a documentação do Supabase
3. Teste em ambiente local primeiro
4. Use o console do navegador para debug

---

**Boa sorte com o lançamento do Ayra! 🚀**

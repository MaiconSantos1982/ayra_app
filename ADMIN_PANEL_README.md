# Painel Administrativo - Ayra

## 📊 Visão Geral

O painel administrativo fornece uma visão completa das métricas e KPIs do negócio, incluindo:

- **Métricas de Usuários**: Total de usuários, freemium vs premium, novos cadastros
- **Assinaturas**: Status, MRR (Monthly Recurring Revenue), ticket médio
- **Conversões**: Taxa de conversão, tempo médio para converter
- **Churn**: Taxa de cancelamento, retenção
- **LTV**: Lifetime Value médio dos clientes
- **Receita**: Histórico diário de receita e assinaturas

## 🚀 Como Acessar

1. Faça login na aplicação
2. Vá para o menu **Perfil**
3. Clique em **Painel Admin** (botão com ícone de escudo roxo)
4. Você será redirecionado para `/admin`

## 🗄️ Configuração do Banco de Dados

### 1. Executar o Schema Admin

Execute o arquivo `schema_admin.sql` no seu banco de dados Supabase:

```sql
-- Execute todo o conteúdo do arquivo schema_admin.sql
```

Este arquivo cria:
- Tabelas de assinaturas, conversões, churn, atividade e receita
- Funções auxiliares para cálculo de métricas
- Políticas RLS (Row Level Security)
- View `admin_users_overview` para facilitar consultas

### 2. Tabelas Criadas

#### `ayra_subscriptions`
Armazena informações sobre assinaturas dos usuários:
- Status (active, canceled, pending, expired)
- Datas de início e fim
- Valores pagos
- Informações do provedor de pagamento (Stripe, MercadoPago, etc)

#### `ayra_conversion_events`
Registra eventos de conversão (free → premium):
- Data da conversão
- Tempo que levou para converter (em dias)
- Fonte da conversão
- Valor da assinatura

#### `ayra_churn_events`
Registra cancelamentos:
- Data do cancelamento
- Duração da assinatura
- Receita total gerada
- Motivo do cancelamento

#### `ayra_user_activity`
Rastreia atividade diária dos usuários:
- Logins
- Mensagens enviadas
- Refeições registradas
- Tempo de sessão
- Features utilizadas

#### `ayra_daily_revenue`
Agregação diária de receita:
- Receita total do dia
- Novas assinaturas
- Cancelamentos
- MRR

### 3. Funções Disponíveis

O schema inclui funções SQL para facilitar cálculos:

```sql
-- Tempo médio de conversão (em dias)
SELECT calculate_avg_conversion_time();

-- Taxa de conversão (%)
SELECT calculate_conversion_rate();

-- Churn rate mensal (%)
SELECT calculate_monthly_churn_rate();

-- LTV médio
SELECT calculate_average_ltv();

-- MRR atual
SELECT calculate_current_mrr();
```

## 📈 Métricas Disponíveis

### Visão Geral
- Total de usuários
- Usuários premium vs freemium
- MRR (Monthly Recurring Revenue)
- Taxa de conversão
- Distribuição de planos
- Métricas de retenção

### Usuários
- Lista de usuários recentes
- Informações de cadastro
- Status do plano
- Data de criação

### Receita
- MRR atual
- Assinaturas ativas
- Ticket médio
- Histórico de receita dos últimos 30 dias

### Conversões
- Taxa de conversão
- Tempo médio para converter
- Total de conversões
- Conversões do mês
- Insights detalhados

## 🔒 Segurança

### Políticas RLS

As tabelas administrativas têm políticas RLS configuradas:

- Usuários normais podem ver apenas suas próprias assinaturas e atividades
- Dados de conversão, churn e receita são bloqueados por padrão
- **Importante**: Você precisa criar uma função para verificar se o usuário é admin

### Implementar Verificação de Admin

Para restringir o acesso ao painel admin, você pode:

1. **Adicionar campo `is_admin` na tabela `ayra_cadastro`**:
```sql
ALTER TABLE ayra_cadastro ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

2. **Criar função de verificação**:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM ayra_cadastro 
        WHERE id_usuario = auth.uid() 
        AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Atualizar políticas RLS**:
```sql
-- Exemplo para ayra_conversion_events
DROP POLICY IF EXISTS "Only admins can view conversion events" ON ayra_conversion_events;
CREATE POLICY "Only admins can view conversion events" 
ON ayra_conversion_events FOR SELECT 
USING (is_admin());
```

4. **Atualizar o componente AdminDashboard.tsx**:
```tsx
// No início do componente
const { profile } = useAuth();

// Verificar se é admin
if (!profile?.is_admin) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-danger mb-2">Acesso Negado</h1>
                <p className="text-text-secondary">Você não tem permissão para acessar esta página.</p>
            </div>
        </div>
    );
}
```

## 📊 Como Registrar Eventos

### Registrar Conversão

Quando um usuário se torna premium:

```typescript
// Ao processar pagamento bem-sucedido
const { data: cadastro } = await supabase
    .from('ayra_cadastro')
    .select('created_at')
    .eq('id_usuario', userId)
    .single();

const daysToConvert = Math.floor(
    (new Date().getTime() - new Date(cadastro.created_at).getTime()) / (1000 * 60 * 60 * 24)
);

await supabase.from('ayra_conversion_events').insert({
    id_usuario: userId,
    days_to_convert: daysToConvert,
    conversion_source: 'checkout_page',
    subscription_value: amount
});
```

### Registrar Assinatura

```typescript
await supabase.from('ayra_subscriptions').insert({
    id_usuario: userId,
    status: 'active',
    subscription_start: new Date().toISOString(),
    subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan_type: 'monthly',
    amount_paid: 29.90,
    payment_provider: 'stripe',
    payment_id: stripePaymentId,
    customer_id: stripeCustomerId
});
```

### Registrar Churn

Quando um usuário cancela:

```typescript
const { data: subscription } = await supabase
    .from('ayra_subscriptions')
    .select('*')
    .eq('id_usuario', userId)
    .eq('status', 'active')
    .single();

const durationDays = Math.floor(
    (new Date().getTime() - new Date(subscription.subscription_start).getTime()) / (1000 * 60 * 60 * 24)
);

await supabase.from('ayra_churn_events').insert({
    id_usuario: userId,
    id_subscription: subscription.id,
    subscription_duration_days: durationDays,
    total_revenue: subscription.amount_paid, // ou calcular total se houver múltiplos pagamentos
    churn_reason: 'price', // ou outro motivo
    churn_feedback: 'Feedback do usuário'
});

// Atualizar status da assinatura
await supabase
    .from('ayra_subscriptions')
    .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
    })
    .eq('id', subscription.id);
```

### Registrar Atividade Diária

```typescript
// Ao fazer login ou realizar ações
await supabase
    .from('ayra_user_activity')
    .upsert({
        id_usuario: userId,
        activity_date: new Date().toISOString().split('T')[0],
        login_count: 1,
        messages_sent: 0,
        meals_logged: 0,
        features_used: ['dashboard']
    }, {
        onConflict: 'id_usuario,activity_date',
        ignoreDuplicates: false
    });
```

## 🎨 Personalização

### Adicionar Novas Métricas

1. Adicione o tipo em `src/types/admin.types.ts`
2. Crie a função de carregamento em `AdminDashboard.tsx`
3. Adicione o card de métrica no render

### Adicionar Novas Abas

```tsx
// Em AdminDashboard.tsx
const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'conversions' | 'nova_aba'>('overview');

// Adicionar no array de tabs
{ id: 'nova_aba', label: 'Nova Aba', icon: IconeDoLucide }

// Adicionar o conteúdo
{activeTab === 'nova_aba' && (
    <div className="space-y-6">
        {/* Conteúdo da nova aba */}
    </div>
)}
```

## 🐛 Troubleshooting

### Erro: "relation does not exist"
Execute o `schema_admin.sql` no Supabase.

### Erro: "permission denied for table"
Verifique as políticas RLS e certifique-se de que o usuário tem permissão.

### Métricas aparecem zeradas
Verifique se há dados nas tabelas. Você pode precisar popular dados de teste inicialmente.

### Erro ao chamar funções SQL
Certifique-se de que as funções foram criadas corretamente:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 📝 Próximos Passos

1. **Implementar autenticação de admin** (campo `is_admin`)
2. **Integrar com provedor de pagamento** (Stripe/MercadoPago)
3. **Criar triggers** para atualizar `ayra_daily_revenue` automaticamente
4. **Adicionar gráficos** usando bibliotecas como Recharts ou Chart.js
5. **Exportar relatórios** em CSV/PDF
6. **Notificações** para eventos importantes (churn alto, conversões, etc)

## 🤝 Suporte

Para dúvidas ou problemas, consulte a documentação do Supabase ou entre em contato com o time de desenvolvimento.

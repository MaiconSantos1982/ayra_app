# 📋 MAPEAMENTO SUPABASE ↔ LOCALSTORAGE

## 🗄️ Tabela: `ayra_cadastro`

### Colunas no Supabase:

```sql
CREATE TABLE ayra_cadastro (
  id BIGINT PRIMARY KEY,
  nome TEXT,
  email TEXT,
  plano TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  -- Dados Pessoais
  telefone TEXT,
  idade NUMERIC,
  peso NUMERIC,
  altura NUMERIC,
  
  -- Objetivos e Restrições
  objetivo TEXT,
  restricoes TEXT,
  problemas_de_saude TEXT,
  dificuldade TEXT,
  tem_nutri_ou_dieta TEXT,
  info_extra TEXT,
  
  -- Controle
  cadastro_completo TEXT,
  id_usuario TEXT
);
```

---

## 🔄 Função: `syncUserDataFromSupabase()`

**Arquivo:** `src/lib/supabaseAuth.ts` (linhas 234-270)

### ❌ Campos Atualmente Sincronizados:

```typescript
if (data.nome) profileUpdates.nome = data.nome;
if (data.idade) profileUpdates.idade = data.idade.toString();
if (data.objetivo) profileUpdates.objetivo = data.objetivo;
if (data.restricoes) profileUpdates.restricoes = data.restricoes;
if (data.peso) profileUpdates.peso = data.peso;
if (data.altura) profileUpdates.altura = data.altura;
```

### ❌ Campos FALTANDO:

```typescript
// ❌ NÃO ESTÁ SENDO SINCRONIZADO:
if (data.telefone) profileUpdates.telefone = data.telefone;
if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
if (data.info_extra) profileUpdates.info_extra = data.info_extra;
```

---

## 📊 Tabela de Mapeamento

| Campo Supabase | Campo localStorage | Tipo | Status Atual |
|----------------|-------------------|------|--------------|
| `nome` | `profile.nome` | string | ✅ Sincronizado |
| `idade` | `profile.idade` | string | ✅ Sincronizado |
| `objetivo` | `profile.objetivo` | string | ✅ Sincronizado |
| `restricoes` | `profile.restricoes` | string | ✅ Sincronizado |
| `peso` | `profile.peso` | number | ✅ Sincronizado |
| `altura` | `profile.altura` | number | ✅ Sincronizado |
| `telefone` | `profile.telefone` | string | ❌ **FALTANDO** |
| `problemas_de_saude` | `profile.problemas_de_saude` | string | ❌ **FALTANDO** |
| `dificuldade` | `profile.dificuldade` | string | ❌ **FALTANDO** |
| `tem_nutri_ou_dieta` | `profile.tem_nutri_ou_dieta` | string | ❌ **FALTANDO** |
| `info_extra` | `profile.info_extra` | string | ❌ **FALTANDO** |

---

## ✅ Código Correto (Completo)

```typescript
export async function syncUserDataFromSupabase(userId: number): Promise<void> {
    try {
        const { data, error } = await supabase
            .from('ayra_cadastro')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Erro ao sincronizar dados:', error);
            return;
        }

        if (data) {
            const { updateProfile } = await import('./localStorage');

            const profileUpdates: any = {};

            // ✅ Dados Básicos
            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            
            // ✅ Medidas
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
            
            // ✅ Objetivos e Restrições
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            
            // ✅ Dados Adicionais (FALTAVAM!)
            if (data.telefone) profileUpdates.telefone = data.telefone;
            if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
            if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
            if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
            if (data.info_extra) profileUpdates.info_extra = data.info_extra;

            if (Object.keys(profileUpdates).length > 0) {
                updateProfile(profileUpdates);
                console.log('Dados sincronizados do Supabase com sucesso!');
            }
        }
    } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
    }
}
```

---

## 🔍 Como Verificar no Supabase

### 1. Abra o Supabase Dashboard
```
https://supabase.com/dashboard
```

### 2. Vá em "Table Editor"
```
Selecione: ayra_cadastro
```

### 3. Procure seu usuário (id = 1)
```
Verifique os valores de:
- telefone
- problemas_de_saude
- dificuldade
- tem_nutri_ou_dieta
- info_extra
```

---

## 🧪 Teste de Sincronização

### Antes da Correção:
```
Supabase:
- telefone: "(11) 99999-9999"
- dificuldade: "Rotina corrida"
- problemas_de_saude: "Não"

localStorage (após login):
- telefone: undefined ❌
- dificuldade: undefined ❌
- problemas_de_saude: undefined ❌
```

### Depois da Correção:
```
Supabase:
- telefone: "(11) 99999-9999"
- dificuldade: "Rotina corrida"
- problemas_de_saude: "Não"

localStorage (após login):
- telefone: "(11) 99999-9999" ✅
- dificuldade: "Rotina corrida" ✅
- problemas_de_saude: "Não" ✅
```

---

## 📝 Arquivo a Ser Corrigido

**Caminho:** `src/lib/supabaseAuth.ts`

**Linhas:** 254-259

**Adicionar após linha 259:**
```typescript
if (data.telefone) profileUpdates.telefone = data.telefone;
if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
if (data.info_extra) profileUpdates.info_extra = data.info_extra;
```

---

**Mapeamento completo documentado! 📋**

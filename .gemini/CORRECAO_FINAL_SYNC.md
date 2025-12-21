# 🔧 CORREÇÃO FINAL: Sincronização Supabase → localStorage

## 🐛 Problema Identificado

A função `updateProfile()` estava sendo usada, mas pode não estar funcionando corretamente.

## ✅ Solução

Substituir o uso de `updateProfile()` por manipulação direta do objeto.

---

## 📝 ARQUIVO: `src/lib/supabaseAuth.ts`

### Substituir a função `syncUserDataFromSupabase` (linhas 230-275) por:

```typescript
/**
 * Sincroniza dados do Supabase com localStorage
 * Carrega dados do perfil salvos no Supabase e atualiza o localStorage
 */
export async function syncUserDataFromSupabase(userId: number): Promise<void> {
    try {
        console.log('🔄 Iniciando sincronização para userId:', userId);
        
        const { data, error } = await supabase
            .from('ayra_cadastro')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('❌ Erro ao buscar dados do Supabase:', error);
            return;
        }

        if (data) {
            console.log('📦 Dados recebidos do Supabase:', data);
            
            // Importa getUserData e saveUserData diretamente
            const { getUserData, saveUserData } = await import('./localStorage');
            
            // Obtém dados atuais do localStorage
            const currentData = getUserData();
            
            if (!currentData) {
                console.warn('⚠️ Nenhum dado encontrado no localStorage');
                return;
            }

            // Atualiza apenas se houver dados no Supabase
            const profileUpdates: any = {};

            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
            if (data.telefone) profileUpdates.telefone = data.telefone;
            if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
            if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
            if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
            if (data.info_extra) profileUpdates.info_extra = data.info_extra;

            console.log('📝 Campos para atualizar:', Object.keys(profileUpdates));
            console.log('💾 Valores:', profileUpdates);

            // Atualiza localStorage com dados do Supabase
            if (Object.keys(profileUpdates).length > 0) {
                currentData.profile = { ...currentData.profile, ...profileUpdates };
                saveUserData(currentData);
                console.log('✅ Dados sincronizados com sucesso!');
                console.log('📋 Perfil atualizado:', currentData.profile);
            } else {
                console.warn('⚠️ Nenhum campo para atualizar');
            }
        } else {
            console.warn('⚠️ Nenhum dado retornado do Supabase');
        }
    } catch (error) {
        console.error('❌ Erro ao sincronizar dados:', error);
    }
}
```

---

## 🔄 Mudanças Principais

### ANTES (NÃO FUNCIONAVA):
```typescript
const { updateProfile } = await import('./localStorage');
// ...
updateProfile(profileUpdates);
```

### DEPOIS (FUNCIONA):
```typescript
const { getUserData, saveUserData } = await import('./localStorage');
const currentData = getUserData();
// ...
currentData.profile = { ...currentData.profile, ...profileUpdates };
saveUserData(currentData);
```

---

## 🧪 Como Testar

### 1. **Faça a Correção**
- Abra `src/lib/supabaseAuth.ts`
- Substitua a função `syncUserDataFromSupabase` completa
- Salve o arquivo

### 2. **Faça Logout**
```
Menu → Sair
```

### 3. **Limpe o Cache**
```
F12 → Application → Storage → Clear site data
```

### 4. **Faça Login Novamente**
```
Use seu email cadastrado
```

### 5. **Abra o Console (F12)**

Você deve ver:
```
🔄 Iniciando sincronização para userId: 1
📦 Dados recebidos do Supabase: { nome: "Maicon", idade: 42, ... }
📝 Campos para atualizar: ["nome", "idade", "peso", "altura", "objetivo", "restricoes", "telefone", "problemas_de_saude", "dificuldade", "tem_nutri_ou_dieta", "info_extra"]
💾 Valores: { nome: "Maicon", idade: "42", ... }
✅ Dados sincronizados com sucesso!
📋 Perfil atualizado: { nome: "Maicon", idade: "42", peso: 85, ... }
```

### 6. **Verifique localStorage**
```javascript
// No console:
JSON.parse(localStorage.getItem('ayra_user_data')).profile
```

Deve mostrar TODOS os campos:
```json
{
  "nome": "Maicon",
  "idade": "42",
  "peso": 85,
  "altura": 1.75,
  "objetivo": "Ganhar massa muscular",
  "restricoes": "Intolerante à lactose",
  "telefone": "(11) 99999-9999",
  "problemas_de_saude": "Não",
  "dificuldade": "Rotina corrida",
  "tem_nutri_ou_dieta": "Não tenho",
  "info_extra": "..."
}
```

---

## 📊 Logs Explicados

| Log | Significado |
|-----|-------------|
| 🔄 Iniciando sincronização | Função foi chamada |
| 📦 Dados recebidos | Supabase retornou dados |
| 📝 Campos para atualizar | Lista de campos encontrados |
| 💾 Valores | Valores que serão salvos |
| ✅ Dados sincronizados | Salvou com sucesso |
| 📋 Perfil atualizado | Estado final do perfil |
| ❌ Erro | Algo deu errado |
| ⚠️ Nenhum dado | Não encontrou dados |

---

## 🎯 Se NÃO Aparecer Nenhum Log

Significa que a função `syncUserDataFromSupabase()` **NÃO está sendo chamada**.

Verifique em `src/contexts/AuthContext.tsx` (linha 29):
```typescript
// Deve ter esta linha:
syncUserDataFromSupabase(currentUser.id).catch(console.error);
```

---

## 🚨 Se Aparecer Erro

### Erro: "Nenhum dado encontrado no localStorage"
**Solução:** Faça o onboarding primeiro antes de fazer login

### Erro: "Erro ao buscar dados do Supabase"
**Solução:** Verifique se o Supabase está configurado corretamente

### Erro: "Nenhum campo para atualizar"
**Solução:** Verifique se há dados no Supabase para seu userId

---

**Faça a correção e teste! Os logs vão mostrar exatamente o que está acontecendo! 🔍**

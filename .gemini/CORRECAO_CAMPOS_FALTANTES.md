# 🔧 CORREÇÃO: Adicionar Campos Faltantes

## 📍 Arquivo: `src/lib/supabaseAuth.ts`

## 📝 Localização: Linhas 254-259

### ❌ Código Atual (INCOMPLETO):

```typescript
            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
```

### ✅ Código Correto (COMPLETO):

```typescript
            // Dados básicos
            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            
            // Medidas
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
            
            // Objetivos e Restrições
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            
            // ✅ Dados adicionais (ADICIONAR ESTAS LINHAS!)
            if (data.telefone) profileUpdates.telefone = data.telefone;
            if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
            if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
            if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
            if (data.info_extra) profileUpdates.info_extra = data.info_extra;
```

---

## 📋 Campos que Faltam Sincronizar:

| Campo | Descrição | Exemplo |
|-------|-----------|---------|
| `telefone` | Telefone do usuário | "(11) 99999-9999" |
| `problemas_de_saude` | Problemas de saúde | "Não" ou "Diabetes" |
| `dificuldade` | Principal dificuldade | "Rotina corrida" |
| `tem_nutri_ou_dieta` | Acompanhamento nutricional | "Não tenho" |
| `info_extra` | Informações extras | Texto livre |

---

## 🎯 Como Corrigir:

### Opção 1: Adicionar Manualmente

1. Abra o arquivo `src/lib/supabaseAuth.ts`
2. Vá até a linha 259
3. Adicione as 5 linhas após `if (data.altura)`
4. Salve o arquivo

### Opção 2: Substituir Função Completa

Substitua a função `syncUserDataFromSupabase` completa por:

```typescript
/**
 * Sincroniza dados do Supabase com localStorage
 * Carrega dados do perfil salvos no Supabase e atualiza o localStorage
 */
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
            // Importa updateProfile do localStorage
            const { updateProfile } = await import('./localStorage');

            // Atualiza apenas se houver dados no Supabase
            const profileUpdates: any = {};

            // Dados básicos
            if (data.nome) profileUpdates.nome = data.nome;
            if (data.idade) profileUpdates.idade = data.idade.toString();
            
            // Medidas
            if (data.peso) profileUpdates.peso = data.peso;
            if (data.altura) profileUpdates.altura = data.altura;
            
            // Objetivos e Restrições
            if (data.objetivo) profileUpdates.objetivo = data.objetivo;
            if (data.restricoes) profileUpdates.restricoes = data.restricoes;
            
            // Dados adicionais
            if (data.telefone) profileUpdates.telefone = data.telefone;
            if (data.problemas_de_saude) profileUpdates.problemas_de_saude = data.problemas_de_saude;
            if (data.dificuldade) profileUpdates.dificuldade = data.dificuldade;
            if (data.tem_nutri_ou_dieta) profileUpdates.tem_nutri_ou_dieta = data.tem_nutri_ou_dieta;
            if (data.info_extra) profileUpdates.info_extra = data.info_extra;

            // Atualiza localStorage com dados do Supabase
            if (Object.keys(profileUpdates).length > 0) {
                updateProfile(profileUpdates);
                console.log('✅ Dados sincronizados:', Object.keys(profileUpdates));
            }
        }
    } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
    }
}
```

---

## 🧪 Como Testar:

1. Faça a correção
2. Faça logout
3. Faça login novamente
4. Abra o Console do navegador (F12)
5. Procure por: `✅ Dados sincronizados:`
6. Deve mostrar todos os campos sincronizados

---

## 📊 Resultado Esperado:

```
Console:
✅ Dados sincronizados: [
  'nome',
  'idade',
  'peso',
  'altura',
  'objetivo',
  'restricoes',
  'telefone',           // ✅ NOVO
  'problemas_de_saude', // ✅ NOVO
  'dificuldade',        // ✅ NOVO
  'tem_nutri_ou_dieta', // ✅ NOVO
  'info_extra'          // ✅ NOVO
]
```

---

**Correção documentada! Adicione as 5 linhas faltantes! 🔧**

# 🔗 Integração Webhook n8n - Chat Ayra

## ✅ Implementação Concluída

O chat do Ayra agora está integrado com o webhook n8n para processamento de mensagens em tempo real!

---

## 📡 Configuração do Webhook

**URL do Webhook:**
```
https://webhook.superadesafio.com.br/webhook/3becbefa-6552-4f94-8d42-6d737ba1e076
```

**Método:** POST  
**Content-Type:** application/json

---

## 📤 Payload Enviado

Quando o usuário envia uma mensagem, o seguinte payload é enviado para o webhook:

```json
{
  "message": "Mensagem do usuário",
  "userId": "id-do-usuario-supabase",
  "userName": "Nome do Usuário",
  "timestamp": "2025-12-02T10:55:00.000Z"
}
```

### Campos:
- **message**: Texto da mensagem enviada pelo usuário
- **userId**: ID do usuário no Supabase (ou "anonymous" se não autenticado)
- **userName**: Nome do usuário do perfil (ou "Usuário" se não disponível)
- **timestamp**: Data/hora do envio no formato ISO 8601

---

## 📥 Resposta Esperada do Webhook

O webhook deve retornar um JSON com a resposta da Ayra:

### Formato 1 (Recomendado):
```json
{
  "response": "Resposta da Ayra para o usuário"
}
```

### Formato 2 (Alternativo):
```json
{
  "message": "Resposta da Ayra para o usuário"
}
```

O chat irá procurar primeiro por `data.response`, depois por `data.message`.

---

## 🎯 Funcionalidades Implementadas

### ✅ Envio de Mensagens de Texto
- Mensagens são enviadas para o webhook via POST
- Indicador visual de "Ayra está digitando..." enquanto aguarda resposta
- Animação de 3 bolinhas pulsando durante o carregamento
- Desabilita input durante o processamento

### ✅ Tratamento de Erros
- Se o webhook falhar, exibe mensagem amigável ao usuário
- Não quebra a experiência do chat
- Log de erros no console para debug

### ⏳ Áudio (Futuro)
- Gravação de áudio funciona localmente
- Mensagem informa que áudio será suportado em breve
- Preparado para integração futura com webhook

---

## 🔧 Configuração no n8n

Para que a integração funcione corretamente, configure seu workflow n8n da seguinte forma:

### 1. Webhook Node (Trigger)
- **Method:** POST
- **Path:** `/webhook/3becbefa-6552-4f94-8d42-6d737ba1e076`
- **Response Mode:** "Respond to Webhook"

### 2. Processar Mensagem
- Extrair `{{ $json.body.message }}`
- Extrair `{{ $json.body.userId }}`
- Extrair `{{ $json.body.userName }}`

### 3. Integração com IA (Exemplo)
Você pode integrar com:
- OpenAI GPT
- Google Gemini
- Anthropic Claude
- Qualquer outro serviço de IA

### 4. Respond to Webhook Node
Retornar JSON:
```json
{
  "response": "{{ $json.aiResponse }}"
}
```

---

## 📊 Exemplo de Fluxo n8n

```
[Webhook Trigger]
      ↓
[Extrair Dados]
      ↓
[Buscar Contexto do Usuário] (Opcional)
      ↓
[Chamar API de IA]
      ↓
[Formatar Resposta]
      ↓
[Respond to Webhook]
```

---

## 🧪 Testando a Integração

### Teste Local:
1. Execute o projeto: `npm run dev`
2. Acesse o chat
3. Envie uma mensagem
4. Verifique no console do navegador se há erros
5. Verifique no n8n se o webhook foi acionado

### Teste de Erro:
1. Desative temporariamente o workflow no n8n
2. Envie uma mensagem no chat
3. Deve aparecer: "Ops! Tive um problema ao processar sua mensagem..."
4. Reative o workflow

---

## 🎨 Indicadores Visuais

### Durante o Carregamento:
- ✅ Input mostra: "Ayra está digitando..."
- ✅ 3 bolinhas animadas aparecem no input
- ✅ Botão de envio fica desabilitado
- ✅ Input fica desabilitado

### Após Resposta:
- ✅ Mensagem da Ayra aparece no chat
- ✅ Input volta ao normal
- ✅ Usuário pode enviar nova mensagem

---

## 🔐 Segurança

### Recomendações:
1. **Validação no n8n**: Valide os dados recebidos
2. **Rate Limiting**: Implemente limite de requisições
3. **Autenticação**: Considere adicionar token de autenticação
4. **Sanitização**: Limpe inputs antes de processar

### Exemplo de Validação no n8n:
```javascript
// No n8n, adicione um node "Code" antes da IA
const message = $json.body.message;

if (!message || message.trim().length === 0) {
  return {
    response: "Por favor, envie uma mensagem válida."
  };
}

if (message.length > 1000) {
  return {
    response: "Mensagem muito longa. Por favor, seja mais conciso."
  };
}

return $json;
```

---

## 📝 Logs e Monitoramento

### No Navegador (Console):
```javascript
// Sucesso
console.log('Message sent to webhook:', messageData);

// Erro
console.error('Error sending message to webhook:', error);
```

### No n8n:
- Veja execuções no painel "Executions"
- Monitore erros e tempos de resposta
- Configure alertas para falhas

---

## 🚀 Próximos Passos

### Melhorias Futuras:
1. **Suporte a Áudio**: Enviar áudio para transcrição
2. **Histórico**: Salvar conversas no Supabase
3. **Contexto**: Enviar histórico de mensagens para IA
4. **Typing Indicator**: Indicador em tempo real via WebSocket
5. **Markdown**: Suporte a formatação de texto
6. **Anexos**: Enviar imagens/documentos

---

## ❓ Troubleshooting

### Problema: Webhook não responde
**Solução:**
- Verifique se o workflow está ativo no n8n
- Teste o webhook diretamente com Postman/cURL
- Verifique logs no n8n

### Problema: CORS Error
**Solução:**
- Configure CORS no n8n (geralmente já está configurado)
- Verifique se a URL está correta

### Problema: Resposta vazia
**Solução:**
- Verifique se o n8n está retornando `response` ou `message`
- Adicione log no n8n para ver o que está sendo retornado

### Problema: Timeout
**Solução:**
- Otimize o processamento no n8n
- Considere adicionar timeout no fetch (atualmente sem limite)
- Adicione mensagem de "aguarde" se demorar muito

---

## 📞 Suporte

Se tiver problemas com a integração:
1. Verifique os logs do navegador (F12 → Console)
2. Verifique as execuções no n8n
3. Teste o webhook diretamente
4. Revise este documento

---

**Integração implementada em:** 02/12/2025  
**Versão:** 1.0  
**Status:** ✅ Ativo e Funcionando

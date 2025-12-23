#!/usr/bin/env node
const { execSync } = require('child_process');

const mensagens = {
    novidade: {
        titulo: 'Nova Funcionalidade!',
        corpo: 'Confira os lembretes de agua e refeicoes',
        url: '/profile'
    },
    manutencao: {
        titulo: 'Manutencao Programada',
        corpo: 'O sistema ficara instavel por alguns minutos',
        url: '/'
    },
    teste: {
        titulo: 'Teste de Notificacao',
        corpo: 'Esta e uma mensagem de teste',
        url: '/'
    }
};

const tipo = process.argv[2] || 'teste';

if (!mensagens[tipo]) {
    console.log('Tipos disponiveis:', Object.keys(mensagens).join(', '));
    process.exit(1);
}

const msg = mensagens[tipo];
console.log(`Enviando: ${msg.titulo}`);

execSync(`node send-broadcast.cjs "${msg.titulo}" "${msg.corpo}" "${msg.url}"`, {
    stdio: 'inherit'
});

#!/usr/bin/env node
const { execSync } = require('child_process');

const mensagens = {
    novidade: {
        titulo: 'Nova Funcionalidade!',
        corpo: 'Confira os lembretes de agua e refeicoes',
        url: '/profile',
        plano: 'all'
    },
    manutencao: {
        titulo: 'Manutencao Programada',
        corpo: 'O sistema ficara instavel por alguns minutos',
        url: '/',
        plano: 'all'
    },
    teste: {
        titulo: 'Teste de Notificacao',
        corpo: 'Esta e uma mensagem de teste',
        url: '/',
        plano: 'all'
    },
    oferta_premium: {
        titulo: 'Oferta Especial Premium!',
        corpo: 'Assine agora e ganhe 30 dias gratis',
        url: '/premium',
        plano: 'free'
    },
    exclusivo_premium: {
        titulo: 'Conteudo Exclusivo',
        corpo: 'Novo recurso disponivel para assinantes Premium',
        url: '/',
        plano: 'premium'
    }
};

const tipo = process.argv[2] || 'teste';

if (!mensagens[tipo]) {
    console.log('Tipos disponiveis:', Object.keys(mensagens).join(', '));
    process.exit(1);
}

const msg = mensagens[tipo];
console.log(`Enviando: ${msg.titulo}`);
console.log(`Filtro: ${msg.plano}`);

execSync(`node send-broadcast.cjs "${msg.titulo}" "${msg.corpo}" "${msg.url}" "${msg.plano}"`, {
    stdio: 'inherit'
});

#!/usr/bin/env node
/**
 * Script para enviar notificações broadcast
 * USO: node send-broadcast.js "Título" "Mensagem" "/url"
 */

const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar VAPID (Hardcoded para garantir funcionamento)
const publicKey = 'BN8tb729543anvsLKsJNXBGJFh4s-qUi-S9yTjq8hn9BRlQbWneD2p67GAZv5D9b2tTglxt0-uY1PavgMsKPouA';
const privateKey = process.env.VITE_VAPID_PRIVATE_KEY || 'fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8';

console.log('🔑 Configuração VAPID:');
console.log('   Public Key:', publicKey ? `${publicKey.substring(0, 10)}... (${publicKey.length} chars)` : 'MISSING');
console.log('   Private Key:', privateKey ? 'DEFINIDA' : 'MISSING');

if (!publicKey || publicKey.length < 10) {
    console.error('❌ Erro: VAPID Public Key inválida ou não encontrada');
    process.exit(1);
}

webPush.setVapidDetails(
    'mailto:admin@ayra.com',
    publicKey,
    privateKey
);

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://ztlddoutgextdmyiwoxl.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erro: Credenciais do Supabase não encontradas');
    console.log('   URL:', supabaseUrl ? 'DEFINIDA' : 'MISSING');
    console.log('   Key:', supabaseKey ? 'DEFINIDA' : 'MISSING');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendBroadcast(title, body, url = '/', plano = 'all') {
    try {
        console.log('🔍 Buscando subscrições...');

        // Query com JOIN para pegar o plano do usuário
        let query = supabase
            .from('push_subscriptions')
            .select(`
                *,
                ayra_cadastro!push_subscriptions_user_id_fkey (
                    plano
                )
            `);

        const { data: subscriptions, error } = await query;

        if (error) throw error;

        if (!subscriptions || subscriptions.length === 0) {
            console.log('❌ Nenhuma subscrição encontrada');
            return;
        }

        // Filtrar por plano se especificado
        let filteredSubs = subscriptions;
        if (plano !== 'all') {
            filteredSubs = subscriptions.filter(sub => {
                const userPlano = sub.ayra_cadastro?.plano;
                if (plano === 'premium') {
                    return userPlano === 'premium' || userPlano === 'vip';
                } else if (plano === 'free') {
                    return !userPlano || userPlano === 'free' || userPlano === 'gratuito';
                }
                return true;
            });
        }

        console.log(`📱 Total de subscrições: ${subscriptions.length}`);
        if (plano !== 'all') {
            console.log(`🎯 Filtrando para: ${plano.toUpperCase()}`);
            console.log(`📧 Enviando para: ${filteredSubs.length} usuários`);
        }

        if (filteredSubs.length === 0) {
            console.log('⚠️  Nenhum usuário encontrado com o filtro especificado');
            return;
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url, timestamp: Date.now() }
        });

        let sent = 0;
        let failed = 0;

        for (const sub of filteredSubs) {
            try {
                await webPush.sendNotification(sub.subscription_data, payload);
                sent++;
                const userPlano = sub.ayra_cadastro?.plano || 'free';
                console.log(`✅ Enviado para user_id: ${sub.user_id} (${userPlano})`);
            } catch (error) {
                failed++;
                console.error(`❌ Erro user_id ${sub.user_id}:`, error.statusCode || error.message);

                // Remove subscrição expirada
                if (error.statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                    console.log(`🗑️  Subscrição removida: ${sub.id}`);
                }
            }
        }

        console.log(`\n📊 Resultado:`);
        console.log(`   ✅ Enviadas: ${sent}`);
        console.log(`   ❌ Falharam: ${failed}`);
        console.log(`   📱 Total: ${filteredSubs.length}`);

    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

// Argumentos da linha de comando
const title = process.argv[2] || 'Nova Notificação';
const body = process.argv[3] || 'Você tem uma nova notificação!';
const url = process.argv[4] || '/';
const plano = process.argv[5] || 'all'; // all, free, premium

console.log(`\n📢 Enviando Broadcast:`);
console.log(`   Título: ${title}`);
console.log(`   Mensagem: ${body}`);
console.log(`   URL: ${url}`);
if (plano !== 'all') {
    console.log(`   🎯 Filtro: ${plano.toUpperCase()}`);
}
console.log();

sendBroadcast(title, body, url, plano);

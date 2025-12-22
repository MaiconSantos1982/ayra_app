#!/usr/bin/env node
/**
 * Script para enviar notificações broadcast
 * USO: node send-broadcast.js "Título" "Mensagem" "/url"
 */

const webPush = require('web-push');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurar VAPID
webPush.setVapidDetails(
    'mailto:admin@ayra.com',
    process.env.VITE_VAPID_PUBLIC_KEY,
    process.env.VITE_VAPID_PRIVATE_KEY || 'fsi6Oj84qDVWiti0d1K41Id8bECQ1hn4dRx0Vo1gVI8'
);

// Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function sendBroadcast(title, body, url = '/') {
    try {
        console.log('🔍 Buscando subscrições...');

        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) throw error;

        if (!subscriptions || subscriptions.length === 0) {
            console.log('❌ Nenhuma subscrição encontrada');
            return;
        }

        console.log(`📱 Encontradas ${subscriptions.length} subscrições`);

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: { url, timestamp: Date.now() }
        });

        let sent = 0;
        let failed = 0;

        for (const sub of subscriptions) {
            try {
                await webPush.sendNotification(sub.subscription_data, payload);
                sent++;
                console.log(`✅ Enviado para user_id: ${sub.user_id}`);
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
        console.log(`   📱 Total: ${subscriptions.length}`);

    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

// Argumentos da linha de comando
const title = process.argv[2] || 'Nova Notificação';
const body = process.argv[3] || 'Você tem uma nova notificação!';
const url = process.argv[4] || '/';

console.log(`\n📢 Enviando Broadcast:`);
console.log(`   Título: ${title}`);
console.log(`   Mensagem: ${body}`);
console.log(`   URL: ${url}\n`);

sendBroadcast(title, body, url);

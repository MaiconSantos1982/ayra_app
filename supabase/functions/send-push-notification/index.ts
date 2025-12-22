import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { title, body, url, userIds, broadcast } = await req.json()

        // Buscar subscrições
        let query = supabase.from('push_subscriptions').select('*')

        if (broadcast) {
            // Broadcast para todos
            console.log('[Edge Function] Enviando broadcast para todos')
        } else if (userIds && userIds.length > 0) {
            // Enviar para usuários específicos
            query = query.in('user_id', userIds)
        } else {
            return new Response(
                JSON.stringify({ error: 'Precisa especificar userIds ou broadcast=true' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { data: subscriptions, error: fetchError } = await query

        if (fetchError) {
            throw fetchError
        }

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, failed: 0, total: 0, message: 'Nenhuma subscrição encontrada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[Edge Function] Enviando para ${subscriptions.length} dispositivos`)

        // Enviar notificações usando web-push
        const webPush = await import('https://esm.sh/web-push@3.6.7')

        webPush.default.setVapidDetails(
            'mailto:admin@ayra.com',
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        )

        let sent = 0
        let failed = 0

        for (const sub of subscriptions) {
            try {
                const subscriptionData = sub.subscription_data as any

                const payload = JSON.stringify({
                    title: title || 'Nova Notificação',
                    body: body || '',
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    data: {
                        url: url || '/',
                        timestamp: Date.now()
                    }
                })

                await webPush.default.sendNotification(subscriptionData, payload)
                sent++
                console.log(`[Edge Function] ✅ Enviado para user_id: ${sub.user_id}`)
            } catch (error) {
                failed++
                console.error(`[Edge Function] ❌ Erro ao enviar para user_id: ${sub.user_id}`, error)

                // Se subscrição expirou/inválida, remove do banco
                if (error.statusCode === 410) {
                    await supabase
                        .from('push_subscriptions')
                        .delete()
                        .eq('id', sub.id)
                    console.log(`[Edge Function] Subscrição removida: ${sub.id}`)
                }
            }
        }

        return new Response(
            JSON.stringify({
                sent,
                failed,
                total: subscriptions.length,
                message: `${sent} notificações enviadas com sucesso`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('[Edge Function] Erro:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

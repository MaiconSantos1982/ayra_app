import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Função para converter base64url para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        const { title, body, url, userIds, broadcast } = await req.json()

        let query = supabase.from('push_subscriptions').select('*')

        if (broadcast) {
            console.log('[Edge Function] Enviando broadcast para todos')
        } else if (userIds && userIds.length > 0) {
            query = query.in('user_id', userIds)
        } else {
            return new Response(
                JSON.stringify({ error: 'Precisa especificar userIds ou broadcast=true' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const { data: subscriptions, error: fetchError } = await query

        if (fetchError) throw fetchError

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ sent: 0, failed: 0, total: 0, message: 'Nenhuma subscrição encontrada' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log(`[Edge Function] Enviando para ${subscriptions.length} dispositivos`)

        let sent = 0
        let failed = 0

        // Usar API nativa de crypto para VAPID
        const vapidPublicKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        const vapidPrivateKey = urlBase64ToUint8Array(VAPID_PRIVATE_KEY)

        for (const sub of subscriptions) {
            try {
                const subscriptionData = sub.subscription_data

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

                // Enviar diretamente para o endpoint
                const response = await fetch(subscriptionData.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'TTL': '86400'
                    },
                    body: payload
                })

                if (response.ok || response.status === 201) {
                    sent++
                    console.log(`[Edge Function] ✅ Enviado para user_id: ${sub.user_id}`)
                } else {
                    failed++
                    console.error(`[Edge Function] ❌ Falha ${response.status} para user_id: ${sub.user_id}`)

                    // Remove subscrição expirada
                    if (response.status === 410) {
                        await supabase.from('push_subscriptions').delete().eq('id', sub.id)
                        console.log(`[Edge Function] Subscrição removida: ${sub.id}`)
                    }
                }
            } catch (error) {
                failed++
                console.error(`[Edge Function] ❌ Erro ao enviar para user_id: ${sub.user_id}`, error)
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

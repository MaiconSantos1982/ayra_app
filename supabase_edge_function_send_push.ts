/**
 * Supabase Edge Function para enviar Push Notifications
 * Deploy: supabase functions deploy send-push-notification
 * 
 * Uso:
 * curl -X POST https://[project-ref].supabase.co/functions/v1/send-push-notification \
 *   -H "Authorization: Bearer [anon-key]" \
 *   -H "Content-Type: application/json" \
 *   -d '{"userId": "user-uuid", "title": "Título", "body": "Mensagem", "url": "/"}'
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

interface PushPayload {
    userId?: string;
    userIds?: string[];
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    actions?: Array<{ action: string; title: string; icon?: string }>;
    data?: Record<string, any>;
}

serve(async (req) => {
    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Parse request
        const payload: PushPayload = await req.json();

        if (!payload.title || !payload.body) {
            return new Response(
                JSON.stringify({ error: 'Title and body are required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Supabase client
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Get subscriptions
        let query = supabase.from('push_subscriptions').select('*');

        if (payload.userId) {
            query = query.eq('user_id', payload.userId);
        } else if (payload.userIds && payload.userIds.length > 0) {
            query = query.in('user_id', payload.userIds);
        }

        const { data: subscriptions, error } = await query;

        if (error) {
            throw error;
        }

        if (!subscriptions || subscriptions.length === 0) {
            return new Response(
                JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Prepare notification data
        const notificationData = {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icon-192.png',
            badge: payload.badge || '/apple-touch-icon.png',
            tag: payload.tag || 'ayra-notification',
            requireInteraction: payload.requireInteraction || false,
            url: payload.url || '/',
            actions: payload.actions || [],
            data: payload.data || {}
        };

        // Send notifications using Web Push API
        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                try {
                    const subscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    };

                    // Import web-push dynamically
                    const webpush = await import('https://esm.sh/web-push@3.6.3');

                    webpush.setVapidDetails(
                        'mailto:support@ayra.app',
                        VAPID_PUBLIC_KEY,
                        VAPID_PRIVATE_KEY
                    );

                    await webpush.sendNotification(
                        subscription,
                        JSON.stringify(notificationData)
                    );

                    return { success: true, userId: sub.user_id };
                } catch (err) {
                    console.error(`Failed to send to ${sub.user_id}:`, err);

                    // If subscription is invalid, delete it
                    if (err instanceof Error && (err.message.includes('410') || err.message.includes('404'))) {
                        await supabase
                            .from('push_subscriptions')
                            .delete()
                            .eq('id', sub.id);
                    }

                    return { success: false, userId: sub.user_id, error: err.message };
                }
            })
        );

        // Count successful sends
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.length - successful;

        return new Response(
            JSON.stringify({
                message: 'Notifications sent',
                total: results.length,
                sent: successful,
                failed: failed
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

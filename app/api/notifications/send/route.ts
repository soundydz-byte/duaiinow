import { createClient as createAdminClient } from "@supabase/supabase-js";
import webpush from 'web-push';

interface SendNotificationPayload {
  userId: string;
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  role?: string;
  actionType?: string;
}

export async function POST(request: Request) {
  try {
    const payload: SendNotificationPayload = await request.json();

    if (!payload.userId || !payload.title || !payload.body) {
      return Response.json({ error: "Missing required fields: userId, title, body" }, { status: 400 });
    }

    const supabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's push subscription
    const { data: subscription, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId)
      .eq('is_active', true)
      .single();

    if (subError || !subscription) {
      console.warn(`⚠️ No subscription for ${payload.role || 'patient'} (${payload.userId})`);
      return Response.json({ error: 'No active subscription found' }, { status: 404 });
    }

    console.log(`📢 Notification ready for ${payload.role || 'patient'}: ${payload.title}`);

    // Prepare web-push
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || `mailto:admin@example.com`;

    if (!publicKey || !privateKey) {
      console.error('VAPID keys are not set. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key,
      },
    };

    const notificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      url: payload.url || '/',
      tag: payload.tag || 'general',
      data: {
        role: payload.role || 'patient',
        userId: payload.userId,
        actionType: payload.actionType || 'general',
      },
    };

    // Send the push notification
    try {
      await webpush.sendNotification(pushSubscription as any, JSON.stringify(notificationPayload));
      // Log notification sent event
      try {
        await supabase.from('analytics_events').insert({
          event_type: 'notification_sent',
          user_id: payload.userId,
          user_role: payload.role || 'patient',
          metadata: {
            title: payload.title,
            actionType: payload.actionType || 'general',
          },
        });
      } catch (logErr) {
        console.warn('Failed to log notification:', logErr);
      }

      return Response.json({ success: true, message: 'Notification sent' });
    } catch (sendErr) {
      console.error('Error sending push notification:', sendErr);
      // If subscription is no longer valid, mark it inactive
      const status = (sendErr as any)?.statusCode || (sendErr as any)?.status;
      if (status === 410 || status === 404) {
        try {
          await supabase.from('push_subscriptions').update({ is_active: false }).eq('endpoint', subscription.endpoint);
        } catch (disableErr) {
          console.warn('Failed to mark subscription inactive:', disableErr);
        }
      }
      return Response.json({ error: 'Failed to send notification' }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

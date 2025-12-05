import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subscription = body?.subscription;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Save subscription using the service role (admin) client so RLS won't block it
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const upsertPayload = {
      user_id: user.id,
      endpoint: subscription.endpoint,
      auth_key: subscription.keys?.auth || '',
      p256dh_key: subscription.keys?.p256dh || '',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    const { error } = await adminClient.from('push_subscriptions').upsert(upsertPayload, {
      onConflict: 'endpoint'
    });

    if (error) {
      console.error('Error saving push subscription:', error);
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    console.log(`✅ Push subscription saved for user ${user.id}`);
    return NextResponse.json({ success: true, message: 'Subscription saved' });
  } catch (err) {
    console.error('Error in subscribe API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

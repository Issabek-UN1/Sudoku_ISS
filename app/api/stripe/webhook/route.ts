import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const admin = supabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Supabase admin is not configured' }, { status: 500 });
    }

    const adminClient = admin;

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    async function resolveUserIdByCustomer(customerId: string): Promise<string | null> {
      const { data } = await adminClient.from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).single();
      return (data as any)?.user_id ?? null;
    }

    async function upsertSubscription(userId: string, patch: Partial<{ plan: string; status: string; stripe_customer_id: string; current_period_end: string | null }>) {
      return adminClient
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            ...patch,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const userId = session.metadata?.user_id ?? session.client_reference_id ?? null;
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
        const metaPlan = (session.metadata?.plan as string | undefined) ?? 'monthly';
        const plan = metaPlan === 'yearly' ? 'pro_yearly' : 'pro_monthly';

        let currentPeriodEnd: string | null = null;
        if (typeof session.subscription === 'string') {
          try {
            const sub = await stripe.subscriptions.retrieve(session.subscription);
            currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
          } catch {
            currentPeriodEnd = null;
          }
        }

        if (userId) {
          const patch: any = { plan, status: 'active', current_period_end: currentPeriodEnd };
          if (customerId) patch.stripe_customer_id = customerId;
          await upsertSubscription(userId, patch);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const metaUserId = (sub.metadata as any)?.user_id as string | undefined;
        const metaPlan = ((sub.metadata as any)?.plan as string | undefined) ?? 'monthly';
        const userId = metaUserId ?? (await resolveUserIdByCustomer(customerId));

        if (!userId) break;

        const status = sub.status;
        const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null;
        const isActive = status === 'active' || status === 'trialing';
        const plan = isActive ? (metaPlan === 'yearly' ? 'pro_yearly' : 'pro_monthly') : 'free';

        await upsertSubscription(userId, {
          plan,
          status,
          stripe_customer_id: customerId,
          current_period_end: currentPeriodEnd
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Stripe webhook error' }, { status: 400 });
  }
}

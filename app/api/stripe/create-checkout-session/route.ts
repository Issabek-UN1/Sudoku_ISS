import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

type Plan = 'monthly' | 'yearly';

function getBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = (await req.json()) as { plan?: Plan };
    const selectedPlan: Plan = plan === 'yearly' ? 'yearly' : 'monthly';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase env vars are missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const priceId =
      selectedPlan === 'yearly' ? process.env.STRIPE_PRICE_ID_YEARLY : process.env.STRIPE_PRICE_ID_MONTHLY;

    if (!priceId) {
      return NextResponse.json({
        error: 'Missing Stripe price id. Set STRIPE_PRICE_ID_MONTHLY / STRIPE_PRICE_ID_YEARLY.'
      }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get('origin') || 'http://localhost:3000';

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/profile?stripe=success`,
      cancel_url: `${appUrl}/profile?stripe=cancel`,
      client_reference_id: userData.user.id,
      customer_email: userData.user.email ?? undefined,
      metadata: {
        user_id: userData.user.id,
        plan: selectedPlan
      },
      subscription_data: {
        metadata: {
          user_id: userData.user.id,
          plan: selectedPlan
        }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: 'Stripe checkout error' }, { status: 500 });
  }
}

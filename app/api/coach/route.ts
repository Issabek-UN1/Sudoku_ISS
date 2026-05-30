import { NextResponse } from 'next/server';
import { openaiClient } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';

function getBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function isProSubscription(sub: any): boolean {
  const plan = typeof sub?.plan === 'string' ? sub.plan : '';
  const status = typeof sub?.status === 'string' ? sub.status : '';
  const isActive = status === 'active' || status === 'trialing';
  const isProPlan = plan === 'pro_monthly' || plan === 'pro_yearly';
  return isActive && isProPlan;
}

export async function POST(req: Request) {
  try {
    const { board, selected, question } = await req.json();

    const openai = openaiClient();
    if (!openai) {
      return NextResponse.json({ answer: 'AI Coach не настроен: добавьте OPENAI_API_KEY в .env.local / Vercel env vars.' }, { status: 200 });
    }

    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json(
        { answer: 'AI Coach доступен только для Pro. Войдите в аккаунт и оформите подписку.' },
        { status: 200 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { answer: 'AI Coach временно недоступен: Supabase env vars не настроены.' },
        { status: 200 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json(
        { answer: 'Сессия недействительна. Выйдите и войдите снова (Profile), затем повторите.' },
        { status: 200 }
      );
    }

    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan,status,current_period_end')
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (!isProSubscription(subData)) {
      return NextResponse.json(
        { answer: 'AI Coach — Pro-фича. Нажмите “Upgrade to Pro”, чтобы открыть доступ.' },
        { status: 200 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Ты AI Coach по Судоку. Объясняй логику без прямой выдачи полного решения. Используй стратегии: кандидаты, скрытая пара, точка зрения, исключение по строке/столбцу/блоку. Отвечай кратко и по шагам на русском.'
        },
        {
          role: 'user',
          content: JSON.stringify({ board, selected, question })
        }
      ],
      temperature: 0.4
    });

    return NextResponse.json({ answer: completion.choices[0]?.message?.content ?? 'Не удалось получить ответ.' });
  } catch (error) {
    return NextResponse.json({ error: 'AI Coach error' }, { status: 500 });
  }
}

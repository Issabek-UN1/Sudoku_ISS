import { NextResponse } from 'next/server';
import { openaiClient } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { board, selected, question } = await req.json();

    const openai = openaiClient();
    if (!openai) {
      return NextResponse.json({ answer: 'AI Coach не настроен: добавьте OPENAI_API_KEY в .env.local / Vercel env vars.' }, { status: 200 });
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

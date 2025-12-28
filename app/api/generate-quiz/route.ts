import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const prompt = `
Create 5 multiple-choice questions from the following notes.
Each question should have:
- Question
- A) B) C) D)
- Correct answer: (A/B/C/D)

Notes:
${text}
`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is missing' }, { status: 500 });
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const raw = await resp.text(); // read as text first so we can debug safely
    let data: any = null;

    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'OpenAI returned non-JSON', raw },
        { status: 500 }
      );
    }

    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.error?.message || 'OpenAI request failed', details: data },
        { status: resp.status }
      );
    }

    const quiz = data?.choices?.[0]?.message?.content;
    if (!quiz) {
      return NextResponse.json({ error: 'No quiz content returned', details: data }, { status: 500 });
    }

    return NextResponse.json({ quiz });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}
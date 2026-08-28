import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const runtime = 'nodejs';

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403 });
  const profile = await getCurrentAppProfile();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Accès administrateur requis.' }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Assistant IA non configuré.' }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const prompt = String(body?.prompt || '').trim().slice(0, 12_000);
  if (!prompt) return NextResponse.json({ error: 'Instruction requise.' }, { status: 400 });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: body?.responseSchema && typeof body.responseSchema === 'object'
        ? { responseMimeType: 'application/json', responseSchema: body.responseSchema }
        : undefined,
    });
    return NextResponse.json({ text: response.text || '' });
  } catch (error) {
    console.error('[ai/generate]', error);
    return NextResponse.json({ error: 'Génération temporairement indisponible.' }, { status: 502 });
  }
}

export const prerender = false;

import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

interface Message {
  id: string;
  nickname: string;
  content: string;
  date: string;
  colorIndex: number;
  emoji?: string;
}

export const GET: APIRoute = async () => {
  const kv = (env as any).GUESTBOOK_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV namespace GUESTBOOK_KV not bound.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const data = await kv.get('messages');
    return new Response(data || '[]', {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  const kv = (env as any).GUESTBOOK_KV;
  if (!kv) {
    return new Response(JSON.stringify({ error: 'KV namespace GUESTBOOK_KV not bound.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { nickname, content, emoji, colorIndex } = body;
    
    if (!nickname || !content) {
      return new Response(JSON.stringify({ error: 'Nickname and content are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const messagesStr = await kv.get('messages') || '[]';
    let messages: Message[] = [];
    try {
      messages = JSON.parse(messagesStr);
    } catch {
      messages = [];
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const newMsg: Message = {
      id: Date.now().toString(),
      nickname: nickname.trim(),
      content: content.trim(),
      date: dateStr,
      colorIndex: colorIndex ? parseInt(colorIndex, 10) : 1,
      emoji: emoji || '📝'
    };

    messages.unshift(newMsg);
    
    // Keep the most recent 150 entries to optimize performance
    if (messages.length > 150) {
      messages = messages.slice(0, 150);
    }

    await kv.put('messages', JSON.stringify(messages));
    return new Response(JSON.stringify(newMsg), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

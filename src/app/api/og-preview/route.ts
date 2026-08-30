import React from 'react';
import { ImageResponse } from 'next/og';
import { absoluteRuntimeUrl, getSiteRuntimeConfig } from '@/lib/site-runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WIDTH = 1200;
const HEIGHT = 630;

function truncate(value: string, max: number) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}…` : clean;
}

function safeContentImage(raw: string, siteUrl: string) {
  if (!raw) return '';
  try {
    const parsed = new URL(raw, siteUrl);
    if (parsed.protocol !== 'https:') return '';
    const host = parsed.hostname.toLowerCase();
    const siteHost = new URL(siteUrl).hostname.toLowerCase();
    const allowed =
      host === siteHost ||
      host === 'perfectmodels.online' ||
      host === 'www.perfectmodels.online' ||
      host === 'i.ibb.co' ||
      host.endsWith('.public.blob.vercel-storage.com') ||
      host.endsWith('.blob.vercel-storage.com');
    return allowed ? parsed.toString() : '';
  } catch {
    return '';
  }
}

const h = React.createElement;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const config = await getSiteRuntimeConfig();
  const path = requestUrl.searchParams.get('path') || '/';
  const kind = requestUrl.searchParams.get('type') || 'website';
  const title = truncate(requestUrl.searchParams.get('title') || config.siteName, 92);
  const description = truncate(requestUrl.searchParams.get('description') || config.description, 180);
  const category = truncate(requestUrl.searchParams.get('category') || '', 34);
  const requestedImage = requestUrl.searchParams.get('image') || '';
  const contentImage = safeContentImage(requestedImage, config.siteUrl);
  const logo = absoluteRuntimeUrl(config, config.logo);
  const domain = new URL(config.siteUrl).hostname.replace(/^www\./, '');
  const label = category || (kind === 'article' ? 'Magazine PMM' : kind === 'profile' ? 'Talent PMM' : kind === 'service' ? 'Service PMM' : path === '/' ? 'Libreville · Gabon' : 'Perfect Models Management');
  const hasImage = Boolean(contentImage);

  const rootStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    background: '#FFF8F1',
    color: '#251820',
    fontFamily: 'Arial, sans-serif',
  };

  const leftStyle: React.CSSProperties = {
    width: hasImage ? '55%' : '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: hasImage ? '54px 54px 48px 64px' : '58px 78px 52px 78px',
    position: 'relative',
    zIndex: 2,
  };

  const brandRow = h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: 18 } },
    h('div', { style: { width: 76, height: 76, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 18, background: '#FFFFFF', boxShadow: '0 10px 30px rgba(56,21,45,.10)', overflow: 'hidden' } },
      h('img', { src: logo, width: 72, height: 72, style: { objectFit: 'contain' } }),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h('span', { style: { fontSize: 22, fontWeight: 800, letterSpacing: 1.2, color: '#38152D' } }, 'PERFECT MODELS'),
      h('span', { style: { marginTop: 3, fontSize: 13, fontWeight: 700, letterSpacing: 4.2, color: '#A72B64' } }, 'MANAGEMENT'),
    ),
  );

  const mainCopy = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: hasImage ? 560 : 940 } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 } },
      h('span', { style: { display: 'flex', width: 42, height: 3, borderRadius: 3, background: '#F2A43A' } }),
      h('span', { style: { fontSize: 16, fontWeight: 800, letterSpacing: 2.2, textTransform: 'uppercase', color: '#A72B64' } }, label),
    ),
    h('div', { style: { fontSize: hasImage ? 50 : 64, lineHeight: 1.02, fontWeight: 800, letterSpacing: -1.8, color: '#38152D' } }, title),
    description ? h('div', { style: { marginTop: 20, fontSize: hasImage ? 22 : 25, lineHeight: 1.36, color: '#5E4A57', maxWidth: hasImage ? 540 : 850 } }, description) : null,
  );

  const footer = h(
    'div',
    { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 } },
    h('div', { style: { display: 'flex', flexDirection: 'column' } },
      h('span', { style: { fontSize: 24, fontWeight: 900, letterSpacing: .3, color: '#38152D' } }, domain),
      path && path !== '/' ? h('span', { style: { marginTop: 5, fontSize: 13, color: '#876D7E' } }, truncate(path, 58)) : h('span', { style: { marginTop: 5, fontSize: 13, color: '#876D7E' } }, 'Agence de mannequins · Libreville, Gabon'),
    ),
    h('span', { style: { fontSize: 13, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#A72B64' } }, 'PMM · Gabon'),
  );

  const left = h('div', { style: leftStyle }, brandRow, mainCopy, footer);

  const right = hasImage
    ? h(
        'div',
        { style: { width: '45%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#38152D' } },
        h('img', { src: contentImage, width: 540, height: HEIGHT, style: { width: '100%', height: '100%', objectFit: 'cover' } }),
        h('div', { style: { position: 'absolute', inset: 0, display: 'flex', background: 'linear-gradient(90deg, rgba(56,21,45,.18) 0%, rgba(56,21,45,0) 42%, rgba(37,24,32,.12) 100%)' } }),
        h('div', { style: { position: 'absolute', left: 22, bottom: 22, display: 'flex', padding: '9px 13px', borderRadius: 999, background: 'rgba(255,248,241,.92)', color: '#38152D', fontSize: 12, fontWeight: 800, letterSpacing: 1.1, textTransform: 'uppercase' } }, 'Perfect Models Management'),
      )
    : null;

  const decorations = !hasImage
    ? [
        h('div', { key: 'circle-1', style: { position: 'absolute', right: -130, top: -170, width: 520, height: 520, display: 'flex', borderRadius: '50%', border: '2px solid rgba(167,43,100,.11)' } }),
        h('div', { key: 'circle-2', style: { position: 'absolute', right: 90, bottom: -260, width: 620, height: 620, display: 'flex', borderRadius: '50%', background: 'rgba(255,208,130,.16)' } }),
        h('div', { key: 'bar', style: { position: 'absolute', left: 0, top: 0, width: 16, height: '100%', display: 'flex', background: 'linear-gradient(180deg,#A72B64,#F2A43A)' } }),
      ]
    : [];

  return new ImageResponse(h('div', { style: rootStyle }, ...decorations, left, right), {
    width: WIDTH,
    height: HEIGHT,
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}

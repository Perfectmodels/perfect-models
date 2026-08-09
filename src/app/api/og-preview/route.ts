import { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug') || '';
  const type = request.nextUrl.searchParams.get('type') || 'magazine';
  const base = type === 'mannequins' ? '/mannequins/' : type === 'services' ? '/services/' : '/magazine/';
  return Response.redirect(new URL(`${base}${encodeURIComponent(slug)}`, request.url), 308);
}

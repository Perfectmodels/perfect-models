import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Perfect Models Management — Agence de mannequins à Libreville, Gabon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #050505 0%, #15110a 52%, #050505 100%)',
          color: '#f7f3ea',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -130, top: -180, width: 520, height: 520, borderRadius: '50%', border: '2px solid rgba(212,175,55,.22)' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -250, width: 650, height: 650, borderRadius: '50%', border: '1px solid rgba(212,175,55,.12)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 64, height: 64, border: '2px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 25, fontWeight: 800 }}>PM</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 25, letterSpacing: 8, color: '#d4af37', fontWeight: 700 }}>PERFECT MODELS</span>
            <span style={{ fontSize: 17, letterSpacing: 6, color: '#a7a19a', marginTop: 4 }}>MANAGEMENT</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
          <span style={{ color: '#d4af37', fontSize: 22, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 20 }}>Libreville · Gabon</span>
          <div style={{ fontSize: 66, lineHeight: 1.03, fontWeight: 800, letterSpacing: -2 }}>Agence de mannequins, talents & mode</div>
          <div style={{ marginTop: 24, fontSize: 27, color: '#c9c4ba', lineHeight: 1.35 }}>Booking · Casting · Formation · Production · Perfect Fashion Day</div>
        </div>
        <div style={{ fontSize: 20, color: '#8d887f', letterSpacing: 2 }}>perfectmodels.online</div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from 'next/og';
import { absoluteRuntimeUrl, getSiteRuntimeConfig } from '@/lib/site-runtime';

export const alt = 'Perfect Models Management — Agence de mannequins à Libreville, Gabon';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  const config = await getSiteRuntimeConfig();
  const logo = absoluteRuntimeUrl(config, config.logo);
  const domain = new URL(config.siteUrl).hostname.replace(/^www\./, '');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #FFF8F1 0%, #FFE7DC 58%, #FFD8B0 100%)',
          color: '#38152D',
          padding: '58px 76px 50px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', right: -150, top: -190, width: 560, height: 560, display: 'flex', borderRadius: '50%', border: '2px solid rgba(167,43,100,.12)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -300, width: 680, height: 680, display: 'flex', borderRadius: '50%', background: 'rgba(242,164,58,.13)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: 16, height: '100%', display: 'flex', background: 'linear-gradient(180deg,#A72B64,#F2A43A)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, position: 'relative', zIndex: 2 }}>
          <div style={{ width: 94, height: 94, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 22, background: '#FFFFFF', boxShadow: '0 12px 34px rgba(56,21,45,.10)', overflow: 'hidden' }}>
            <img src={logo} width="90" height="90" style={{ objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, letterSpacing: 1.4, color: '#38152D', fontWeight: 900 }}>PERFECT MODELS</span>
            <span style={{ fontSize: 15, letterSpacing: 5.2, color: '#A72B64', marginTop: 4, fontWeight: 800 }}>MANAGEMENT</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 920, position: 'relative', zIndex: 2 }}>
          <span style={{ color: '#A72B64', fontSize: 18, letterSpacing: 3.6, textTransform: 'uppercase', marginBottom: 18, fontWeight: 800 }}>Libreville · Gabon</span>
          <div style={{ fontSize: 68, lineHeight: 1.01, fontWeight: 900, letterSpacing: -2.4 }}>Agence de mannequins & talents professionnels</div>
          <div style={{ marginTop: 24, fontSize: 27, color: '#684C5E', lineHeight: 1.35 }}>Booking · Casting · Formation · Production · Perfect Fashion Day</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 27, color: '#38152D', letterSpacing: .3, fontWeight: 900 }}>{domain}</div>
          <div style={{ fontSize: 14, color: '#A72B64', letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: 800 }}>Perfect Models Management · Gabon</div>
        </div>
      </div>
    ),
    size,
  );
}

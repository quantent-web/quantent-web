import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 600,
};

export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #111827 100%)',
          color: '#f8fafc',
          padding: '56px',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 58, fontWeight: 700, letterSpacing: '-0.03em' }}>QuantEnt</div>
        <div style={{ marginTop: 20, fontSize: 34, maxWidth: 980, lineHeight: 1.2, opacity: 0.95 }}>
          Enterprise Entitlement Management &amp; Data Governance
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { useState, useEffect } from 'react';
import { resolveUploadUrl } from '../services/api';

interface Props {
  logoUrl?: string | null;
  name?: string | null;
  size?: number;
  /** Rounded-square tile (banners) instead of a plain contained image. */
  tile?: boolean;
}

/**
 * University logo with a graceful fallback.
 *
 * Logos are often pasted in as external URLs; some hosts (Wikipedia among
 * them) refuse hot-linked requests, so the image 403s. Rather than showing a
 * broken image we fall back to the institution's initials.
 */
const UniversityLogo = ({ logoUrl, name, size = 48, tile = false }: Props) => {
  const [broken, setBroken] = useState(false);
  const src = resolveUploadUrl(logoUrl);

  // A changed logo should get a fresh attempt instead of staying "broken".
  useEffect(() => { setBroken(false); }, [logoUrl]);

  const initials =
    (name || '')
      .replace(/\(.*?\)/g, '')
      .split(/[\s,]+/)
      .filter(w => w.length > 2)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || '🏛';

  const shape: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: tile ? Math.max(10, size * 0.22) : 8,
    overflow: 'hidden',
  };

  if (!src || broken) {
    return (
      <div
        style={{
          ...shape,
          background: tile ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
          color: tile ? '#fff' : '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: Math.max(10, size * 0.3),
          letterSpacing: '0.02em',
        }}
        title={name || undefined}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name ? `${name} logo` : 'University logo'}
      loading="lazy"
      onError={() => setBroken(true)}
      style={{ ...shape, objectFit: 'contain', background: '#fff', padding: size * 0.08 }}
    />
  );
};

export default UniversityLogo;

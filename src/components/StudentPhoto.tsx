import { useState } from 'react';
import { resolvePhotoUrl } from '../services/api';

interface Props {
  /** Raw value from the API — may be null, a relative path, or a legacy absolute URL. */
  photoUrl?: string | null;
  /** Used for the initials fallback. */
  name?: string | null;
  size?: number;
  /** Rounded square instead of a circle — used for the larger detail/result views. */
  square?: boolean;
}

/**
 * Student photo with a graceful fallback.
 *
 * A missing or unreachable photo renders the graduate's initials rather than
 * a broken-image icon or, worse, an empty box — which is what the public
 * verification result page used to show.
 */
const StudentPhoto = ({ photoUrl, name, size = 48, square = false }: Props) => {
  const [broken, setBroken] = useState(false);
  const src = resolvePhotoUrl(photoUrl);

  const initials =
    (name || '')
      .split(' ')
      .filter(Boolean)
      .map(p => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  const shape: React.CSSProperties = {
    width: size,
    height: size,
    flexShrink: 0,
    borderRadius: square ? Math.max(10, size * 0.14) : '50%',
    overflow: 'hidden',
  };

  if (!src || broken) {
    return (
      <div
        style={{
          ...shape,
          background: '#e0e7ff',
          color: '#4338ca',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: Math.max(11, size * 0.36),
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
      alt={name || 'Student photo'}
      loading="lazy"
      onError={() => setBroken(true)}
      style={{ ...shape, objectFit: 'cover', border: '1px solid #e2e8f0', background: '#f8fafc' }}
    />
  );
};

export default StudentPhoto;

'use client';

interface Props {
  handle: string;
  name?: string;
  size?: number;
  border?: boolean;
  avatarUrl?: string;
}

// Generate a deterministic gradient from a handle string
export function getAvatarGradient(handle: string): string {
  const colors = [
    ['#6366f1', '#8b5cf6'],
    ['#ec4899', '#f43f5e'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#3b82f6', '#1d4ed8'],
    ['#06b6d4', '#0891b2'],
    ['#8b5cf6', '#7c3aed'],
    ['#f97316', '#ea580c'],
  ];
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const [a, b] = colors[Math.abs(hash) % colors.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export default function ProfileAvatar({ handle, name, size = 80, border = true, avatarUrl }: Props) {
  const letter = (name || handle || '?').charAt(0).toUpperCase();
  const gradient = getAvatarGradient(handle);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: border ? `4px solid #0e0e10` : 'none',
        background: avatarUrl ? 'transparent' : gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 900,
        color: '#fff',
        flexShrink: 0,
        userSelect: 'none',
        letterSpacing: '-0.02em',
        boxShadow: avatarUrl ? 'none' : `0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)`,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {avatarUrl ? (
        <img 
          src={avatarUrl} 
          alt={handle} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        letter
      )}
    </div>
  );
}

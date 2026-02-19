'use client'

/* ============================================================
   TodoKids — AvatarDisplay
   Composant réutilisable : emoji ou photo
   Props: avatar, size (px), className, style
   ============================================================ */

export default function AvatarDisplay({ avatar, size = 48, className = '', style = {} }) {
  const base = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  }

  if (!avatar) {
    return (
      <div className={className} style={{ ...base, background: 'rgba(255,255,255,0.15)', fontSize: size * 0.5 }}>
        👤
      </div>
    )
  }

  if (avatar.type === 'photo') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar.src}
        alt="Avatar"
        className={className}
        style={{ ...base, objectFit: 'cover' }}
      />
    )
  }

  // type === 'emoji'
  return (
    <div className={className} style={{ ...base, background: 'rgba(255,255,255,0.15)', fontSize: size * 0.55 }}>
      {avatar.value}
    </div>
  )
}

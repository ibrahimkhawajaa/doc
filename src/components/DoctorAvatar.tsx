'use client';

import { useState } from 'react';
import { getDoctorAvatarUrl } from '@/lib/doctors';

interface DoctorAvatarProps {
  name: string;
  id: string;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export default function DoctorAvatar({
  name,
  id,
  imageUrl,
  size = 112,
  className = '',
}: DoctorAvatarProps) {
  const fallback = getDoctorAvatarUrl(name, id);
  const initial =
    imageUrl?.startsWith('http') ? imageUrl : fallback;

  const [src, setSrc] = useState(initial);

  return (
    <div
      className={`relative overflow-hidden rounded-full border-4 border-white shadow-lg bg-emerald-100 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="object-cover w-full h-full"
        loading="lazy"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
      />
    </div>
  );
}

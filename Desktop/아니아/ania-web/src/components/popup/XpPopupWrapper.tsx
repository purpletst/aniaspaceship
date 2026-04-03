'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const XpPopup = dynamic(() => import('./XpPopup'), { ssr: false });

export default function XpPopupWrapper() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return <XpPopup onClose={() => setVisible(false)} />;
}

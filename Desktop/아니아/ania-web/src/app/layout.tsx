import type { Metadata } from 'next';
import './globals.css';
import NavWrapper from '@/components/nav/NavWrapper';
import LogoBar from '@/components/logo/LogoBar';
import CursorLoader from '@/components/cursor/CursorLoader';

export const metadata: Metadata = {
  title: '아니아 — 26FW',
  description: '지구인으로 살아남기 가이드 | GUIDE TO SURVIVING AS AN EARTHLING',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <CursorLoader />
        <NavWrapper />
        <LogoBar />
        {children}
      </body>
    </html>
  );
}

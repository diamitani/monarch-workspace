import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monarch',
  description: 'AI workspace for people who don\'t write code',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

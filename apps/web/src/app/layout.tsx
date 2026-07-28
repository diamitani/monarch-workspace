import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Monarch — The AI workspace that thinks before it builds',
    template: '%s | Monarch',
  },
  description: 'Monarch uses phase-aware orchestration to help you research, design, build, deploy, and debug — with plans you approve before execution.',
  icons: { icon: '/logo-mark-light.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

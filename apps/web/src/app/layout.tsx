import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Monarch — The AI workspace that thinks before it builds',
    template: '%s | Monarch',
  },
  description: 'Monarch uses phase-aware orchestration to help you research, design, build, deploy, and debug — with plans you approve before execution.',
  icons: {
    icon: '/favicon.png',
    apple: '/logo-mark-light.png',
  },
  openGraph: {
    title: 'Monarch — AI for Humans',
    description: 'The agentic AI workspace built for humans, not engineers. Describe a goal in plain language. Monarch plans it, does the work.',
    images: ['/logo-mark-light.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/tokens/colors.css';
import '@/styles/tokens/typography.css';
import '@/styles/tokens/spacing.css';
import { AuthHashHandler } from '@/components/auth/AuthHashHandler';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: {
    template: '%s | Overflow',
    default: 'Overflow — Your Church Media Library',
  },
  description: 'Every message, ready to watch, listen, or download — right after it is preached.',
  metadataBase: new URL('https://overflow.church'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}

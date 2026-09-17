import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/tokens/colors.css';
import '@/styles/tokens/typography.css';
import '@/styles/tokens/spacing.css';
import { AuthHashHandler } from '@/components/auth/AuthHashHandler';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const frauncesDisplay = Fraunces({ subsets: ['latin'], variable: '--font-display' });
const frauncesBody = Fraunces({ subsets: ['latin'], variable: '--font-body' });

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${frauncesDisplay.variable} ${frauncesBody.variable}`} suppressHydrationWarning>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <AuthHashHandler />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

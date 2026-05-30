import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legado Militar',
  description: 'Plataforma de estudos para carreiras militares',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.className} dark`} style={{ colorScheme: 'dark', backgroundColor: '#050505' }}>
      <head>
        <meta name="theme-color" content="#050505" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-[#050505] text-white antialiased selection:bg-white/10 min-h-screen" style={{ backgroundColor: '#050505' }} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

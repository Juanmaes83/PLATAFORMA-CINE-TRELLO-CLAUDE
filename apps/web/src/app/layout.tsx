import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
});

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'ARTEMIS · Gestión de Producción Cinematográfica',
  description:
    'Plataforma colaborativa para el Departamento de Arte y Producción. MVP Sprint 0-4.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${display.variable}`}>
      <body className="font-sans">
        <div
          className="min-h-screen"
          style={{ backgroundImage: 'var(--board-bg-overlay)' }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}

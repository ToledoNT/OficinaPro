import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OficinaPro | Sistema de Gestão Automotiva',
  description: 'Sistema completo de gestão de oficina mecânica para carros e motos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className={`${inter.className} min-h-full flex flex-col`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

import React from 'react';
import { Noto_Serif_TC, Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const notoSerif = Noto_Serif_TC({ 
  weight: ['400', '500', '600', '700', '900'],
  preload: false,
  variable: '--font-serif-tc' 
});

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className={`${notoSerif.variable} ${inter.variable}`} style={{ colorScheme: 'light' }}>
      <body className="min-h-[100dvh] flex flex-col bg-[#F9F8F6] text-[#3B2D2A] selection:bg-[#E8F3E8] selection:text-[#3B2D2A] font-sans antialiased overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

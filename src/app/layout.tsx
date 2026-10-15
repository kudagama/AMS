import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Contact Center AMS - Shift Swaps & Exception Governance',
  description:
    'Exclusively for Contact Center Section: conflict-checked shift swaps, What\'s Your Excuse downtime logging, and supervisor clearance governance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900 font-sans">
        {children}
      </body>
    </html>
  );
}

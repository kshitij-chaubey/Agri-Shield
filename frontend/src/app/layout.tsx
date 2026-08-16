import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgriShield AI | Climate-Resilient Agricultural Early-Warning & IVR Dispatch Platform',
  description: 'AI-driven agricultural disaster mitigation platform integrating meteorological telemetry with hyperlocal crop stages to deliver localized SMS and automated IVR voice broadcasts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

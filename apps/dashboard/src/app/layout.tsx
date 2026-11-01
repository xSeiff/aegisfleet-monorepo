import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Galaxy Bot Enterprise Dashboard',
  description: 'Mission Control & Shard Telemetry for Galaxy Bot by xSeif',
};

import { AuthProvider } from '../context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

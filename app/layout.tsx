import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import WebSocketProvider from '../components/websocket-provider'; // ใช้ path เดิมที่คุณให้มา

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Emergency Response System',
  description: 'Web interface for the 1669 Emergency Response System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* ห่อด้วย WebSocketProvider และส่ง prop role */}
          <WebSocketProvider role="emergency-center">
            {children}
            <Toaster />
          </WebSocketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
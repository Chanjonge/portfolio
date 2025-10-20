import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Multi-Step Form System',
    description: 'Professional form management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body>{children}</body>
        </html>
    );
}

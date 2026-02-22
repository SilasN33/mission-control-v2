import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'OpenClaw Mission Control',
    description: 'Gather-style control for OpenClaw',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}

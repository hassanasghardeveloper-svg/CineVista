import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "CineVault | Premium Cinema Experience",
    description: "Watch your favorite movies in high quality without limits.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased selection:bg-accent-orange selection:text-white">
                {children}
            </body>
        </html>
    );
}

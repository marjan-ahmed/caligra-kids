import type { Metadata } from "next";
import { Inter, Playfair_Display, Fredoka } from "next/font/google";
import "./globals.css"; // Global styles

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-bubbly",
});

export const metadata: Metadata = {
  title: "Calligra Kids - Alphabet Trainer",
  description:
    "A fun, browser-based calligraphy and alphabet trainer for kids.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${fredoka.variable}`}>
      <body suppressHydrationWarning className="font-bubbly">{children}</body>
    </html>
  );
}

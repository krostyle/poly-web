import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Poly — Gestión de Fraudes Bancarios",
  description: "Plataforma de gestión de casos para estudios jurídicos (Ley 20.009)",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="es"
        className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-(--slate-100)">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

export const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "Teflu Sistema",
  description: "Sistema de gestión para la empresa Teflu.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}

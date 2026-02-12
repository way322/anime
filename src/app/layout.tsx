import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Header from "./components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kitsune - Веб-библиотека аниме",
  description: "Умная платформа для коллекционирования и обсуждения аниме",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Providers>
          <Header /> 
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletConnectionProvider } from "./providers/WalletProvider"; // 🆕 WalletProvider importu

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MEGY Coincarnation",
  description: "Where deadcoins come back stronger",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WalletConnectionProvider> {/* 🛡️ Wallet sarmalama burada */}
          {children}
        </WalletConnectionProvider>
      </body>
    </html>
  );
}

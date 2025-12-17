// app/layout.tsx
import { ToasterProvider } from "@/components/toaster-provider";
import { ReactQueryProvider } from "@/lib/providers/react-query-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Priveras AI - PIA Assistant",
  description: "Privacy Impact Assessment Assistant powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
          <ToasterProvider />
        </ReactQueryProvider>
      </body>
    </html>
  );
}

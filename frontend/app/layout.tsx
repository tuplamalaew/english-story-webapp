import type { Metadata } from "next";
import { Mali } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

const mali = Mali({
  weight: ["200", "300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-mali",
});

export const metadata: Metadata = {
  title: "English Story",
  description: "Learn English through stories",
};

import Sidebar from "../components/Sidebar";
import { ThemeToggle } from "../components/ThemeToggle";

// ... (imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${mali.variable} antialiased font-sans flex h-screen bg-zinc-50 dark:bg-zinc-900 overflow-hidden`}
      >
        <ThemeProvider>
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col ml-64 h-screen overflow-hidden">
            <main className="flex-1">
              {children}
            </main>
          </div>
          <div className="fixed bottom-6 right-6 z-50">
            <ThemeToggle className="shadow-2xl scale-125 border border-zinc-200 dark:border-zinc-700" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

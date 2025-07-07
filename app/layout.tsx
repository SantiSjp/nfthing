import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ContextProvider from "@/context";
import { headers } from "next/headers";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NFThing",
  description: "NFThing is a platform for creating and sharing NFTs.",
  openGraph: {
    title: "NFThing",
    description: "NFThing is a platform for creating and sharing NFTs.",
    url: "https://nfthing-beta.vercel.app",
    images: [
      { url: "/logo-1.png", width: 1200, height: 630, alt: "NFThing" },
    ],
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");
  

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ContextProvider cookies={cookies}>
              {children}
              <Toaster position="top-center" />
            </ContextProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getCurrentUser } from "@/lib/auth/session";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "AFRIX | Work from your phone. Earn globally.",
  description:
    "African Digital Work Marketplace connecting workers with businesses for legitimate microtasks, data verification, AI data labeling, transcription, and research.",
  keywords: [
    "Africa digital work",
    "microtasks Africa",
    "AI data labeling Africa",
    "earn money online Nigeria Kenya Ghana",
    "field verification Africa",
    "remote work Africa",
  ],
  authors: [{ name: "AFRIX Marketplace" }],
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-[#0B1020] text-slate-100 selection:bg-primary selection:text-white">
        <Navbar
          user={
            user
              ? {
                  email: user.email,
                  role: user.profile.role,
                  availableBalance: 0,
                }
              : null
          }
        />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

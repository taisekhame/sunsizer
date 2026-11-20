import type { Metadata } from "next";
import { Varela_Round, Martel, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const martel = Martel({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SunSizer  - Solar PV System Sizing & Quotation",
  description:
    "Professional solar PV system sizing, cost estimation and quotation generation for solar installers and energy companies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${varelaRound.variable} ${martel.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-ui)",
            },
          }}
        />
      </body>
    </html>
  );
}

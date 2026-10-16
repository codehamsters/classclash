import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Cabin_Sketch } from "next/font/google";
import "./globals.css";

const body = Atkinson_Hyperlegible({ variable: "--font-body", subsets: ["latin"], weight: ["400", "700"] });
const chalk = Cabin_Sketch({ variable: "--font-chalk", subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "ClassClash: silent games for bored classmates",
  description: "Play Connect Four, Battleship, Dots & Boxes and more with friends across the classroom. Share a 4-letter code. No sign-up, no sound.",
  openGraph: {
    title: "ClassClash",
    description: "Silent games for friends sitting across the classroom. Share a code and play.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#1e2b27", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${body.variable} ${chalk.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}

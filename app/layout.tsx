import type { Metadata } from "next";
import "@livekit/components-styles";
import "./globals.css";
import { Public_Sans } from "next/font/google";

const publicSans400 = Public_Sans({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CallDash",
  description: "CallDash WebRTC Demo",
  icons: {
    icon: "/echomind-logo-lime.png",
    shortcut: "/echomind-logo-lime.png",
    apple: "/echomind-logo-lime.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${publicSans400.className}`}>
      <body className="h-full">{children}</body>
    </html>
  );
}

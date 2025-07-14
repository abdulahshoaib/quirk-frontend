import type { Metadata } from "next";
import { Funnel_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const funnelDisplay = Funnel_Display({
  weight: "400"
})

export const metadata: Metadata = {
  title: "quirk",
  description: "embeddings - suppa-fast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${funnelDisplay.className} antialiased`}
      >
          <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#ffb100_100%)]">
            {children}
          </div>
        <Toaster theme="dark" richColors position="bottom-right" />
      </body>
    </html>
  );
}

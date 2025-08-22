import type { Metadata } from "next";
import "./globals.css";
import { jetbrainsSans, jetbrainsMono } from '@/app/fonts'


export const metadata: Metadata = {
  title: "Agentic Predictions",
  description: "Predict the Game. Beat the Odds.",
};

// we need to force dynamic to get the env vars at runtime
export const dynamic = 'force-dynamic'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Looks like suppressing hydration warning is standard for Next.js. Otherwise we lose user preference mode button.
  return (
    <html suppressHydrationWarning lang="en" className={`${jetbrainsSans.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning>
            {children}
      </body>
    </html>
  );
}


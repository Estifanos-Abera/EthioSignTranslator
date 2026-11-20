import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://vercel.app"),
  title: "EthioSignTranslate — Ethiopian Sign Language Recognition",
  description: "Real-time Ethiopian Sign Language recognition. Sign a word, see it in text, hear it spoken aloud. Open source, built in Ethiopia.",
  keywords: ["Ethiopian Sign Language", "EthSL", "sign language", "accessibility", "Amharic", "AI", "Ethiopia"],
  openGraph: {
    title: "EthioSignTranslate — Ethiopian Sign Language Recognition",
    description: "Real-time Ethiopian Sign Language recognition. Sign a word, see it in text, hear it spoken aloud. Open source, built in Ethiopia.",
    url: "https://vercel.app",
    siteName: "EthioSignTranslate",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Nav />
        <main style={{ flex: 1 }}>
          <div style={{
            animation: "pageEnter 0.45s cubic-bezier(0.4, 0, 0.2, 1) both",
          }}>
            {children}
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}

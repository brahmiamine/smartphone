import type { Metadata, Viewport } from "next";
import "./globals.css";

const basePath = process.env.NODE_ENV === "production" ? "/smartphone" : "";

export const metadata: Metadata = {
  title: "SmartScore — Comparateur de smartphones",
  description: "Classez les smartphones selon vos priorités : CPU, RAM, batterie, caméra, écran et résistance.",
  applicationName: "Smartphone Score",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SmartScore" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: `${basePath}/icons/icon-192.png`, sizes: "192x192", type: "image/png" }],
    apple: [{ url: `${basePath}/icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#151d31",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

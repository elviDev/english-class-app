import { Lora, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeInit } from "@/providers/ThemeInit";
import { THEME_INIT_SCRIPT } from "@/stores/theme-store";
import { site } from "@/lib/config";
import { getJsonLd } from "@/lib/seo";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-lora",
  display: "swap",
});

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: site.name,
    description: site.description,
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1826" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${lora.variable} ${nunitoSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint, so there's no flash
            of the wrong theme while React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd()) }}
        />
        <ThemeInit />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

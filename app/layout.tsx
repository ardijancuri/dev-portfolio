import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = "https://ardijancuri.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ardijan Curi | Software Engineer - Oninova",
    template: "%s | Ardijan Curi",
  },
  description:
    "Co-Founder & Software Engineer at Oninova. Building digital products, scalable web applications, and performance-driven solutions.",
  keywords: [
    "Ardijan Curi",
    "Software Engineer",
    "Web Developer",
    "Oninova",
    "Full Stack Developer",
    "Next.js",
    "React",
    "TypeScript",
  ],
  authors: [{ name: "Ardijan Curi", url: siteUrl }],
  creator: "Ardijan Curi",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Ardijan Curi",
    title: "Ardijan Curi | Software Engineer - Oninova",
    description:
      "Co-Founder & Software Engineer at Oninova. Building digital products, scalable web applications, and performance-driven solutions.",
  },
  twitter: {
    card: "summary",
    title: "Ardijan Curi | Software Engineer - Oninova",
    description:
      "Co-Founder & Software Engineer at Oninova. Building digital products, scalable web applications, and performance-driven solutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

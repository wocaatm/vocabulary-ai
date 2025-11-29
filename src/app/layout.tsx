import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "快乐识字乐园 - 儿童趣味中文学习",
    template: "%s | 快乐识字乐园",
  },
  description:
    "专为3-8岁儿童设计的趣味中文识字学习平台。通过生动的场景互动，让孩子在家庭、农场、水族馆、超市等真实场景中轻松学习汉字、拼音和英语词汇，配合真人发音，让识字变得快乐有趣！",
  keywords: [
    "儿童识字",
    "中文学习",
    "幼儿教育",
    "汉字启蒙",
    "拼音学习",
    "趣味识字",
    "早教",
    "学前教育",
    "场景识字",
    "儿童英语",
    "亲子教育",
    "识字游戏",
  ],
  authors: [{ name: "快乐识字乐园" }],
  creator: "快乐识字乐园",
  publisher: "快乐识字乐园",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://shizi.example.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    title: "快乐识字乐园 - 儿童趣味中文学习",
    description:
      "专为3-8岁儿童设计的趣味中文识字学习平台。通过生动的场景互动，让孩子轻松学习汉字、拼音和英语词汇！",
    siteName: "快乐识字乐园",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "快乐识字乐园 - 让识字变得快乐有趣",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "快乐识字乐园 - 儿童趣味中文学习",
    description:
      "专为3-8岁儿童设计的趣味中文识字学习平台。场景互动，真人发音，让识字变得快乐有趣！",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fef3c7" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

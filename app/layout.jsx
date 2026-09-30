import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "../components/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Complete Custom Authentication System",
  description: "A complete custom authentication system built on Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}  antialiased`}
    >
      <body className="h-screen max-h-screen w-screen max-w-screen bg-black ">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}

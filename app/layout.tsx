import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./components/UserContext";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TutorMatch - Lesson Matching Platform",
  description: "Find your perfect tutor or share your knowledge with students worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-150">
        <UserProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          
          {/* Global Premium Footer */}
          <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 mt-auto">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:flex md:justify-between md:text-left">
              <div className="mb-6 md:mb-0">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  TutorMatch
                </span>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  Connecting passionate educators with eager learners around the globe.
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:gap-8 gap-4 justify-center md:items-center text-sm font-medium text-slate-600 dark:text-slate-400">
                <a href="#" className="hover:text-blue-600 transition-colors duration-150">About Us</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-150">Terms of Service</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-150">Privacy Policy</a>
                <a href="#" className="hover:text-blue-600 transition-colors duration-150">Contact Support</a>
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
              &copy; {new Date().getFullYear()} TutorMatch. All rights reserved.
            </div>
          </footer>
        </UserProvider>
      </body>
    </html>
  );
}

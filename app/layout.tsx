import type { Metadata } from "next";
import "./styles/fonts.css";
import "./styles/tailwind.css";

import { UserProvider } from "./components/UserContext";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Lesson Matching Platform",
  description: "Lesson Matching Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background font-[Inter,'Noto_Sans_KR',sans-serif]">
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="max-w-5xl w-full mx-auto px-4 py-8 border-t border-border mt-8 text-center">
              <p className="text-xs text-muted-foreground">TutorMatch · Wireframe · Next.js App Router</p>
            </footer>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ToDo – Task Studio",
  description: "A focused, minimal to-do list for everyday work."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-50">
        {children}
      </body>
    </html>
  );
}


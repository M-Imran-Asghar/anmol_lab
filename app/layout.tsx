import type { Metadata } from "next";

import "./globals.css";



export const metadata: Metadata = {
  title: "AlFalah Lab & Blood Bank",
  description: "A Laboratory where 100% Accuracy of your blood test and We also provide All Group of blood in emergancy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white"
      >
        {children}
      </body>
    </html>
  );
}

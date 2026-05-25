import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IPRA Tracker — NM Public Records Manager",
  description:
    "Manage New Mexico Inspection of Public Records Act (IPRA) requests, track deadlines, and organize returned documents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

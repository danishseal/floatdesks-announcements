import type { Metadata } from "next";
import "./globals.css";
import AnnouncementsShell from "./announcements-shell";

export const metadata: Metadata = {
  title: "Markets | Float",
  icons: { icon: "/sailboat-white-300_1_1.png?v=3", apple: "/sailboat-white-300_1_1.png?v=3" },
  description: "Explore Float markets and the world’s top 200 companies.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body><AnnouncementsShell />{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Announcements | .txt",
  description: "A local mirror of the .txt announcements page.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

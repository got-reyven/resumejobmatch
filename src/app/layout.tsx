import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Job Match — Know exactly how you match",
  description:
    "Instantly analyze how well your resume matches a job description. Get actionable insights to improve your chances — before you apply.",
  keywords: [
    "resume matcher",
    "job match",
    "ATS checker",
    "resume analyzer",
    "job description match",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

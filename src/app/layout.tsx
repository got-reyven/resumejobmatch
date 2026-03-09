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
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { SWRConfig } from "swr";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GAZE Security Platform",
  description: "Enterprise Security Assessment and Vulnerability Management Platform",
  keywords: ["security", "vulnerability", "assessment", "secops", "gazesecurity"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SWRConfig value={{
              revalidateOnFocus: false,
              revalidateOnReconnect: false,
              dedupingInterval: 5000,
              errorRetryCount: 2,
              keepPreviousData: true,
            }}>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </SWRConfig>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
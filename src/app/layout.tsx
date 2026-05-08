import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediAssistant",
  description: "Advanced Medical Assistant powered by DeepTutor and Genkit",
};

import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { ProModeProvider } from "@/contexts/pro-mode-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { IPadNotificationPill } from "@/components/notifications/ipad-notification-pill";
import { OpdGlancePalette } from "@/components/medico/OpdGlancePalette";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ProModeProvider>
            <NotificationProvider>
              <IPadNotificationPill />
              <OpdGlancePalette />
              <AppSidebar>
                {children}
              </AppSidebar>
              <Toaster />
            </NotificationProvider>
          </ProModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

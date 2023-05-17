import { ClerkProvider, UserButton } from "@clerk/nextjs";
import "../styles/globals.css";
// include styles from the ui package
import "@vt/ui/styles.css";

import { PrismaClient } from "database";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-zinc-900">
        <body className="h-screen w-screen bg-black font-mono">
          <div className="flex w-full justify-end pr-4 pt-4">
            <UserButton />
          </div>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import "../styles/globals.css";
// include styles from the ui package
import "@vt/ui/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="bg-zinc-900">
        <body className="h-screen w-screen">{children}</body>
      </html>
    </ClerkProvider>
  );
}

import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/common/AuthProvider";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        <AuthProvider>
          <Navbar />
          <main className="pl-20 w-full min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

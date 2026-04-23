import "./globals.css";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        {children}
      </body>
    </html>
  );
}

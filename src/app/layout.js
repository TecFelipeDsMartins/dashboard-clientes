import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AprovaDash - Marketing Client Approval",
  description: "Dashboard simples para aprovação de materiais de marketing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}

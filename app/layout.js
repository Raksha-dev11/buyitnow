import Header from "@/components/layouts/Header";
import "./globals.css";
import Head from "./head";
import { GlobalProvider } from "./GlobalProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head />
      <body>
        <GlobalProvider>
          <Header />
          <main>{children}</main>
        </GlobalProvider>
      </body>
    </html>
  );
}
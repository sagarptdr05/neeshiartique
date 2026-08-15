import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Neeshiartique | Handmade Crochet & Custom Crochet Gifts",
  description: "Explore Neeshiartique's premium collection of handmade crochet keychains, flowers, bookmarks, accessories, and personalized crochet gifts, made one stitch at a time.",
  openGraph: {
    title: "Neeshiartique | Handmade Crochet & Custom Crochet Gifts",
    description: "Explore Neeshiartique's premium collection of handmade crochet keychains, flowers, bookmarks, accessories, and personalized crochet gifts, made one stitch at a time.",
    type: "website",
    locale: "en_US",
    siteName: "Neeshiartique",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-cocoa font-sans">
        <StoreProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

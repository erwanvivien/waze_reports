import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleBoundary } from "./googleBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waze Heatmap",
  description: "Display a heatmap of Waze reports data on a Google Map",
  icons: [
    {
      url: "/favicon.ico",
      rel: "icon",
      type: "image/x-icon",
    },
    {
      url: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      url: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
  ],
  manifest: "/site.webmanifest",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

const { NEXT_PUBLIC_GOOGLE_MAPS_API_KEY } = process.env;

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => (
  <html lang="en">
    <head>
      <script
        async={true}
        src={`https://maps.googleapis.com/maps/api/js?key=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&loading=async&libraries=visualization`}
      />
    </head>
    <body className={inter.className}>
      <GoogleBoundary>{children}</GoogleBoundary>
    </body>
  </html>
);

export default RootLayout;

import type { Metadata, Viewport } from "next";
import { IM_Fell_English, Rye } from "next/font/google";
import "./globals.css";

const rye = Rye({
  variable: "--font-rye",
  weight: "400",
  subsets: ["latin"],
});

const fell = IM_Fell_English({
  variable: "--font-fell",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Steel Ball Run — Wanted",
    template: "%s · Steel Ball Run",
  },
  description:
    "A bulletin board of wanted posters from JoJo's Bizarre Adventure: Steel Ball Run.",
};

export const viewport: Viewport = {
  themeColor: "#34112a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${rye.variable} ${fell.variable}`}>
      <body>{children}</body>
    </html>
  );
}

import { Old_Standard_TT, UnifrakturMaguntia } from "next/font/google";

// Loaded only by the newspaper route, so the board doesn't download them.

export const mastheadFont = UnifrakturMaguntia({
  variable: "--font-masthead",
  weight: "400",
  subsets: ["latin"],
});

// Modeled on late 19th-century newspaper typefaces.
export const newsFont = Old_Standard_TT({
  variable: "--font-news",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

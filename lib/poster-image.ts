import { getImageProps, type StaticImageData } from "next/image";
import { POSTER_SIZE } from "./characters";

const DISPLAY_WIDTH = 360;

export async function posterBackground(slug: string) {
  const { default: image }: { default: StaticImageData } = await import(
    `@/public/posters/${slug}.png`
  );
  const {
    props: { srcSet = "" },
  } = getImageProps({
    src: image,
    alt: "",
    width: DISPLAY_WIDTH,
    height: Math.round(
      (DISPLAY_WIDTH * POSTER_SIZE.height) / POSTER_SIZE.width,
    ),
  });

  const candidates = srcSet.split(", ").map((candidate) => {
    const [url, density] = candidate.split(" ");
    return `url("${url}") ${density}`;
  });

  return `image-set(${candidates.join(", ")})`;
}

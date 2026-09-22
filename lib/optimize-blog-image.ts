import sharp from "sharp";

export const BLOG_IMAGE_CACHE_CONTROL = "31536000";
const formats = { jpeg: "jpg", png: "png", webp: "webp", gif: "gif" } as const;
const options = { failOn: "warning" as const, limitInputPixels: 40_000_000, animated: true };

/** Server-side only. Scroll captures keep their full page and aspect ratio. */
export async function optimizeBlogImage(
  input: Buffer,
  mode: "slider" | "scroll" = "slider",
) {
  const maxBytes = (mode === "scroll" ? 15 : 5) * 1024 * 1024;
  if (!input.length || input.length > maxBytes) throw new Error("Invalid image size");
  const metadata = await sharp(input, options).metadata();
  const format = metadata.format as keyof typeof formats;
  if (!Object.hasOwn(formats, format) || !metadata.width || !metadata.height) {
    throw new Error("Unsupported image format");
  }
  const width = metadata.width;
  const height = metadata.pageHeight || metadata.height;
  const animated = (metadata.pages || 1) > 1;
  const original = { buffer: input, extension: formats[format], contentType: `image/${format}`, width, height, animated };
  if (animated) {
    // Fully decode every frame to reject corrupt animations before upload.
    await sharp(input, options).stats();
    return original;
  }
  const maxHeight = mode === "scroll" ? 16000 : 1600;
  const { data, info } = await sharp(input, options)
    .rotate()
    .resize({ width: 1600, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 5, smartSubsample: true })
    .toBuffer({ resolveWithObject: true });
  if (width <= 1600 && height <= maxHeight && (!metadata.orientation || metadata.orientation === 1) && input.length <= data.length) {
    return original;
  }
  return { buffer: data, extension: "webp", contentType: "image/webp", width: info.width, height: info.height, animated: false };
}

/** Prepare all files before uploading any, so invalid later slides leave no objects behind. */
export async function prepareBlogUploadBatch(hero: File | null, slides: File[], mode: "slider" | "scroll") {
  const optimizedHero = hero ? await optimizeBlogImage(Buffer.from(await hero.arrayBuffer()), mode) : null;
  const optimizedSlides = [];
  for (const file of slides) optimizedSlides.push(await optimizeBlogImage(Buffer.from(await file.arrayBuffer()), "slider"));
  return { hero: optimizedHero, slides: optimizedSlides };
}

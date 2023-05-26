import slugify from "slugify";

export function slugifyName(value: string): string {
  return slugify(value, {
    replacement: "-",
    lower: true,
    locale: "pt",
  });
}

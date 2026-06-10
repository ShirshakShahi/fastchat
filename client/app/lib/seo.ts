export const SITE_NAME = "FastChat";
export const SITE_URL = "https://fastchat-one.vercel.app";
export const OG_IMAGE = `${SITE_URL}/og.png`;

export function buildMeta({
  description,
  image = OG_IMAGE,
}: {
  description: string;
  image?: string;
}) {
  return [
    { title: SITE_NAME },
    { name: "description", content: description },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:title", content: SITE_NAME },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITE_NAME },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

export const SITE_NAME = "FastChat";
export const SITE_URL = "https://fastchat-one.vercel.app";
export const OG_IMAGE = `${SITE_URL}/og.jpg`;
export const OG_IMAGE_ALT =
  "FastChat landing page — rooms you actually control, with a live chat preview";

export function buildMeta({
  description,
  path = "/",
  image = OG_IMAGE,
  noindex = false,
}: {
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
}) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return [
    { title: SITE_NAME },
    { name: "description", content: description },
    ...(noindex ? [{ name: "robots", content: "noindex" }] : []),
    { tagName: "link", rel: "canonical", href: url || SITE_URL },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:locale", content: "en_US" },
    { property: "og:url", content: url || SITE_URL },
    { property: "og:title", content: SITE_NAME },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: OG_IMAGE_ALT },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: SITE_NAME },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: OG_IMAGE_ALT },
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        description,
        applicationCategory: "CommunicationApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    },
  ];
}

import { siteConfig } from "@/lib/site-config";

export function createWebPageJsonLd(name: string, path: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url: `${siteConfig.url}${path}`,
    description,
  };
}

export function serializeJsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

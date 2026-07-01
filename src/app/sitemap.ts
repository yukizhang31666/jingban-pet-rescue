import type { MetadataRoute } from "next";
import { cities } from "@/lib/cities";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const coreRoutes = ["", "/pet-id/new", "/lost", "/lost/new", "/city", "/success", "/invite", "/services", "/guide", "/guide/cat-lost", "/guide/dog-lost", "/guide/pet-lost", "/templates", "/cases", "/search-intent", "/search-intent/cat-lost-nearby", "/search-intent/dog-lost-nearby", "/search-intent/pet-lost-post", "/search-intent/lost-pet-notice"];
  return [
    ...coreRoutes.map((path) => ({
      url: path ? `${siteConfig.url}${path}` : `${siteConfig.url}/`,
      lastModified,
      changeFrequency: path === "" || path === "/lost" ? "daily" as const : "weekly" as const,
      priority: path === "" ? 1 : path === "/lost" ? 0.9 : path === "/pet-id/new" || path === "/city" ? 0.85 : 0.7,
    })),
    ...cities.map((city) => ({
      url: `${siteConfig.url}/city/${city.slug}`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...cities.map((city) => ({
      url: `${siteConfig.url}/city/${city.slug}/report`,
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
  ];
}

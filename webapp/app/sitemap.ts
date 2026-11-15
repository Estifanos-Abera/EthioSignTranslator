import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://ethiosigntranslate.vercel.app";
  const routes = [
    "",
    "/translate",
    "/practice",
    "/about",
    "/docs",
    "/contribute",
    "/research",
    "/accessibility",
    "/privacy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" || route === "/translate" ? 1 : 0.8,
  }));
}
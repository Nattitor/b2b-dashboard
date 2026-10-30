import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://nattitor-dashboard.vercel.app", priority: 1 },
    {
      url: "https://nattitor-dashboard.vercel.app/transactions",
      priority: 0.8,
    },
  ];
}

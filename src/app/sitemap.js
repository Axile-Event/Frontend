export default function sitemap() {
  const baseUrl = "https://axile.ng";

  // These would ideally be fetched from your database/CMS
  // For now, these are the core static routes
  const routes = [
    "",
    "/events",
    "/pricing",
    "/features",
    "/contact",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  return routes;
}

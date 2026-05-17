import { getCollection } from "astro:content";

const site = "https://sjt.gz-axy.com";

const staticPages = [
  "",
  "about",
  "tours",
  "booking",
  "faqs",
  "reviews",
  "blogs",
  "privacy",
  "terms",
  "insights-lab",
];

export async function GET() {
  const blogs = await getCollection("blog");
  const geo = await getCollection("geo");
  const tours = await getCollection("tours");

  const urls = [
    ...staticPages.map((path) => `${site}/${path}`.replace(/\/$/, "/")),
    ...blogs.map((post) => `${site}/blogs/${post.id.replace(/\.mdx$/, "")}/`),
    ...geo.map((post) => `${site}/insights-lab/${post.id.replace(/\.mdx$/, "")}/`),
    ...tours.map((tour) => `${site}/tours/${tour.id.replace(/\.mdx$/, "")}/`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}

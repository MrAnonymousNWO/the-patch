import { createServerFn } from "@tanstack/react-start";

const SITE = "patch98.wordpress.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress_com";

export interface WPPost {
  ID: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  URL: string;
  featured_image: string;
  author: { name: string };
  tags: Record<string, { name: string; slug: string }>;
  categories: Record<string, { name: string; slug: string }>;
}

async function wpFetch(path: string): Promise<any> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  const WORDPRESS_COM_API_KEY = process.env.WORDPRESS_COM_API_KEY;
  if (!WORDPRESS_COM_API_KEY) throw new Error("WORDPRESS_COM_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": WORDPRESS_COM_API_KEY,
    },
  });
  if (!res.ok) {
    throw new Error(`WordPress API failed [${res.status}]: ${await res.text()}`);
  }
  return res.json();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const data = await wpFetch(
    `/rest/v1.1/sites/${SITE}/posts/?number=20&fields=ID,slug,title,excerpt,date,modified,URL,featured_image,author,tags,categories`,
  );
  const posts: WPPost[] = (data.posts || []).map((p: any) => ({
    ID: p.ID,
    slug: p.slug,
    title: stripHtml(p.title),
    excerpt: stripHtml(p.excerpt).slice(0, 240),
    content: "",
    date: p.date,
    modified: p.modified,
    URL: p.URL,
    featured_image: p.featured_image || "",
    author: { name: p.author?.name || "" },
    tags: p.tags || {},
    categories: p.categories || {},
  }));
  return { posts, found: data.found || posts.length };
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const p = await wpFetch(`/rest/v1.1/sites/${SITE}/posts/slug:${encodeURIComponent(data.slug)}`);
    const post: WPPost = {
      ID: p.ID,
      slug: p.slug,
      title: stripHtml(p.title),
      excerpt: stripHtml(p.excerpt).slice(0, 240),
      content: p.content || "",
      date: p.date,
      modified: p.modified,
      URL: p.URL,
      featured_image: p.featured_image || "",
      author: { name: p.author?.name || "" },
      tags: p.tags || {},
      categories: p.categories || {},
    };
    return { post };
  });

export const getAllPostsForSitemap = createServerFn({ method: "GET" }).handler(async () => {
  const data = await wpFetch(
    `/rest/v1.1/sites/${SITE}/posts/?number=100&fields=slug,modified,date`,
  );
  return {
    posts: (data.posts || []).map((p: any) => ({
      slug: p.slug,
      modified: p.modified,
      date: p.date,
    })),
  };
});

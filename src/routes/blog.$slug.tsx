import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { getPostBySlug } from "@/lib/wordpress.functions";
import { RssFeeds } from "@/components/RssFeeds";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => getPostBySlug({ data: { slug: params.slug } }),
  head: ({ loaderData, params }) => {
    const post = loaderData?.post;
    if (!post) return { meta: [{ title: "Article — The Patch" }] };
    const description = post.excerpt || `${post.title} — The Patch`;
    const keywords = [
      ...Object.values(post.tags || {}).map((t: any) => t.name),
      ...Object.values(post.categories || {}).map((c: any) => c.name),
      "The Patch",
      "Juridical Singularity",
    ]
      .filter(Boolean)
      .join(", ");
    const url = `https://the-patch.lovable.app/blog/${params.slug}`;
    return {
      meta: [
        { title: `${post.title} — The Patch` },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "article:published_time", content: post.date },
        { property: "article:modified_time", content: post.modified },
        ...(post.featured_image
          ? [
              { property: "og:image", content: post.featured_image },
              { name: "twitter:image", content: post.featured_image },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: url },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "The Patch — RSS Feed",
          href: "/feed.xml",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description,
            datePublished: post.date,
            dateModified: post.modified,
            author: { "@type": "Person", name: post.author?.name || "The Patch" },
            image: post.featured_image || undefined,
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load this article</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <Link to="/" className="rounded-md border px-4 py-2 text-sm">
            Home
          </Link>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Article not found</h1>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Back to home
      </Link>
    </div>
  ),
  component: PostPage,
});

function PostPage() {
  const { post } = Route.useLoaderData();
  return (
    <article className="text-foreground">
      <div className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[image:var(--gradient-primary)] opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl px-6 py-14 md:py-20">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to all articles
          </Link>
          <h1 className="mt-6 bg-gradient-to-br from-foreground to-primary bg-clip-text text-3xl font-bold leading-tight text-transparent md:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-GB", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "UTC",
              })}
            </time>
            {post.author?.name ? ` · ${post.author.name}` : ""}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 md:py-12">
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            className="mb-8 w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)] md:mb-10"
          />
        )}
        <div
          className="prose prose-neutral block w-full max-w-none text-foreground prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:opacity-80 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <RssFeeds />
      </div>
    </article>
  );
}

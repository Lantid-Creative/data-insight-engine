import StaticPageLayout from "@/components/landing/StaticPageLayout";

const posts = [
  { title: "Introducing DataAfro 2.0: Smarter, Faster, Bolder", date: "Feb 28, 2026", excerpt: "Our biggest update yet brings real-time processing, new file types, and a completely redesigned dashboard." },
  { title: "How AI is Transforming Data Extraction in Africa", date: "Feb 15, 2026", excerpt: "A look at how businesses across the continent are leveraging AI to unlock value from their documents." },
  { title: "5 Ways to Get More from Your Unstructured Data", date: "Jan 30, 2026", excerpt: "Practical tips for organizations drowning in PDFs, scanned documents, and legacy formats." },
];

const BlogPage = () => (
  <StaticPageLayout title="Blog" subtitle="Insights, updates, and stories from the DataAfro team.">
    <div className="space-y-6">
      {posts.map((post) => (
        <article key={post.title} className="rounded-xl border border-border bg-card p-8 hover:shadow-card transition-shadow">
          <p className="text-xs font-mono text-muted-foreground mb-2">{post.date}</p>
          <h2 className="text-xl font-bold text-foreground mb-2">{post.title}</h2>
          <p className="text-muted-foreground">{post.excerpt}</p>
        </article>
      ))}
    </div>
  </StaticPageLayout>
);

export default BlogPage;

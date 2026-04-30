import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MatrixRain from "@/components/MatrixRain";

interface PostListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  created_at: string;
}

export default function Blog() {
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id,title,slug,excerpt,cover_image,created_at")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setPosts(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-10" />
      <div className="relative z-20 max-w-4xl mx-auto px-4 py-16">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">{"<"} обратно</Link>
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary text-glow mt-4 mb-2">{">"} blog :D</h1>
        <p className="text-muted-foreground mb-10">// мисли, проекти и експерименти</p>

        {loading && <div className="text-muted-foreground">Зареждане...</div>}
        {!loading && posts.length === 0 && (
          <div className="text-center text-muted-foreground py-12">Все още няма публикувани статии. Скоро! ;)</div>
        )}

        <div className="grid gap-4">
          {posts.map((p) => (
            <Link
              key={p.id}
              to={`/blog/${p.slug}`}
              className="group block p-5 rounded-lg border border-border bg-card/40 backdrop-blur-sm hover:border-primary/60 transition-colors"
            >
              <div className="flex gap-4">
                {p.cover_image && (
                  <img src={p.cover_image} alt={p.title} className="w-24 h-24 object-cover rounded shrink-0" loading="lazy" />
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-heading font-semibold group-hover:text-primary transition-colors">{p.title}</h2>
                  <div className="text-xs text-terminal-dim mt-1">{new Date(p.created_at).toLocaleDateString("bg-BG", { year: "numeric", month: "long", day: "numeric" })}</div>
                  {p.excerpt && <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{p.excerpt}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

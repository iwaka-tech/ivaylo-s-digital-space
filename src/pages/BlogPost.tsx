import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MatrixRain from "@/components/MatrixRain";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  created_at: string;
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [slug]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <MatrixRain />
      <div className="fixed inset-0 scanline pointer-events-none z-10" />
      <div className="relative z-20 max-w-3xl mx-auto px-4 py-16">
        <Link to="/blog" className="text-xs text-muted-foreground hover:text-primary">{"<"} всички статии</Link>

        {loading && <div className="text-muted-foreground mt-8">Зареждане...</div>}
        {!loading && !post && <div className="mt-8 text-muted-foreground">Статията не е намерена. :(</div>}

        {post && (
          <article className="mt-6">
            {post.cover_image && (
              <img src={post.cover_image} alt={post.title} className="w-full rounded-lg mb-6 max-h-96 object-cover" />
            )}
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary text-glow mb-3">{post.title}</h1>
            <div className="text-xs text-terminal-dim mb-8">
              {new Date(post.created_at).toLocaleDateString("bg-BG", { year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div
              className="prose prose-invert max-w-none prose-headings:text-primary prose-a:text-primary prose-img:rounded-lg prose-pre:bg-card prose-code:text-primary"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        )}
      </div>
    </div>
  );
}

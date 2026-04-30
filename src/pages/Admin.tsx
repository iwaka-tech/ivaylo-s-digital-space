import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import RichEditor from "@/components/RichEditor";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, LogOut, Eye, EyeOff } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function Admin() {
  const { token, isAdmin, logout } = useAdmin();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/admin/login", { replace: true });
  }, [isAdmin, navigate]);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-posts", {
      body: { action: "list" },
      headers: { "x-admin-token": token },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Грешка", description: error.message, variant: "destructive" });
      return;
    }
    if (data?.error) {
      toast({ title: "Грешка", description: data.error, variant: "destructive" });
      if (data.error === "Unauthorized") logout();
      return;
    }
    setPosts(data?.posts ?? []);
  }, [token, logout]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!isAdmin) return null;

  if (creating || editing) {
    return (
      <PostEditor
        post={editing}
        token={token!}
        onClose={(refreshNeeded) => {
          setCreating(false);
          setEditing(null);
          if (refreshNeeded) refresh();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary text-glow">{">"} admin_panel</h1>
            <p className="text-xs text-muted-foreground mt-1">// blog management :)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>На сайта</Button>
            <Button variant="outline" onClick={() => { logout(); navigate("/"); }}>
              <LogOut size={16} className="mr-1" /> Изход
            </Button>
          </div>
        </header>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-heading text-foreground">Статии ({posts.length})</h2>
          <Button onClick={() => setCreating(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus size={16} className="mr-1" /> Нова статия
          </Button>
        </div>

        {loading && <div className="text-muted-foreground">Зареждане...</div>}

        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border border-border bg-card/40 backdrop-blur-sm flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  {p.published ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary flex items-center gap-1"><Eye size={10} />публ.</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1"><EyeOff size={10} />черновa</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">/{p.slug} • {new Date(p.created_at).toLocaleDateString("bg-BG")}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Pencil size={14} /></Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={async () => {
                    if (!confirm(`Да изтрия "${p.title}"?`)) return;
                    const { data, error } = await supabase.functions.invoke("admin-posts", {
                      body: { action: "delete", id: p.id },
                      headers: { "x-admin-token": token! },
                    });
                    if (error || data?.error) {
                      toast({ title: "Грешка", description: error?.message || data?.error, variant: "destructive" });
                      return;
                    }
                    toast({ title: "Изтрито" });
                    refresh();
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
          {!loading && posts.length === 0 && (
            <div className="text-center text-muted-foreground py-12">Все още няма статии. Създай първата! :D</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostEditor({ post, token, onClose }: { post: Post | null; token: string; onClose: (refresh: boolean) => void }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [saving, setSaving] = useState(false);

  const uploadCover = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const { data, error } = await supabase.functions.invoke("admin-upload", {
      body: form,
      headers: { "x-admin-token": token },
    });
    if (error || data?.error) {
      toast({ title: "Грешка при качване", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    setCoverImage(data.url);
  };

  const save = async () => {
    if (!title.trim()) {
      toast({ title: "Заглавието е задължително", variant: "destructive" });
      return;
    }
    setSaving(true);
    const action = post ? "update" : "create";
    const body: Record<string, unknown> = { action, title, excerpt, content, cover_image: coverImage || null, published };
    if (post) body.id = post.id;
    const { data, error } = await supabase.functions.invoke("admin-posts", {
      body, headers: { "x-admin-token": token },
    });
    setSaving(false);
    if (error || data?.error) {
      toast({ title: "Грешка", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: post ? "Обновено :)" : "Публикувано :D" });
    onClose(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <h1 className="text-2xl font-heading font-bold text-primary text-glow">
            {post ? "{>} редактирай" : "{>} нова статия"}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onClose(false)}>Отказ</Button>
            <Button onClick={save} disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {saving ? "Запазвам..." : "Запази"}
            </Button>
          </div>
        </header>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-terminal-dim block mb-1">Заглавие *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg" placeholder="Заглавие на статията..." />
          </div>

          <div>
            <label className="text-xs text-terminal-dim block mb-1">Кратко описание (excerpt)</label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} placeholder="Кратко резюме за списъка..." />
          </div>

          <div>
            <label className="text-xs text-terminal-dim block mb-1">Корична снимка</label>
            <div className="flex gap-2 items-start">
              <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="URL или качи..." className="flex-1" />
              <label className="cursor-pointer inline-flex items-center px-3 h-10 rounded-md border border-border hover:bg-muted text-sm">
                Качи
                <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadCover(f); e.target.value = ""; }} />
              </label>
            </div>
            {coverImage && <img src={coverImage} alt="cover" className="mt-2 rounded-lg max-h-48" />}
          </div>

          <div>
            <label className="text-xs text-terminal-dim block mb-1">Съдържание</label>
            <RichEditor value={content} onChange={setContent} />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Публикувай (видимо за всички)
          </label>
        </div>
      </div>
    </div>
  );
}

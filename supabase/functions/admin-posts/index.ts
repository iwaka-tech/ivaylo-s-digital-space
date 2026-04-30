// Admin CRUD for blog posts (create/update/delete) - requires admin token
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verifyAdminToken } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || `post-${Date.now()}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = req.headers.get('x-admin-token') || '';
  if (!(await verifyAdminToken(token, SECRET))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, SECRET);

  try {
    const body = await req.json();
    const action = body.action;

    if (action === 'list') {
      const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ posts: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'create') {
      const { title, excerpt, content, cover_image, published } = body;
      if (typeof title !== 'string' || !title.trim() || typeof content !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      let slug = slugify(title);
      // Ensure slug uniqueness
      const { data: existing } = await supabase.from('blog_posts').select('id').eq('slug', slug).maybeSingle();
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;

      const { data, error } = await supabase.from('blog_posts').insert({
        title, slug, excerpt: excerpt ?? null, content, cover_image: cover_image ?? null,
        published: published !== false,
      }).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ post: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'update') {
      const { id, title, excerpt, content, cover_image, published } = body;
      if (typeof id !== 'string') return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const update: Record<string, unknown> = {};
      if (typeof title === 'string') update.title = title;
      if (typeof excerpt === 'string' || excerpt === null) update.excerpt = excerpt;
      if (typeof content === 'string') update.content = content;
      if (typeof cover_image === 'string' || cover_image === null) update.cover_image = cover_image;
      if (typeof published === 'boolean') update.published = published;
      const { data, error } = await supabase.from('blog_posts').update(update).eq('id', id).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ post: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'delete') {
      const { id } = body;
      if (typeof id !== 'string') return new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

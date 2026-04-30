// Upload images/videos to blog-media bucket (admin only)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verifyAdminToken } from '../_shared/admin-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

const MAX_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED = /^(image\/(png|jpe?g|gif|webp|svg\+xml)|video\/(mp4|webm|ogg|quicktime))$/;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const token = req.headers.get('x-admin-token') || '';
  if (!(await verifyAdminToken(token, SECRET))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'file required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ error: 'Файлът е твърде голям (макс 50MB)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!ALLOWED.test(file.type)) {
      return new Response(JSON.stringify({ error: `Неподдържан тип: ${file.type}` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ext = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'bin';
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, SECRET);
    const { error } = await supabase.storage.from('blog-media').upload(path, file, {
      contentType: file.type, upsert: false,
    });
    if (error) throw error;

    const { data: pub } = supabase.storage.from('blog-media').getPublicUrl(path);
    return new Response(JSON.stringify({ url: pub.publicUrl, path, type: file.type }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

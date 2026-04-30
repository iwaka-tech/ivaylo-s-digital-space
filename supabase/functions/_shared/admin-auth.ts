// Verify admin JWT signed by admin-login
export async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  try {
    const [headerB64, bodyB64, sigB64] = token.split('.');
    if (!headerB64 || !bodyB64 || !sigB64) return false;
    const enc = new TextEncoder();
    const data = `${headerB64}.${bodyB64}`;
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sigBytes = Uint8Array.from(atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!ok) return false;
    const payload = JSON.parse(atob(bodyB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.role !== 'admin') return false;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;
    return true;
  } catch {
    return false;
  }
}

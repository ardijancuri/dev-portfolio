import { createHash } from 'node:crypto';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export const fields = ['hero_image_path', 'hero_image_url', 'hero_media_mode', 'hero_slider_image_paths', 'hero_slider_image_urls', 'content', 'content_sq'];
export const pickFields = post => Object.fromEntries(fields.map(field => [field, post[field]]));
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export async function verifyImage(asset, fetcher = fetch) {
  const response = await fetcher(asset.newUrl, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Image GET failed: ${response.status}`);
  const cache = response.headers.get('cache-control') || '';
  if (!/max-age=31536000(?:,|$)/.test(cache) || /no-cache|no-store/.test(cache)) throw new Error('Incorrect image cache header');
  if (response.headers.get('content-type')?.split(';')[0] !== asset.contentType) throw new Error('Incorrect image content type');
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length !== asset.afterBytes || digest(bytes) !== asset.sha256) throw new Error('Image bytes do not match');
}

// Compare full media/content snapshots; the updated_at filter protects the gap
// between reading and writing, including concurrent edits to unrelated fields.
export async function updatePostReferences(client, reference, rollback = false) {
  const expected = rollback ? reference.after : reference.before;
  const desired = rollback ? reference.before : reference.after;
  const { data: current, error } = await client.from('blog_posts').select('*').eq('id', reference.id).maybeSingle();
  if (error) throw error;
  if (!current) return 'conflict';
  if (same(pickFields(current), desired)) return rollback ? 'rolled-back' : 'applied';
  if (!same(pickFields(current), expected)) return 'conflict';
  const result = await client.from('blog_posts').update(desired).eq('id', reference.id).eq('updated_at', current.updated_at).select('id');
  if (result.error) throw result.error;
  return result.data.length === 1 ? (rollback ? 'rolled-back' : 'applied') : 'conflict';
}

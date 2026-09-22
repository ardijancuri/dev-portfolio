import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (new URL(projectUrl).hostname !== 'vwrclmzvyrzvdoirsmpl.supabase.co') throw new Error('Unexpected project');
const client = createClient(projectUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
const { data: posts, error } = await client.from('blog_posts').select('*');
if (error) throw error;
const storage = client.storage.from('blog-heroes');
async function list(prefix = '') {
  const result = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storage.list(prefix, { limit: 100, offset });
    if (error) throw error;
    for (const object of data) {
      const name = prefix ? `${prefix}/${object.name}` : object.name;
      if (object.id) result.push({ ...object, name });
      else result.push(...await list(name));
    }
    if (data.length < 100) return result;
  }
}
const objects = await list();
await fs.mkdir('.image-migrations/originals', { recursive: true });
const assets = [];
for (const object of objects) {
  const url = storage.getPublicUrl(object.name).data.publicUrl;
  const id = createHash('sha256').update(object.name).digest('hex').slice(0, 20);
  const localPath = path.resolve('.image-migrations/originals', id + path.extname(object.name));
  let bytes;
  try { bytes = await fs.readFile(localPath); }
  catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(localPath, bytes);
  }
  const m = await sharp(bytes, { animated: true }).metadata();
  const refs = posts.filter(p => p.hero_image_path === object.name || p.hero_slider_image_paths.includes(object.name) || (p.content || '').includes(url) || (p.content_sq || '').includes(url));
  assets.push({ id, oldPath: object.name, oldUrl: url, localPath, beforeBytes: bytes.length, format: m.format, width: m.width, height: m.pageHeight || m.height, pages: m.pages || 1, modes: [...new Set(refs.map(p => p.hero_media_mode))], slugs: refs.map(p => p.slug) });
}
const inventory = { createdAt: new Date().toISOString(), projectUrl, bucket: 'blog-heroes', posts, assets };
await fs.writeFile('.image-migrations/inventory.json', JSON.stringify(inventory, null, 2));
console.log(JSON.stringify({ posts: posts.length, objects: assets.length, totalBytes: assets.reduce((s,a)=>s+a.beforeBytes,0), assets: assets.map(({oldPath, beforeBytes, width, height, format, modes, slugs})=>({name:oldPath.split('/').at(-1),beforeBytes,width,height,format,modes,referenced:slugs.length})).sort((a,b)=>b.beforeBytes-a.beforeBytes) }, null, 2));

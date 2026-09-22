import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { optimizeBlogImage, BLOG_IMAGE_CACHE_CONTROL } from '../lib/optimize-blog-image.ts';
import { digest, pickFields, updatePostReferences, verifyImage } from './image-migration-utils.mjs';

const { values: args } = parseArgs({ options: { prepare: {type:'boolean'}, apply: {type:'boolean'}, rollback: {type:'boolean'}, slug: {type:'string'} } });
if ([args.prepare,args.apply,args.rollback].filter(Boolean).length !== 1) throw new Error('Choose --prepare, --apply or --rollback');
const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (new URL(projectUrl).hostname !== 'vwrclmzvyrzvdoirsmpl.supabase.co') throw new Error('Unexpected project');
const folder = '.image-migrations';
const manifestPath = path.join(folder, 'manifest.json');
await fs.mkdir(path.join(folder,'optimized'), {recursive:true});
const lock = await fs.open(`${manifestPath}.lock`, 'wx');
const save = async manifest => { await fs.writeFile(`${manifestPath}.tmp`, JSON.stringify(manifest,null,2)); await fs.rename(`${manifestPath}.tmp`,manifestPath); };
try {
  let manifest;
  if (args.prepare) {
    try { await fs.access(manifestPath); throw new Error('Manifest already exists; use apply to resume'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    const inventory = JSON.parse(await fs.readFile(path.join(folder,'inventory.json'),'utf8'));
    if (inventory.projectUrl !== projectUrl) throw new Error('Wrong inventory project');
    manifest = { version:1, projectUrl, bucket:'blog-heroes', createdAt:new Date().toISOString(), assets:[], references:[] };
    for (const asset of inventory.assets) {
      if (!asset.slugs.length) continue;
      const original = await fs.readFile(asset.localPath);
      const image = await optimizeBlogImage(original, asset.modes.includes('scroll') ? 'scroll' : 'slider');
      // Avoid replacing already-efficient existing assets with larger objects.
      if (image.buffer.length >= original.length) { manifest.assets.push({...asset,status:'unchanged',afterBytes:original.length,animated:image.animated}); continue; }
      const newPath = `${asset.oldPath.split('/')[0]}/optimized/v1/${randomUUID()}.${image.extension}`;
      const outputPath = path.resolve(folder,'optimized',`${asset.id}.${image.extension}`);
      await fs.writeFile(outputPath, image.buffer);
      manifest.assets.push({...asset,outputPath,newPath,newUrl:`${projectUrl}/storage/v1/object/public/blog-heroes/${newPath}`,beforeBytes:original.length,originalSha256:digest(original),afterBytes:image.buffer.length,sha256:digest(image.buffer),contentType:image.contentType,width:image.width,height:image.height,animated:image.animated,status:'prepared'});
    }
    const mapping = new Map(manifest.assets.filter(a=>a.newPath).flatMap(a=>[[a.oldPath,a.newPath],[a.oldUrl,a.newUrl]]));
    for (const post of inventory.posts) {
      const before = pickFields(post);
      const after = {...before};
      for (const field of ['hero_image_path','hero_image_url']) after[field] = mapping.get(before[field]) || before[field];
      for (const field of ['hero_slider_image_paths','hero_slider_image_urls']) after[field] = before[field].map(v=>mapping.get(v)||v);
      for (const field of ['content','content_sq']) {
        for (const asset of manifest.assets.filter(a=>a.newUrl)) if (after[field]) after[field] = after[field].split(asset.oldUrl).join(asset.newUrl);
      }
      manifest.references.push({id:post.id,slug:post.slug,before,after,status:'pending'});
    }
    await save(manifest);
  } else {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Set SUPABASE_SERVICE_ROLE_KEY locally; no changes made');
    manifest = JSON.parse(await fs.readFile(manifestPath,'utf8'));
    if (manifest.version !== 1 || manifest.projectUrl !== projectUrl || manifest.bucket !== 'blog-heroes') throw new Error('Manifest target mismatch');
    const client = createClient(projectUrl,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
    const selected = manifest.references.filter(r=>!args.slug||r.slug===args.slug);
    if (!selected.length) throw new Error('No matching posts');
    if (args.apply && selected.some(r=>r.status==='rolled-back')) throw new Error('Rolled-back manifests cannot be reapplied');
    if (args.apply) {
      for (const asset of manifest.assets.filter(a=>a.newPath&&a.slugs.some(slug=>selected.some(r=>r.slug===slug)))) {
        if (asset.status !== 'verified') {
          const bytes = await fs.readFile(asset.outputPath);
          if (digest(bytes) !== asset.sha256) throw new Error('Local optimized file changed');
          const {error} = await client.storage.from('blog-heroes').upload(asset.newPath,bytes,{contentType:asset.contentType,cacheControl:BLOG_IMAGE_CACHE_CONTROL,upsert:false});
          if (error && String(error.statusCode)!=='409' && error.error!=='Duplicate') throw error;
        }
        await verifyImage(asset);
        asset.status='verified'; await save(manifest);
      }
    }
    for (const reference of selected) {
      reference.status = await updatePostReferences(client,reference,Boolean(args.rollback));
      await save(manifest);
    }
  }
  console.log(JSON.stringify({assets:manifest.assets.length,statuses:manifest.assets.reduce((s,a)=>(s[a.status]=(s[a.status]||0)+1,s),{}),beforeBytes:manifest.assets.reduce((s,a)=>s+a.beforeBytes,0),afterBytes:manifest.assets.reduce((s,a)=>s+a.afterBytes,0),animated:manifest.assets.filter(a=>a.animated).length,posts:manifest.references.map(({slug,status})=>({slug,status}))},null,2));
  if (manifest.references.some(r=>r.status==='conflict')) process.exitCode=2;
} finally { await lock.close(); await fs.unlink(`${manifestPath}.lock`); }

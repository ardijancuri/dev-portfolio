import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { optimizeBlogImage, prepareBlogUploadBatch } from '../lib/optimize-blog-image.ts';
import { digest, pickFields, updatePostReferences, verifyImage } from '../scripts/image-migration-utils.mjs';

const image = (width,height,channels=3) => sharp({create:{width,height,channels,background:{r:40,g:100,b:200,alpha:0.3}}});
test('large static images resize proportionally with actual WebP MIME',async()=>{
  const result=await optimizeBlogImage(await image(2400,1200).jpeg().toBuffer());
  assert.deepEqual([result.width,result.height,result.contentType],[1600,800,'image/webp']);
});
test('full-page screenshots retain full height and transparent pixels',async()=>{
  const result=await optimizeBlogImage(await image(1250,6200,4).png().toBuffer(),'scroll');
  assert.deepEqual([result.width,result.height],[1250,6200]);
  assert.equal((await sharp(result.buffer).metadata()).hasAlpha,true);
});
test('rotation, metadata stripping, no upscaling and smaller WebP retention',async()=>{
  const rotated=await optimizeBlogImage(await image(120,60).jpeg().withMetadata({orientation:6}).toBuffer());
  assert.deepEqual([rotated.width,rotated.height],[60,120]);
  assert.equal((await sharp(rotated.buffer).metadata()).orientation,undefined);
  const small=await image(100,50).webp({quality:10}).toBuffer();
  assert.deepEqual((await optimizeBlogImage(small)).buffer,small);
});
test('GIF and WebP animation frames remain byte-for-byte unchanged',async()=>{
  for (const format of ['gif','webp']) {
    const data=Buffer.concat([Buffer.alloc(12),Buffer.alloc(12,255)]);
    const bytes=await sharp(data,{raw:{width:2,height:4,channels:3,pageHeight:2}})[format]({delay:[100,100],loop:0}).toBuffer();
    const result=await optimizeBlogImage(bytes);
    assert.equal(result.animated,true);assert.deepEqual(result.buffer,bytes);
  }
});
test('corrupt files, disguised unsupported formats and upload limits are rejected',async()=>{
  await assert.rejects(optimizeBlogImage(Buffer.from('not an image')));
  await assert.rejects(optimizeBlogImage(Buffer.from('<svg width="10" height="10"></svg>')));
  await assert.rejects(optimizeBlogImage(Buffer.alloc(5*1024*1024+1)),/size/);
  await assert.rejects(optimizeBlogImage(Buffer.alloc(15*1024*1024+1),'scroll'),/size/);
  const valid=await image(20,20).jpeg().toBuffer();
  await assert.rejects(optimizeBlogImage(valid.subarray(0,100)));
  const exact=Buffer.concat([valid,Buffer.alloc(5*1024*1024-valid.length)]);
  assert.ok((await optimizeBlogImage(exact)).buffer.length);
  await assert.rejects(prepareBlogUploadBatch(new File([valid],'a.jpg'),[new File(['broken'],'b.png')],'slider'));
});

const before={hero_image_path:'old',hero_image_url:'https://old',hero_media_mode:'slider',hero_slider_image_paths:['a','b'],hero_slider_image_urls:['https://a','https://b'],content:'article',content_sq:null};
const after={...before,hero_image_path:'new',hero_image_url:'https://new',hero_slider_image_paths:['new-a','new-b'],hero_slider_image_urls:['https://new-a','https://new-b']};
function fakeClient(row, concurrent=false) {
  const client = {row,from(){
    let payload;const filters={};
    const query={select(){return payload ? Promise.resolve((()=>{
      if(concurrent) client.row.updated_at='concurrent';
      if(Object.entries(filters).some(([k,v])=>client.row[k]!==v))return {data:[],error:null};
      client.row={...client.row,...payload,updated_at:'after-write'};return {data:[{id:client.row.id}],error:null};
    })()):query;},eq(k,v){filters[k]=v;return query;},maybeSingle(){return Promise.resolve({data:client.row,error:null});},update(p){payload=p;return query;}};
    return query;
  }};
  return client;
}
test('migration preserves array order, reruns safely and rolls back',async()=>{
  const client=fakeClient({id:'1',...before,updated_at:'initial'});
  const ref={id:'1',before,after};
  assert.equal(await updatePostReferences(client,ref),'applied');assert.deepEqual(pickFields(client.row),after);
  assert.equal(await updatePostReferences(client,ref),'applied');
  assert.equal(await updatePostReferences(client,ref,true),'rolled-back');assert.deepEqual(pickFields(client.row),before);
});
test('concurrent media edits and edits between read and write cannot be overwritten',async()=>{
  const client=fakeClient({id:'1',...before,hero_image_url:'edited',updated_at:'initial'});
  assert.equal(await updatePostReferences(client,{id:'1',before,after}),'conflict');
  assert.equal(client.row.hero_image_url,'edited');
  const race=fakeClient({id:'1',...before,updated_at:'initial'},true);
  assert.equal(await updatePostReferences(race,{id:'1',before,after}),'conflict');assert.deepEqual(pickFields(race.row),before);
});
test('public GET must match hash, size, content type and cache lifetime',async()=>{
  const bytes=Buffer.from('verified');const asset={newUrl:'https://example.test/image',sha256:digest(bytes),afterBytes:bytes.length,contentType:'image/webp'};
  const headers={'content-type':'image/webp','cache-control':'public, max-age=31536000'};
  await verifyImage(asset,async()=>new Response(bytes,{headers}));
  await assert.rejects(verifyImage(asset,async()=>new Response('wrong',{headers})),/bytes/);
  await assert.rejects(verifyImage(asset,async()=>new Response(bytes,{headers:{...headers,'cache-control':'max-age=3600'}})),/cache/);
  await assert.rejects(verifyImage(asset,async()=>new Response(bytes,{headers:{...headers,'content-type':'image/png'}})),/type/);
});

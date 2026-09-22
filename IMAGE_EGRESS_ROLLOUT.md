# Portfolio image optimization

The server optimizes both new and replacement blog heroes and slider uploads
with pinned Sharp 0.35.4. Standard images fit inside 1600 × 1600; full-page
scroll captures fit inside 1600 × 16000 without cropping or upscaling. Images
are auto-oriented and encoded as WebP at quality 82. A smaller original within
the dimension bounds is retained. Animated GIF/WebP files are validated and
preserved. Invalid or corrupt uploads fail before any files are uploaded.

Existing input limits remain 5 MiB for standard images and 15 MiB for full-page
captures. Storage paths use a UUID under the authenticated owner's directory,
so replacements never overwrite long-cached objects. The existing one-year
browser cache lifetime and public access policies are preserved.

## September 23, 2026 migration

The 9 existing posts reference 23 images totaling 14,571,299 bytes. Optimized
copies total 2,382,976 bytes, an 83.6% reduction. The three full-page PNGs alone
fell from 11,864,631 to 1,321,060 bytes with their exact dimensions preserved.
No animated files or unreferenced objects were found in the initial inventory.

Woodmak was migrated first and verified on the live site, including scrolling.
All 23 new files then passed GET checks for exact hash, size, MIME type and
`max-age=31536000` before the 9 posts were updated. Original objects remain
available. This measures file-size savings, not yet billed egress savings.

## Local tools and rollback

Node 22.18+ is required for the scripts' TypeScript stripping flag. Configure
the public project URL/key in `.env.local`. Applying or rolling back requires
the existing project secret/service-role key in `SUPABASE_SERVICE_ROLE_KEY`.
Never prefix that key with `NEXT_PUBLIC_` or commit it. The app itself continues
to use the authenticated admin's client and does not need a service key.

```powershell
node --env-file=.env.local scripts/inventory-images.mjs
node --env-file=.env.local --experimental-strip-types scripts/migrate-images.mjs --prepare
node --env-file=.env.local --experimental-strip-types scripts/migrate-images.mjs --apply --slug woodmak-one-website-for-b2b-and-b2c-furniture-sales
node --env-file=.env.local --experimental-strip-types scripts/migrate-images.mjs --apply
```

The inventory, downloaded originals, prepared files and resumable manifest are
in the ignored `.image-migrations/` directory. Keep this folder backed up.
Preparation refuses to overwrite an existing manifest. Apply reruns verify
existing uploads before resuming. Compare-and-swap updates protect concurrent
edits and preserve slider order. A conflict leaves the current post unchanged.

```powershell
node --env-file=.env.local --experimental-strip-types scripts/migrate-images.mjs --rollback
```

Add `--slug` to roll back one post. Rollback only changes posts still matching
the recorded migrated fields, preserves originals and optimized copies, and
refuses to overwrite subsequent edits. A rolled-back manifest cannot be
reapplied. No files are deleted by these migration tools.

## Verification and monitoring

Run `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`.
Tests cover size/format validation, corruption, dimensions, transparency,
orientation, animation, complete upload batches, GET verification, resumability,
rollback and concurrent-edit protection. Verify scroll previews, hero sliders,
lightboxes and Next.js card thumbnails on the live site after rollout.

Observe organization/project cached and uncached egress after 24 hours and
daily for seven days, comparing equivalent traffic. Historical egress remains
unchanged. No recurring monitoring job is installed.

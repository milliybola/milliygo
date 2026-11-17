/**
 * Build'dan keyin out/sitemap.xml va out/robots.txt ni yaratadi:
 * statik sahifalar + API'dagi barcha restoran va do'konlar (rasm bilan).
 * API ishlamasa ham statik sahifalar bilan sitemap yoziladi — build to'xtamaydi.
 *
 *   node scripts/generate-sitemap.mjs            (.env.production'dan o'qiydi)
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

function readEnv(file) {
  if (!existsSync(file)) return {}
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .replace(/^﻿/, '')
      .split(/\r?\n/)
      .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2].replace(/^["']|["']$/g, '')])
  )
}

const env = { ...readEnv('.env.production'), ...process.env }
const API = (env.NEXT_PUBLIC_API_BASE_URL || 'https://mytizim.uz').replace(/\/$/, '')
const SITE = (env.NEXT_PUBLIC_SITE_URL || 'https://www.milliyapp.uz').replace(/\/$/, '')
const OUT = 'out'
const today = new Date().toISOString().slice(0, 10)

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/
const cleanSlug = (s) => {
  const v = String(s || '')
    .trim()
    .toLowerCase()
  return SLUG_RE.test(v) ? v : null
}
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const STATIC = [
  ['/', 'daily', '1.0'],
  ['/restaurants/', 'daily', '0.9'],
  ['/store/', 'daily', '0.9'],
  ['/faq/', 'monthly', '0.4'],
  ['/privacy/', 'yearly', '0.2'],
  ['/terms-of-use/', 'yearly', '0.2'],
]

async function partners(type) {
  try {
    const res = await fetch(`${API}/partner/?partner_type=${type}`, {
      headers: { 'Accept-Language': 'uz' },
    })
    const body = await res.json()
    const list = body?.data?.partners || body?.results || []
    return Array.isArray(list) ? list.filter((p) => p && p.uuid) : []
  } catch (e) {
    console.warn(`[sitemap] ${type} olinmadi:`, e.message)
    return []
  }
}

const urls = STATIC.map(([path, freq, prio]) => ({
  loc: `${SITE}${path}`,
  freq,
  prio,
  lastmod: today,
}))

for (const [type, base] of [
  ['RESTAURANT', '/restaurant/'],
  ['SHOP', '/store/'],
]) {
  for (const p of await partners(type)) {
    const slug = cleanSlug(p.slug) || p.uuid
    // Faqat build'da yaratilgan sahifalar (out/ da mavjud) kiritiladi
    if (!existsSync(`${OUT}${base}${slug}/index.html`)) continue
    const images = [p.banner, p.logo].filter((u) => typeof u === 'string' && /^https?:\/\//.test(u))
    urls.push({
      loc: `${SITE}${base}${slug}/`,
      freq: 'daily',
      prio: '0.8',
      lastmod: today,
      images: [...new Set(images)],
      title: p.name,
    })
  }
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...urls.map((u) =>
    [
      '  <url>',
      `    <loc>${esc(u.loc)}</loc>`,
      `    <lastmod>${u.lastmod}</lastmod>`,
      `    <changefreq>${u.freq}</changefreq>`,
      `    <priority>${u.prio}</priority>`,
      ...(u.images || []).map(
        (img) =>
          `    <image:image><image:loc>${esc(img)}</image:loc><image:title>${esc(u.title)}</image:title></image:image>`
      ),
      '  </url>',
    ].join('\n')
  ),
  '</urlset>',
  '',
].join('\n')

const robots = `User-agent: *
Allow: /
Disallow: /cart/
Disallow: /checkout/
Disallow: /orders/
Disallow: /profile/
Disallow: /favorites/
Disallow: /auth/
Disallow: /delete-account/
Disallow: /search/
Disallow: /jobs/
Disallow: /services/

Sitemap: ${SITE}/sitemap.xml
`

if (!existsSync(OUT)) {
  console.error("[sitemap] out/ papkasi yo'q — avval next build")
  process.exit(1)
}
writeFileSync(`${OUT}/sitemap.xml`, xml)
writeFileSync(`${OUT}/robots.txt`, robots)
console.log(`[sitemap] ${urls.length} ta manzil → ${OUT}/sitemap.xml (${SITE})`)

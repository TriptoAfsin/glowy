// Glowy icon mockups, round 2 (F–I). Run: node design/icons/build-mockups-v2.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const out = join(dirname(fileURLToPath(import.meta.url)), 'mockups-v2')
mkdirSync(out, { recursive: true })

const INK = '#3B2C27'
const sparkle = (x, y, r, fill, o = 1) =>
  `<path opacity="${o}" d="M${x} ${y - r} C ${x + r * 0.14} ${y - r * 0.14} ${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} C ${x + r * 0.14} ${y + r * 0.14} ${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} C ${x - r * 0.14} ${y + r * 0.14} ${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} C ${x - r * 0.14} ${y - r * 0.14} ${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r}Z" fill="${fill}"/>`

const icons = {
  'f-glow-ring': {
    name: 'F · Glow ring',
    note: 'Minimal and modern: one glowing ring on cocoa',
    svg: (p) => `
  <defs>
    <radialGradient id="${p}bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#4A2E2A"/><stop offset="1" stop-color="#24161A"/></radialGradient>
    <linearGradient id="${p}ring" x1=".15" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="#FFF1B8"/><stop offset=".45" stop-color="#FFC75A"/><stop offset="1" stop-color="#FF8F6B"/></linearGradient>
    <radialGradient id="${p}inner" r="50%"><stop offset=".55" stop-color="#FFB85C" stop-opacity="0"/><stop offset=".78" stop-color="#FFB85C" stop-opacity=".28"/><stop offset="1" stop-color="#FFB85C" stop-opacity="0"/></radialGradient>
    <filter id="${p}bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="256" r="232" fill="url(#${p}inner)"/>
  <circle cx="256" cy="256" r="138" fill="none" stroke="url(#${p}ring)" stroke-width="60" opacity=".9" filter="url(#${p}bloom)"/>
  <circle cx="256" cy="256" r="138" fill="none" stroke="url(#${p}ring)" stroke-width="44"/>
  <path d="M170 178 A 120 120 0 0 1 250 130" fill="none" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="10" stroke-linecap="round"/>
  ${sparkle(372, 136, 30, '#FFF6DA')}
  ${sparkle(140, 384, 14, '#FFE3A8', 0.8)}`,
  },

  'g-lettermark': {
    name: 'G · Lettermark',
    note: 'A chunky glowing “g” whose bowl is a ring light',
    svg: (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4DF"/><stop offset="1" stop-color="#FFD9C4"/></linearGradient>
    <linearGradient id="${p}g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#FFD25A"/><stop offset="1" stop-color="#FF8A5C"/></linearGradient>
    <filter id="${p}bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <g opacity=".55" filter="url(#${p}bloom)" fill="none" stroke="#FFB648" stroke-width="64" stroke-linecap="round">
    <circle cx="240" cy="222" r="92"/><path d="M332 140 V 306 C332 384 284 414 232 414 C 196 414 172 404 156 390"/>
  </g>
  <g fill="none" stroke="url(#${p}g)" stroke-width="58" stroke-linecap="round">
    <circle cx="240" cy="222" r="92"/>
    <path d="M332 140 V 306 C332 384 284 414 232 414 C 196 414 172 404 156 390"/>
  </g>
  <circle cx="240" cy="222" r="63" fill="#FFF8EA"/>
  <path d="M190 176 A 72 72 0 0 1 236 154" fill="none" stroke="#FFFFFF" stroke-opacity=".75" stroke-width="10" stroke-linecap="round"/>
  ${sparkle(398, 124, 26, '#FF8A6E')}`,
  },

  'h-catchlight': {
    name: 'H · Catchlight cutie',
    note: 'A happy face with ring-light sparkles in its eyes',
    svg: (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD873"/><stop offset="1" stop-color="#FFAE5E"/></linearGradient>
    <radialGradient id="${p}face" cx="45%" cy="35%" r="75%"><stop offset="0" stop-color="#FFF4E4"/><stop offset="1" stop-color="#FFDCC0"/></radialGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="256" r="216" fill="#FFF3D6" opacity=".35"/>
  <path d="M256 104 C 362 104 420 178 420 268 C 420 360 350 418 256 418 C 162 418 92 360 92 268 C 92 178 150 104 256 104Z" fill="url(#${p}face)"/>
  <g>
    <circle cx="196" cy="262" r="34" fill="${INK}"/><circle cx="316" cy="262" r="34" fill="${INK}"/>
    <circle cx="196" cy="256" r="17" fill="none" stroke="#FFFFFF" stroke-width="7"/>
    <circle cx="316" cy="256" r="17" fill="none" stroke="#FFFFFF" stroke-width="7"/>
    <circle cx="210" cy="278" r="4.5" fill="#FFFFFF"/><circle cx="330" cy="278" r="4.5" fill="#FFFFFF"/>
  </g>
  <path d="M234 322 q22 22 44 0" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
  <ellipse cx="148" cy="318" rx="26" ry="15" fill="#FF8A78" fill-opacity=".5"/>
  <ellipse cx="364" cy="318" rx="26" ry="15" fill="#FF8A78" fill-opacity=".5"/>
  ${sparkle(400, 112, 28, '#FFFFFF')}
  ${sparkle(118, 130, 15, '#FFFFFF', 0.85)}`,
  },

  'i-lens-buddy': {
    name: 'I · Lens buddy',
    note: 'A little webcam with a glowing ring around its lens',
    svg: (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE6D6"/><stop offset="1" stop-color="#FFC9B6"/></linearGradient>
    <linearGradient id="${p}body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF2"/><stop offset="1" stop-color="#FFEBD4"/></linearGradient>
    <linearGradient id="${p}ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE47A"/><stop offset="1" stop-color="#FFA23E"/></linearGradient>
    <radialGradient id="${p}lens" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#6A4A5E"/><stop offset="1" stop-color="#2C1D27"/></radialGradient>
    <filter id="${p}bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <rect x="96" y="128" width="320" height="250" rx="80" fill="url(#${p}body)"/>
  <rect x="96" y="128" width="320" height="250" rx="80" fill="none" stroke="#F3CDB0" stroke-width="6"/>
  <rect x="214" y="378" width="84" height="34" rx="12" fill="#F3CDB0"/>
  <rect x="176" y="404" width="160" height="26" rx="13" fill="#F0BFA0"/>
  <circle cx="256" cy="236" r="84" fill="none" stroke="#FFC24A" stroke-width="34" opacity=".8" filter="url(#${p}bloom)"/>
  <circle cx="256" cy="236" r="84" fill="none" stroke="url(#${p}ring)" stroke-width="26"/>
  <circle cx="256" cy="236" r="62" fill="url(#${p}lens)"/>
  <circle cx="236" cy="214" r="15" fill="#FFFFFF" fill-opacity=".8"/>
  <circle cx="276" cy="256" r="6" fill="#FFFFFF" fill-opacity=".5"/>
  <path d="M238 340 q18 16 36 0" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <ellipse cx="150" cy="330" rx="18" ry="11" fill="#FF8A78" fill-opacity=".5"/>
  <ellipse cx="362" cy="330" rx="18" ry="11" fill="#FF8A78" fill-opacity=".5"/>
  <circle cx="368" cy="166" r="9" fill="#7BD88F"/>
  ${sparkle(420, 96, 22, '#FFFFFF')}`,
  },
}

const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${inner}</svg>`
for (const [slug, icon] of Object.entries(icons)) writeFileSync(join(out, `${slug}.svg`), wrap(icon.svg(`${slug}-`)))

const entries = Object.values(icons)
const colW = 320
const W = colW * entries.length + 60
const H = 640
const nest = (icon, id, x, y, s) =>
  `<g transform="translate(${x} ${y})"><svg width="${s}" height="${s}" viewBox="0 0 512 512">${icon.svg(id)}</svg></g>`
const cells = entries.map((icon, i) => {
  const x = 30 + i * colW
  return `
  ${nest(icon, `b${i}-`, x + 35, 40, 250)}
  <text x="${x + 160}" y="330" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="24" font-weight="700" fill="#2A2420">${icon.name}</text>
  <text x="${x + 160}" y="360" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="14" fill="#6B5D55">${icon.note}</text>
  <rect x="${x + 10}" y="390" width="300" height="110" rx="20" fill="#FBF3E4"/>
  ${nest(icon, `m${i}-`, x + 40, 409, 72)}${nest(icon, `f${i}-`, x + 140, 429, 32)}${nest(icon, `t${i}-`, x + 200, 437, 16)}
  <rect x="${x + 10}" y="510" width="300" height="110" rx="20" fill="#1E1B22"/>
  ${nest(icon, `d${i}-`, x + 40, 529, 72)}${nest(icon, `e${i}-`, x + 140, 549, 32)}${nest(icon, `g${i}-`, x + 200, 557, 16)}`
})
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#FFFBF2"/>${cells.join('')}</svg>`
writeFileSync(join(out, 'sheet.svg'), sheet)
await sharp(Buffer.from(sheet), { density: 144 }).png().toFile(join(out, 'sheet.png'))
console.log('wrote', entries.length, 'mockups + sheet.png to', out)

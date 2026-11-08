// Generates the Glowy icon mockups (SVG each + a comparison sheet PNG).
// Run: node design/icons/build-mockups.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, 'mockups')
mkdirSync(out, { recursive: true })

const INK = '#3B2C27'
const face = (cx, cy, s = 1, { closed = true } = {}) => `
  <g transform="translate(${cx} ${cy}) scale(${s})" stroke="${INK}" stroke-linecap="round" fill="none">
    ${closed
      ? `<path d="M-58 -12 q16 -20 32 0" stroke-width="12"/><path d="M26 -12 q16 -20 32 0" stroke-width="12"/>`
      : `<circle cx="-42" cy="-12" r="11" fill="${INK}" stroke="none"/><circle cx="42" cy="-12" r="11" fill="${INK}" stroke="none"/>
         <circle cx="-38" cy="-17" r="3.6" fill="#FFFFFF" stroke="none"/><circle cx="46" cy="-17" r="3.6" fill="#FFFFFF" stroke="none"/>`}
    <path d="M-20 22 q20 20 40 0" stroke-width="11"/>
    <ellipse cx="-70" cy="22" rx="17" ry="10" fill="#FF8A78" fill-opacity=".55" stroke="none"/>
    <ellipse cx="70" cy="22" rx="17" ry="10" fill="#FF8A78" fill-opacity=".55" stroke="none"/>
  </g>`

const sparkle = (x, y, r, fill) =>
  `<path d="M${x} ${y - r} C ${x + r * 0.12} ${y - r * 0.12} ${x + r * 0.12} ${y - r * 0.12} ${x + r} ${y} C ${x + r * 0.12} ${y + r * 0.12} ${x + r * 0.12} ${y + r * 0.12} ${x} ${y + r} C ${x - r * 0.12} ${y + r * 0.12} ${x - r * 0.12} ${y + r * 0.12} ${x - r} ${y} C ${x - r * 0.12} ${y - r * 0.12} ${x - r * 0.12} ${y - r * 0.12} ${x} ${y - r}Z" fill="${fill}"/>`

/** Each icon is a function of an id prefix so they can share one sheet without id clashes. */
const icons = {
  'a-sunny': {
    name: 'A · Sunny',
    note: 'Classic happy sun, closed smiling eyes',
    svg: (p) => `
  <defs>
    <radialGradient id="${p}bg" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#FFF7E2"/><stop offset="1" stop-color="#FFE2AE"/></radialGradient>
    <radialGradient id="${p}halo" r="50%"><stop offset=".5" stop-color="#FFD05A" stop-opacity=".6"/><stop offset="1" stop-color="#FFD05A" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sun" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFE98C"/><stop offset="1" stop-color="#FFB63A"/></radialGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="262" r="214" fill="url(#${p}halo)"/>
  <g fill="#FFC23F">${[0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => `<rect x="242" y="58" width="28" height="60" rx="14" transform="rotate(${a} 256 262)"/>`).join('')}</g>
  <circle cx="256" cy="262" r="124" fill="url(#${p}sun)"/>
  <ellipse cx="214" cy="206" rx="30" ry="16" fill="#FFFFFF" fill-opacity=".45" transform="rotate(-28 214 206)"/>
  ${face(256, 270, 1)}`,
  },

  'b-ring': {
    name: 'B · Ring buddy',
    note: 'A golden ring light with a tiny face in the middle',
    svg: (p) => `
  <defs>
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9D6"/><stop offset="1" stop-color="#FFD0B8"/></linearGradient>
    <linearGradient id="${p}ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE57A"/><stop offset="1" stop-color="#FFA93A"/></linearGradient>
    <filter id="${p}blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#FFC24A" stroke-width="70" opacity=".75" filter="url(#${p}blur)"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="url(#${p}ring)" stroke-width="58"/>
  <circle cx="256" cy="256" r="121" fill="#FFF6EA"/>
  ${face(256, 262, 0.82, { closed: false })}
  ${sparkle(392, 110, 30, '#FFFFFF')}
  ${sparkle(128, 402, 18, '#FFFFFF')}`,
  },

  'c-bean': {
    name: 'C · Glow bean',
    note: 'A squishy glowing blob mascot with a sparkle',
    svg: (p) => `
  <defs>
    <radialGradient id="${p}bg" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="#FFF4DA"/><stop offset="1" stop-color="#FCDDB0"/></radialGradient>
    <radialGradient id="${p}halo" r="50%"><stop offset=".45" stop-color="#FFC94F" stop-opacity=".7"/><stop offset="1" stop-color="#FFC94F" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}body" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#FFEB94"/><stop offset="1" stop-color="#FFAE3C"/></radialGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="282" r="222" fill="url(#${p}halo)"/>
  <path d="M256 128 C352 128 400 206 398 292 C396 374 334 412 256 412 C178 412 116 374 114 292 C112 206 160 128 256 128Z" fill="url(#${p}body)"/>
  <ellipse cx="200" cy="186" rx="34" ry="18" fill="#FFFFFF" fill-opacity=".55" transform="rotate(-30 200 186)"/>
  ${face(256, 290, 0.95, { closed: false })}
  ${sparkle(384, 132, 34, '#FF8A6E')}
  ${sparkle(140, 120, 16, '#FFFFFF')}`,
  },

  'd-sunrise': {
    name: 'D · Sunrise',
    note: 'A smiling sun peeking over a soft horizon',
    svg: (p) => `
  <defs>
    <linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD9C2"/><stop offset="1" stop-color="#FFF0C9"/></linearGradient>
    <radialGradient id="${p}sun" cx="45%" cy="30%" r="80%"><stop offset="0" stop-color="#FFE88A"/><stop offset="1" stop-color="#FFAF3C"/></radialGradient>
    <clipPath id="${p}clip"><rect width="512" height="512" rx="116"/></clipPath>
  </defs>
  <g clip-path="url(#${p}clip)">
    <rect width="512" height="512" fill="url(#${p}sky)"/>
    <g fill="#FFC64A" opacity=".9">${[-60, -30, 0, 30, 60]
      .map((a) => `<rect x="242" y="64" width="28" height="64" rx="14" transform="rotate(${a} 256 340)"/>`).join('')}</g>
    <circle cx="256" cy="340" r="150" fill="url(#${p}sun)"/>
    ${face(256, 316, 1.05)}
    <path d="M0 404 C 90 376 170 380 256 398 C 342 416 422 410 512 384 L512 512 L0 512Z" fill="#FFF6E6"/>
    <path d="M0 448 C 110 428 200 436 290 452 C 380 468 450 462 512 448 L512 512 L0 512Z" fill="#FFE7C7"/>
  </g>`,
  },

  'e-sparkle': {
    name: 'E · Sparkle',
    note: 'A chubby four-point shine with a face',
    svg: (p) => `
  <defs>
    <radialGradient id="${p}bg" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#FFF8E6"/><stop offset="1" stop-color="#FFE0B6"/></radialGradient>
    <linearGradient id="${p}star" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE57C"/><stop offset="1" stop-color="#FFAC3A"/></linearGradient>
    <filter id="${p}blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="20"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <path d="M256 70 C 282 200 312 230 442 256 C 312 282 282 312 256 442 C 230 312 200 282 70 256 C 200 230 230 200 256 70Z" fill="#FFC64A" opacity=".7" filter="url(#${p}blur)"/>
  <path d="M256 70 C 282 200 312 230 442 256 C 312 282 282 312 256 442 C 230 312 200 282 70 256 C 200 230 230 200 256 70Z" fill="url(#${p}star)" stroke="url(#${p}star)" stroke-width="26" stroke-linejoin="round"/>
  ${face(256, 262, 0.62)}
  ${sparkle(402, 118, 26, '#FF8A6E')}
  ${sparkle(118, 398, 20, '#FFFFFF')}`,
  },
}

const wrap = (inner, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" ${extra}>${inner}</svg>`

for (const [slug, icon] of Object.entries(icons)) {
  writeFileSync(join(out, `${slug}.svg`), wrap(icon.svg(`${slug}-`)))
}

// ---- comparison sheet: big + home-screen + favicon size, on light and dark ----
const entries = Object.entries(icons)
const colW = 300
const W = colW * entries.length + 60
const H = 640
const cells = entries.map(([, icon], i) => {
  const x = 30 + i * colW
  const inner = icon.svg(`s${i}-`)
  return `
  <g transform="translate(${x + 25} 40)"><svg width="250" height="250" viewBox="0 0 512 512">${inner}</svg></g>
  <text x="${x + 150}" y="330" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="24" font-weight="700" fill="#2A2420">${icon.name}</text>
  <text x="${x + 150}" y="360" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="14" fill="#6B5D55">${icon.note}</text>
  <rect x="${x + 10}" y="390" width="280" height="110" rx="20" fill="#FBF3E4"/>
  <g transform="translate(${x + 36} 409)"><svg width="72" height="72" viewBox="0 0 512 512">${icon.svg(`m${i}-`)}</svg></g>
  <g transform="translate(${x + 130} 429)"><svg width="32" height="32" viewBox="0 0 512 512">${icon.svg(`f${i}-`)}</svg></g>
  <g transform="translate(${x + 186} 437)"><svg width="16" height="16" viewBox="0 0 512 512">${icon.svg(`t${i}-`)}</svg></g>
  <rect x="${x + 10}" y="510" width="280" height="110" rx="20" fill="#1E1B22"/>
  <g transform="translate(${x + 36} 529)"><svg width="72" height="72" viewBox="0 0 512 512">${icon.svg(`d${i}-`)}</svg></g>
  <g transform="translate(${x + 130} 549)"><svg width="32" height="32" viewBox="0 0 512 512">${icon.svg(`e${i}-`)}</svg></g>
  <g transform="translate(${x + 186} 557)"><svg width="16" height="16" viewBox="0 0 512 512">${icon.svg(`g${i}-`)}</svg></g>`
})
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#FFFBF2"/>${cells.join('')}</svg>`
writeFileSync(join(out, 'sheet.svg'), sheet)
await sharp(Buffer.from(sheet), { density: 144 }).png().toFile(join(out, 'sheet.png'))
console.log('wrote', entries.length, 'mockups + sheet.png to', out)

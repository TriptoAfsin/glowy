// Glowy icon mockups, round 3 — "blue sunshine", with 3D depth (J–M).
// Run: node design/icons/build-mockups-v3.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const out = join(dirname(fileURLToPath(import.meta.url)), 'mockups-v3')
mkdirSync(out, { recursive: true })

const INK = '#1F2A44'

const sparkle = (x, y, r, fill, o = 1) =>
  `<path opacity="${o}" d="M${x} ${y - r} C ${x + r * 0.14} ${y - r * 0.14} ${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} C ${x + r * 0.14} ${y + r * 0.14} ${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} C ${x - r * 0.14} ${y + r * 0.14} ${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} C ${x - r * 0.14} ${y - r * 0.14} ${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r}Z" fill="${fill}"/>`

const face = (cx, cy, s, ink = INK, blush = '#FF9AA8') => `
  <g transform="translate(${cx} ${cy}) scale(${s})" stroke="${ink}" stroke-linecap="round" fill="none">
    <path d="M-58 -12 q16 -20 32 0" stroke-width="12"/><path d="M26 -12 q16 -20 32 0" stroke-width="12"/>
    <path d="M-20 22 q20 20 40 0" stroke-width="11"/>
    <ellipse cx="-70" cy="22" rx="17" ry="10" fill="${blush}" fill-opacity=".6" stroke="none"/>
    <ellipse cx="70" cy="22" rx="17" ry="10" fill="${blush}" fill-opacity=".6" stroke="none"/>
  </g>`

/** Capsule rays. `shade` adds a darker underside so each ray reads as a little 3D pill. */
const rays = (cx, cy, inner, len, w, fill, n = 8, shade) =>
  Array.from({ length: n }, (_, i) => (360 / n) * i)
    .map(
      (a) => `<g transform="rotate(${a} ${cx} ${cy})">
        ${shade ? `<rect x="${cx - w / 2}" y="${cy - inner - len + 4}" width="${w}" height="${len}" rx="${w / 2}" fill="${shade}"/>` : ''}
        <rect x="${cx - w / 2}" y="${cy - inner - len}" width="${w}" height="${len}" rx="${w / 2}" fill="${fill}"/>
        <rect x="${cx - w / 2 + w * 0.22}" y="${cy - inner - len + w * 0.25}" width="${w * 0.22}" height="${len * 0.45}" rx="${w * 0.11}" fill="#FFFFFF" fill-opacity=".55"/>
      </g>`,
    )
    .join('')

/** Shared 3D kit: soft drop shadow, sphere shading (light top-left, shade bottom-right), gloss cap. */
const kit = (p, shadowColor) => `
    <filter id="${p}shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="18" stdDeviation="16" flood-color="${shadowColor}" flood-opacity=".42"/></filter>
    <filter id="${p}soft" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="${shadowColor}" flood-opacity=".3"/></filter>
    <radialGradient id="${p}shade" cx="32%" cy="26%" r="85%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#7A3B00" stop-opacity=".28"/></radialGradient>`
const gloss = (cx, cy, r, o = 0.7) =>
  `<ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.45}" rx="${r * 0.4}" ry="${r * 0.18}" fill="#FFFFFF" fill-opacity="${o}" transform="rotate(-26 ${cx - r * 0.3} ${cy - r * 0.45})"/>
   <circle cx="${cx + r * 0.05}" cy="${cy - r * 0.62}" r="${r * 0.05}" fill="#FFFFFF" fill-opacity="${o}"/>`

/** A 3D sun ball: shadowed, shaded, glossy. */
const sunBall = (p, cx, cy, r, grad) => `
  <g filter="url(#${p}shadow)"><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${grad})"/></g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${p}shade)"/>
  ${gloss(cx, cy, r)}`

const icons = {
  'j-clear-sky': {
    name: 'J · Clear sky',
    note: 'A glossy 3D sun floating in a sky-blue tile',
    svg: (p) => `
  <defs>${kit(p, '#1D5FA8')}
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6EC1FF"/><stop offset="1" stop-color="#D2EDFF"/></linearGradient>
    <radialGradient id="${p}halo" r="50%"><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".75"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sun" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#FFF8D0"/><stop offset=".55" stop-color="#FFD866"/><stop offset="1" stop-color="#FFB536"/></radialGradient>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="250" r="224" fill="url(#${p}halo)"/>
  <g filter="url(#${p}soft)">${rays(256, 250, 146, 54, 30, '#FFE27A', 8, '#F2B43C')}</g>
  ${sunBall(p, 256, 250, 124, `${p}sun`)}
  ${face(256, 262, 1)}
  ${sparkle(412, 104, 22, '#FFFFFF')}
  ${sparkle(100, 420, 14, '#FFFFFF', 0.85)}`,
  },

  'k-blue-sun': {
    name: 'K · Blue sun',
    note: 'A sun of cool blue light, glowing on night blue',
    svg: (p) => `
  <defs>${kit(p, '#000814')}
    <radialGradient id="${p}bg" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="#22428A"/><stop offset="1" stop-color="#0C1736"/></radialGradient>
    <radialGradient id="${p}halo" r="50%"><stop offset=".35" stop-color="#8FD3FF" stop-opacity=".6"/><stop offset="1" stop-color="#8FD3FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="${p}sun" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#F4FCFF"/><stop offset=".5" stop-color="#9EDCFF"/><stop offset="1" stop-color="#4C97FF"/></radialGradient>
    <filter id="${p}bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="250" r="232" fill="url(#${p}halo)"/>
  <g filter="url(#${p}bloom)" opacity=".85">${rays(256, 250, 142, 60, 32, '#8FD3FF', 12)}</g>
  ${rays(256, 250, 142, 58, 22, '#D4F1FF', 12, '#6FB3F5')}
  <g filter="url(#${p}bloom)"><circle cx="256" cy="250" r="128" fill="#8FD3FF" opacity=".7"/></g>
  <circle cx="256" cy="250" r="122" fill="url(#${p}sun)"/>
  <circle cx="256" cy="250" r="122" fill="url(#${p}shade)" opacity=".6"/>
  ${gloss(256, 250, 122, 0.8)}
  ${face(256, 262, 1, '#1E3A7A', '#FF9AB8')}
  ${sparkle(104, 108, 18, '#D4F1FF', 0.95)}
  ${sparkle(414, 408, 14, '#D4F1FF', 0.85)}
  <circle cx="420" cy="128" r="4" fill="#D4F1FF"/><circle cx="92" cy="404" r="3" fill="#D4F1FF"/>`,
  },

  'l-sky-ring': {
    name: 'L · Sky ring',
    note: 'A chunky 3D ring light around a little golden sun',
    svg: (p) => `
  <defs>${kit(p, '#1D5FA8')}
    <linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF8FF"/><stop offset="1" stop-color="#B6DDFF"/></linearGradient>
    <linearGradient id="${p}ring" x1=".1" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="#F6FCFF"/><stop offset=".45" stop-color="#7FCBFF"/><stop offset="1" stop-color="#3A7EF0"/></linearGradient>
    <radialGradient id="${p}sun" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#FFF8D0"/><stop offset=".6" stop-color="#FFD866"/><stop offset="1" stop-color="#FFB536"/></radialGradient>
    <filter id="${p}bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>
  <rect width="512" height="512" rx="116" fill="url(#${p}bg)"/>
  <circle cx="256" cy="250" r="140" fill="none" stroke="#7FCBFF" stroke-width="70" opacity=".75" filter="url(#${p}bloom)"/>
  <g filter="url(#${p}shadow)"><circle cx="256" cy="250" r="140" fill="none" stroke="url(#${p}ring)" stroke-width="54"/></g>
  <circle cx="256" cy="250" r="163" fill="none" stroke="#1D5FA8" stroke-opacity=".18" stroke-width="8"/>
  <circle cx="256" cy="250" r="117" fill="none" stroke="#FFFFFF" stroke-opacity=".6" stroke-width="5"/>
  <path d="M160 176 A 120 120 0 0 1 236 132" fill="none" stroke="#FFFFFF" stroke-opacity=".9" stroke-width="12" stroke-linecap="round"/>
  ${sunBall(p, 256, 250, 70, `${p}sun`)}
  ${face(256, 256, 0.56)}
  ${sparkle(398, 116, 28, '#FFFFFF')}
  ${sparkle(122, 400, 14, '#FFFFFF', 0.9)}`,
  },

  'm-sunny-cloud': {
    name: 'M · Sun and cloud',
    note: 'A cheeky 3D sun peeking over a puffy cloud',
    svg: (p) => `
  <defs>${kit(p, '#1D5FA8')}
    <linearGradient id="${p}bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4FAEFF"/><stop offset="1" stop-color="#ACDDFF"/></linearGradient>
    <radialGradient id="${p}sun" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#FFF8D0"/><stop offset=".55" stop-color="#FFD866"/><stop offset="1" stop-color="#FFB536"/></radialGradient>
    <radialGradient id="${p}halo" r="50%"><stop offset=".5" stop-color="#FFF2B0" stop-opacity=".6"/><stop offset="1" stop-color="#FFF2B0" stop-opacity="0"/></radialGradient>
    <linearGradient id="${p}cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".7" stop-color="#EAF4FF"/><stop offset="1" stop-color="#C9E2FA"/></linearGradient>
    <clipPath id="${p}clip"><rect width="512" height="512" rx="116"/></clipPath>
  </defs>
  <g clip-path="url(#${p}clip)">
    <rect width="512" height="512" fill="url(#${p}bg)"/>
    <circle cx="300" cy="206" r="200" fill="url(#${p}halo)"/>
    <g filter="url(#${p}soft)">${rays(300, 206, 128, 50, 26, '#FFE27A', 8, '#F2B43C')}</g>
    ${sunBall(p, 300, 206, 108, `${p}sun`)}
    ${face(300, 210, 0.85)}
    <g filter="url(#${p}shadow)">
      <path d="M70 420 C 52 420 40 400 48 382 C 54 366 72 358 88 362 C 92 326 124 304 160 312 C 176 276 222 264 254 286 C 276 268 316 274 330 304 C 362 296 392 320 390 352 C 414 352 432 372 428 394 C 426 410 412 420 396 420 Z" fill="url(#${p}cloud)"/>
    </g>
    <path d="M120 318 C 132 300 154 296 170 304" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>
    <path d="M214 286 C 228 274 246 274 258 282" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="172" cy="382" rx="14" ry="8" fill="#FF9AA8" fill-opacity=".5"/>
    <ellipse cx="288" cy="382" rx="14" ry="8" fill="#FF9AA8" fill-opacity=".5"/>
    <circle cx="202" cy="370" r="7" fill="${INK}"/><circle cx="258" cy="370" r="7" fill="${INK}"/>
    <path d="M220 386 q10 10 20 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    ${sparkle(110, 112, 20, '#FFFFFF')}
  </g>`,
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
  <text x="${x + 160}" y="330" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="24" font-weight="700" fill="#1F2A44">${icon.name}</text>
  <text x="${x + 160}" y="360" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial" font-size="14" fill="#55627A">${icon.note}</text>
  <rect x="${x + 10}" y="390" width="300" height="110" rx="20" fill="#EEF5FB"/>
  ${nest(icon, `m${i}-`, x + 40, 409, 72)}${nest(icon, `f${i}-`, x + 140, 429, 32)}${nest(icon, `t${i}-`, x + 200, 437, 16)}
  <rect x="${x + 10}" y="510" width="300" height="110" rx="20" fill="#161B26"/>
  ${nest(icon, `d${i}-`, x + 40, 529, 72)}${nest(icon, `e${i}-`, x + 140, 549, 32)}${nest(icon, `g${i}-`, x + 200, 557, 16)}`
})
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#F8FBFF"/>${cells.join('')}</svg>`
writeFileSync(join(out, 'sheet.svg'), sheet)
await sharp(Buffer.from(sheet), { density: 144 }).png().toFile(join(out, 'sheet.png'))
console.log('wrote', entries.length, 'mockups + sheet.png to', out)

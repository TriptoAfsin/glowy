// Builds every Glowy icon from the chosen mockup (K · Blue sun).
// Run: npm run icons
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const src = join(root, 'src', 'assets')
mkdirSync(pub, { recursive: true })
mkdirSync(src, { recursive: true })

const sparkle = (x, y, r, fill, o = 1) =>
  `<path opacity="${o}" d="M${x} ${y - r} C ${x + r * 0.14} ${y - r * 0.14} ${x + r * 0.14} ${y - r * 0.14} ${x + r} ${y} C ${x + r * 0.14} ${y + r * 0.14} ${x + r * 0.14} ${y + r * 0.14} ${x} ${y + r} C ${x - r * 0.14} ${y + r * 0.14} ${x - r * 0.14} ${y + r * 0.14} ${x - r} ${y} C ${x - r * 0.14} ${y - r * 0.14} ${x - r * 0.14} ${y - r * 0.14} ${x} ${y - r}Z" fill="${fill}"/>`

const rays = (cx, cy, inner, len, w, fill, n, shade) =>
  Array.from({ length: n }, (_, i) => (360 / n) * i)
    .map(
      (a) => `<g transform="rotate(${a} ${cx} ${cy})">
        ${shade ? `<rect x="${cx - w / 2}" y="${cy - inner - len + 4}" width="${w}" height="${len}" rx="${w / 2}" fill="${shade}"/>` : ''}
        <rect x="${cx - w / 2}" y="${cy - inner - len}" width="${w}" height="${len}" rx="${w / 2}" fill="${fill}"/>
        <rect x="${cx - w / 2 + w * 0.22}" y="${cy - inner - len + w * 0.25}" width="${w * 0.22}" height="${len * 0.45}" rx="${w * 0.11}" fill="#FFFFFF" fill-opacity=".55"/>
      </g>`,
    )
    .join('')

const defs = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="78%"><stop offset="0" stop-color="#22428A"/><stop offset="1" stop-color="#0C1736"/></radialGradient>
    <radialGradient id="halo" r="50%"><stop offset=".35" stop-color="#8FD3FF" stop-opacity=".6"/><stop offset="1" stop-color="#8FD3FF" stop-opacity="0"/></radialGradient>
    <radialGradient id="sun" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#F4FCFF"/><stop offset=".5" stop-color="#9EDCFF"/><stop offset="1" stop-color="#4C97FF"/></radialGradient>
    <radialGradient id="shade" cx="32%" cy="26%" r="85%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0B2A6B" stop-opacity=".3"/></radialGradient>
    <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>`

/** The sun alone (no tile) — also the in-app mascot. */
const art = `
  <circle cx="256" cy="250" r="232" fill="url(#halo)"/>
  <g filter="url(#bloom)" opacity=".85">${rays(256, 250, 142, 60, 32, '#8FD3FF', 12)}</g>
  ${rays(256, 250, 142, 58, 22, '#D4F1FF', 12, '#6FB3F5')}
  <g filter="url(#bloom)"><circle cx="256" cy="250" r="128" fill="#8FD3FF" opacity=".7"/></g>
  <circle cx="256" cy="250" r="122" fill="url(#sun)"/>
  <circle cx="256" cy="250" r="122" fill="url(#shade)"/>
  <ellipse cx="219" cy="195" rx="49" ry="22" fill="#FFFFFF" fill-opacity=".8" transform="rotate(-26 219 195)"/>
  <circle cx="262" cy="174" r="6" fill="#FFFFFF" fill-opacity=".8"/>
  <g transform="translate(256 262)" stroke="#1E3A7A" stroke-linecap="round" fill="none">
    <path d="M-58 -12 q16 -20 32 0" stroke-width="12"/><path d="M26 -12 q16 -20 32 0" stroke-width="12"/>
    <path d="M-20 22 q20 20 40 0" stroke-width="11"/>
    <ellipse cx="-70" cy="22" rx="17" ry="10" fill="#FF9AB8" fill-opacity=".6" stroke="none"/>
    <ellipse cx="70" cy="22" rx="17" ry="10" fill="#FF9AB8" fill-opacity=".6" stroke="none"/>
  </g>`

const stars = `
  ${sparkle(104, 108, 18, '#D4F1FF', 0.95)}
  ${sparkle(414, 408, 14, '#D4F1FF', 0.85)}
  <circle cx="420" cy="128" r="4" fill="#D4F1FF"/><circle cx="92" cy="404" r="3" fill="#D4F1FF"/>`

const rounded = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" rx="116" fill="url(#bg)"/>${art}${stars}</svg>`

const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${defs}
  <rect width="512" height="512" fill="url(#bg)"/>
  <g transform="translate(256 256) scale(.74) translate(-256 -250)">${art}</g></svg>`

const mascot = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 18 464 464">${defs}${art}</svg>`

writeFileSync(join(pub, 'favicon.svg'), rounded)
writeFileSync(join(pub, 'icon.svg'), rounded)
writeFileSync(join(src, 'blue-sun.svg'), mascot)

const png = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: Math.max(72, (size / 512) * 72 * 2) })
    .resize(size, size)
    .png()
    .toFile(join(pub, file))

await Promise.all([
  png(rounded, 64, 'pwa-64x64.png'),
  png(rounded, 192, 'pwa-192x192.png'),
  png(rounded, 512, 'pwa-512x512.png'),
  png(maskable, 512, 'maskable-icon-512x512.png'),
  png(maskable, 180, 'apple-touch-icon-180x180.png'),
  png(rounded, 256, 'icon-256.png'),
])
console.log('icons written to public/ and src/assets/blue-sun.svg')

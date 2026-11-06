import { useEffect, useRef } from 'react'

// Pixel-art lantern night: sky lanterns drifting up over a sleeping town, diyas along the bank and floating on
// the river, and a moon glittering on the water. Drawn at ~320 art pixels on the long side, then upscaled.

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const pack = ([r, g, b]) => 0xff000000 | (b << 16) | (g << 8) | r // ImageData bytes are RGBA, i.e. ABGR as a little-endian uint32
const pal = (...hs) => hs.map((h) => pack(rgb(h)))

const SKY = pal('#05061a', '#080b24', '#0c112f', '#11183b', '#172047', '#1e2752', '#282e5c', '#353463', '#463a68', '#5a406b', '#70476b', '#8a4f68')
const MOON = pal('#fffbe8', '#f4ecd0', '#e2d6b4', '#c9bc9c', '#a89c80') // lit edge to shadowed edge
const LANTERN = pal('#c2451f', '#ef7a2a', '#ffb347', '#ffe08a') // paper top in shadow down to the bright open mouth
const FLAME = pal('#fff3b0', '#ffd76b', '#ff9a3c')
const [HALO, GLOW, WHITE, STAR, TOWN, BANK, CUP, WINDOW, DIM] = pal('#232c5e', '#4a2638', '#ffffff', '#b8c4ff', '#0b0d24', '#070816', '#8a4a24', '#ffcf6b', '#b8743a')
const WATER = rgb('#03041a')
const CRATERS = [[-0.3, -0.2, 0.22], [0.35, 0.1, 0.16], [0.05, 0.45, 0.12], [-0.42, 0.35, 0.1]] // x, y, radius as shares of the moon's radius

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const dither = (x, y, f) => f > BAYER[(y & 3) * 4 + (x & 3)]
// colour at f (0..1) along a ramp, ordered-dithered between neighbours the way pixel artists blend
const ramp = (cols, f, x, y) => {
  const p = Math.min(Math.max(f, 0), 1) * (cols.length - 1)
  const i = Math.floor(p)
  return cols[Math.min(i + (dither(x, y, p - i) ? 1 : 0), cols.length - 1)]
}
const rnd = (a, b) => a + Math.random() * (b - a)
const hash = (n) => {
  const s = Math.sin(n * 91.345) * 43758.5453
  return s - Math.floor(s)
}

// sizes the canvas to the screen and returns a draw(dt) that advances and paints one frame
function scene(canvas) {
  const s = Math.max(innerWidth, innerHeight) / 320 // screen px per art pixel
  const W = (canvas.width = Math.ceil(innerWidth / s))
  const H = (canvas.height = Math.ceil(innerHeight / s))
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const px = new Uint32Array(img.data.buffer)
  const M = Math.min(W, H) // sizes scale off the short side so phones and desktops look alike
  const HZ = Math.round(H * 0.7) // horizon row
  const R = Math.max(5, Math.round(M * 0.07)) // moon radius
  const mx = Math.round(W * 0.76)
  const my = Math.round(HZ * 0.24)
  const put = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = c
  }

  // a row of rooftops, with the odd dome and spire, standing on a dark riverbank two rows thick
  const roof = new Array(W).fill(2)
  const windows = []
  for (let x = 0; x < W; ) {
    const w = Math.round(rnd(4, 12))
    const h = Math.round(M * rnd(0.03, 0.11))
    const dome = w >= 7 && Math.random() < 0.25
    for (let dx = 0; dx < w && x + dx < W; dx++) {
      const off = dx + 0.5 - w / 2
      roof[x + dx] = h + (dome ? Math.round(Math.sqrt(Math.max(0, (w / 2) ** 2 - off ** 2))) + (Math.abs(off) < 1 ? 3 : 0) : 0)
    }
    for (let wy = 4; wy < h - 1; wy += 3)
      for (let wx = 1; wx < w - 1; wx += 2)
        if (Math.random() < 0.22) windows.push({ x: x + wx, y: HZ - wy, col: Math.random() < 0.6 ? WINDOW : DIM, seed: rnd(0, 99) })
    x += w + (Math.random() < 0.3 ? Math.round(rnd(1, 4)) : 0)
  }

  // everything that never moves: dithered sky, the moon and its halo, and the town's silhouette
  const still = new Uint32Array(W * HZ)
  for (let y = 0; y < HZ; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - mx, y - my) - R
      const crater = CRATERS.some(([cx, cy, cr]) => Math.hypot(x - mx - cx * R, y - my - cy * R) < cr * R)
      still[y * W + x] =
        y >= HZ - 2 ? BANK
        : y >= HZ - roof[x] ? TOWN
        : d < 0 ? ramp(MOON, 0.15 + (x - mx + y - my) / (3 * R) + (crater ? 0.3 : 0), x, y) // lit from the top left
        : d < 7 && dither(x, y, 0.55 * (1 - d / 7)) ? HALO
        : ramp(SKY, (y / HZ) ** 1.5, x, y)
    }

  const stars = Array.from({ length: Math.round((W * HZ) / 600) }, () => ({
    x: Math.floor(rnd(0, W)),
    y: Math.floor(HZ * 0.6 * Math.random() ** 1.5),
    phase: rnd(0, 7),
    speed: rnd(0.5, 2),
  })).filter((st) => Math.hypot(st.x - mx, st.y - my) > R + 8)

  const lamps = Array.from({ length: Math.floor(W / 7) }, (_, i) => ({ x: i * 7 + Math.floor(rnd(0, 4)), seed: rnd(0, 99) }))

  // mostly small, far-off lanterns; nearer ones are bigger and rise faster
  const launch = (y) => {
    const w = 1 + Math.floor(Math.random() ** 2 * 3)
    return { x: rnd(0, W), y, w, h: w + 1, speed: HZ * (0.02 + w * 0.018), sway: rnd(0.3, 0.8), phase: rnd(0, 7), seed: rnd(0, 99) }
  }
  const lanterns = Array.from({ length: Math.round((W * HZ) / 1400) }, () => launch(rnd(0, HZ)))

  const rows = H - HZ
  // diyas floating downriver; z runs from 0 at the horizon to 1 at the viewer
  const boats = Array.from({ length: Math.max(4, Math.round(W / 40)) }, () => ({ x: rnd(0, W), z: Math.random(), seed: rnd(0, 99) }))

  let t = 0

  return (dt) => {
    t += dt
    px.set(still)

    for (const st of stars) {
      const b = Math.sin(t * st.speed + st.phase)
      if (b > -0.3) put(st.x, st.y, b > 0.7 ? WHITE : STAR)
    }

    // a few windows go dark and light up again, every few seconds
    for (const w of windows) if (hash(w.seed + Math.floor(t * 0.2 + w.seed)) > 0.08) put(w.x, w.y, w.col)

    for (const l of lanterns) {
      l.y -= l.speed * dt
      if (l.y < -l.h - 4) Object.assign(l, launch(HZ + rnd(0, 10))) // gone into the dark; send up another from the bank
      const x0 = Math.round(l.x + Math.sin(t * l.sway + l.phase) * 1.5 * l.w)
      const y0 = Math.round(l.y)
      if (l.w > 1) {
        const r = l.w + 2
        for (let dy = -r; dy <= r; dy++)
          for (let dx = -r; dx <= r; dx++) {
            const d = Math.hypot(dx, dy)
            const x = x0 + Math.floor(l.w / 2) + dx
            const y = y0 + Math.floor(l.h / 2) + dy
            if (d < r && dither(x, y, 0.5 * (1 - d / r))) put(x, y, GLOW)
          }
      }
      const flick = hash(l.seed + Math.floor(t * 8)) > 0.7
      for (let dy = 0; dy < l.h; dy++)
        for (let dx = 0; dx < l.w; dx++) {
          if (l.w === 3 && dy === 0 && dx !== 1) continue // rounded top on the big ones
          put(x0 + dx, y0 + dy, dy === l.h - 1 && flick ? FLAME[0] : LANTERN[4 - l.h + dy])
        }
    }

    // little clay lamps all along the bank
    for (const l of lamps) {
      const f = hash(l.seed + Math.floor(t * 12))
      put(l.x, HZ - 2, CUP)
      put(l.x, HZ - 3, FLAME[f < 0.5 ? 1 : 2])
      if (f > 0.6) put(l.x, HZ - 4, FLAME[0])
    }

    // the river: each row mirrors the sky above it, shifted side to side and darkened with distance
    for (let d = 0; d < rows; d++) {
      const wob = Math.round(Math.sin(d * 0.8 - t * 2) * (0.5 + d * 0.06))
      const ripple = Math.sin(d * 0.45 + t * 1.2) > 0.96 // now and then a darker line rolls through
      const k = 0.3 + (0.45 * d) / rows + (ripple ? 0.2 : 0)
      const row = (HZ + d) * W
      const src = (HZ - 1 - d) * W
      for (let x = 0; x < W; x++) {
        const c = px[src + Math.min(W - 1, Math.max(0, x + wob))]
        const r = c & 255
        const g = (c >> 8) & 255
        const b = (c >> 16) & 255
        px[row + x] = 0xff000000 | ((b + (WATER[2] - b) * k) << 16) | ((g + (WATER[1] - g) * k) << 8) | (r + (WATER[0] - r) * k)
      }
    }

    // moonlight glittering on the water, fanning out toward the viewer
    for (let d = 1; d < rows; d++) {
      const tick = Math.floor(t * 3 + d * 0.37) // each row twinkles on its own beat
      if (hash(d * 7.1 + tick) > 0.22) continue
      const spread = R * (0.4 + (0.8 * d) / rows)
      const x0 = Math.round(mx + (hash(d * 3.3 + tick * 1.7) - 0.5) * 2 * spread)
      const len = 1 + Math.floor(hash(d + tick * 5.9) * 3)
      for (let x = x0; x < x0 + len; x++) put(x, HZ + d, d < rows * 0.3 ? MOON[1] : MOON[3])
    }

    for (const b of boats) {
      b.x = (b.x + (1 + b.z * 4) * dt) % W
      const cw = 3 + Math.round(b.z * 3)
      const x0 = Math.round(b.x)
      const cx = x0 + (cw >> 1)
      const y = HZ + 2 + Math.round(b.z * b.z * (rows - 6) + Math.sin(t * 1.5 + b.seed) * b.z * 0.8)
      const f = hash(b.seed + Math.floor(t * 10))
      // its own light, broken up by the ripples underneath
      for (let i = 1; i <= 3 + Math.round(b.z * 6); i++)
        if (hash(b.seed + i * 1.3 + Math.floor(t * 6)) > 0.3) put(cx + Math.round(Math.sin(t * 3 + i)), y + i, i < 3 ? FLAME[1] : FLAME[2])
      for (let dx = 0; dx < cw; dx++) put(x0 + dx, y, CUP)
      if (cw >= 4) {
        put(x0, y - 1, CUP)
        put(x0 + cw - 1, y - 1, CUP)
      }
      put(cx, y - 1, FLAME[f < 0.5 ? 1 : 2])
      put(cx, y - 2, FLAME[f > 0.4 ? 0 : 1])
    }

    ctx.putImageData(img, 0, 0)
  }
}

export default function Lanterns() {
  const ref = useRef()

  useEffect(() => {
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const portrait = matchMedia('(orientation: portrait)')
    let draw
    let raf
    let last = 0
    const reset = () => {
      draw = scene(ref.current)
      draw(0)
    }
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 33) return // ~30fps suits pixel art and spares phone batteries
      draw(Math.min(now - last, 100) / 1000)
      last = now
    }
    reset()
    // rebuild only when the screen flips shape, not on every mobile URL-bar resize; cover crops the rest
    portrait.addEventListener('change', reset)
    if (!still) raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      portrait.removeEventListener('change', reset)
    }
  }, [])

  return <canvas ref={ref} className="bg" aria-hidden="true" />
}

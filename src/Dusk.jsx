import { useEffect, useRef } from 'react'

// Pixel-art dusk behind the launch-day letter: dithered sky, striped sun, drifting clouds, parallax hills,
// fireworks, and a lake that mirrors all of it. Drawn at ~320 art pixels on the long side, then upscaled.

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const pack = ([r, g, b]) => 0xff000000 | (b << 16) | (g << 8) | r // ImageData bytes are RGBA, i.e. ABGR as a little-endian uint32
const pal = (...hs) => hs.map((h) => pack(rgb(h)))

const SKY = pal('#120a24', '#1d0c38', '#2c0f4f', '#421364', '#5c1776', '#7a1b82', '#9b2187', '#bd2a80', '#da3a73', '#ee5565', '#f77a55', '#fb9f4c')
const SUN = pal('#fff3b0', '#ffd96b', '#fdb64c', '#f99048', '#f36a5a', '#e64a6c', '#cc3374')
const [GLOW, WHITE, STAR] = pal('#e64a6c', '#ffffff', '#ffb8e0')
const CLOUD = pal('#4a1466', '#2c0f4f', '#bd2a80', '#f77a55') // top edge, body, then the two sunlit rows underneath
const WATER = rgb('#170a2e')
const BURSTS = [
  pal('#fff3b0', '#ff9ad5', '#e8466b', '#9b2187', '#421364'),
  pal('#fff3b0', '#fdb64c', '#f77a55', '#da3a73', '#5c1776'),
  pal('#ffffff', '#dcb0ff', '#a65ce8', '#7a1b82', '#2c0f4f'),
]
// far to near: colours, ridge frequencies, tallest peak as a share of the screen's short side, drift in art px/s
const HILLS = [
  { body: '#5a1a6e', rim: '#d0407a', ks: [2, 5, 11], h: 0.24, speed: 0.6 },
  { body: '#3a1052', rim: '#8a2185', ks: [3, 7, 13], h: 0.15, speed: 1.6 },
  { body: '#1f0a33', rim: '#4a1466', ks: [4, 9, 17], h: 0.09, speed: 3.5 },
]

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
  const HZ = Math.round(H * 0.68) // horizon row
  const R = Math.round(M * 0.24) // sun radius
  const cx = W >> 1
  const cy = HZ - Math.round(R * 0.55)
  const put = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < HZ) px[y * W + x] = c
  }

  // the sky never changes: bands dithered into each other, plus a dithered halo around the sun
  const sky = new Uint32Array(W * HZ)
  for (let y = 0; y < HZ; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, y - cy) - R
      sky[y * W + x] = d > 0 && d < 6 && dither(x, y, 0.6 * (1 - d / 6)) ? GLOW : ramp(SKY, (y / HZ) ** 1.4, x, y)
    }

  const stars = Array.from({ length: Math.round((W * HZ) / 500) }, () => ({
    x: Math.floor(rnd(0, W)),
    y: Math.floor(HZ * 0.55 * Math.random() ** 1.5),
    phase: rnd(0, 7),
    speed: rnd(0.8, 3),
    big: Math.random() < 0.12,
  }))

  const clouds = Array.from({ length: 4 }, (_, i) => {
    const w = Math.round(M * rnd(0.2, 0.38))
    const puffs = Array.from({ length: 3 }, () => ({ x: rnd(0.2, 0.8) * w, r: rnd(0.16, 0.3) * w }))
    const pts = []
    for (let dx = 0; dx < w; dx++) {
      // a flat base two rows thick with round puffs on top; dy counts up from the bottom row
      const h = Math.round(Math.max(dx < 2 || dx > w - 3 ? 1 : 2, ...puffs.map((p) => Math.sqrt(Math.max(0, p.r ** 2 - (dx - p.x) ** 2)) * 0.75)))
      for (let dy = 0; dy < h; dy++) pts.push([dx, -dy, dy === 0 ? CLOUD[3] : dy === 1 ? CLOUD[2] : dy === h - 1 ? CLOUD[0] : CLOUD[1]])
    }
    return { pts, w, x: rnd(0, W), y: Math.round(cy - R * 0.8 + (i + rnd(0, 0.6)) * R * 0.38), speed: rnd(1, 2.5) }
  })

  const hills = HILLS.map((l) => {
    const ph = l.ks.map(() => rnd(0, Math.PI))
    // ridged sines with whole-number frequencies, so each strip tiles seamlessly as it drifts
    const hm = Array.from({ length: W }, (_, x) =>
      2 + Math.round((M * l.h * l.ks.reduce((sum, k, i) => sum + (1 - Math.abs(Math.sin((Math.PI * k * x) / W + ph[i]))) / (i + 1), 0)) / 1.83),
    )
    return { hm, speed: l.speed, body: pack(rgb(l.body)), rim: pack(rgb(l.rim)), x: 0 }
  })

  let t = 0
  let rockets = []
  let sparks = []
  let nextLaunch = 0.6
  let meteor = null
  let nextMeteor = 5

  return (dt) => {
    t += dt
    px.set(sky)

    for (const st of stars) {
      const b = Math.sin(t * st.speed + st.phase)
      if (b < -0.2) continue
      put(st.x, st.y, b > 0.6 ? WHITE : STAR)
      if (st.big && b > 0.85) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) put(st.x + dx, st.y + dy, STAR)
    }

    if (!meteor && t > nextMeteor) meteor = { x: rnd(0, W * 0.6), y: rnd(0, HZ * 0.3), age: 0 }
    if (meteor) {
      const d = (meteor.age += dt) * W * 0.8
      for (let i = 0; i < 10; i++) put(Math.round(meteor.x + d - i), Math.round(meteor.y + (d - i) * 0.35), i < 2 ? WHITE : STAR)
      if (meteor.age > 0.45) {
        meteor = null
        nextMeteor = t + rnd(6, 14)
      }
    }

    const top = cy - R
    for (let y = Math.max(0, top); y < HZ; y++) {
      const s = y - (cy - R * 0.35) // stripes start just above the middle, thicken toward the horizon and slide down
      if (s > 0 && (((s - t * 5) % 9) + 9) % 9 < (s / (HZ - cy + R * 0.35)) * 4) continue
      const hw = Math.round(Math.sqrt(Math.max(0, R * R - (y - cy) ** 2)))
      for (let x = cx - hw; x < cx + hw; x++) put(x, y, ramp(SUN, (y - top) / (HZ - top), x, y))
    }

    for (const c of clouds) {
      c.x -= c.speed * dt
      if (c.x < -c.w) c.x += W + c.w
      const x0 = Math.floor(c.x)
      for (const [dx, dy, col] of c.pts) put(x0 + dx, c.y + dy, col)
    }

    // fireworks go up from behind the hills, which are painted after them
    if (t > nextLaunch) {
      for (let n = Math.random() < 0.3 ? 2 : 1; n > 0; n--)
        rockets.push({ x: Math.round(rnd(0.12, 0.88) * W), y: HZ, top: H * rnd(0.1, 0.36), cols: BURSTS[Math.floor(rnd(0, BURSTS.length))] })
      nextLaunch = t + rnd(0.9, 2.8)
    }
    rockets = rockets.filter((r) => {
      r.y -= H * 0.45 * dt
      if (r.y > r.top) {
        const y = Math.round(r.y)
        put(r.x, y, WHITE)
        put(r.x, y + 1, SUN[2])
        put(r.x, y + 2, SUN[4])
        return true
      }
      const n = Math.round(rnd(40, 70))
      const v = M * rnd(0.18, 0.28)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * 2 * Math.PI + rnd(0, 0.15)
        const sp = v * rnd(0.55, 1)
        sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: rnd(1, 1.8), cols: r.cols })
      }
      return false
    })
    const drag = 0.3 ** dt
    sparks = sparks.filter((p) => {
      p.age += dt
      p.vx *= drag
      p.vy = p.vy * drag + M * 0.07 * dt // gravity
      p.x += p.vx * dt
      p.y += p.vy * dt
      const f = p.age / p.life
      const i = Math.min(p.cols.length - 2, Math.floor(f * (p.cols.length - 1)))
      if (f < 0.75 || Math.random() < 0.5) {
        // crackles in and out as it dies
        put(Math.round(p.x - p.vx * 0.06), Math.round(p.y - p.vy * 0.06), p.cols[i + 1])
        put(Math.round(p.x), Math.round(p.y), p.cols[i])
      }
      return f < 1
    })

    for (const l of hills) {
      l.x = (l.x + l.speed * dt) % W
      const off = Math.floor(l.x)
      for (let x = 0; x < W; x++) {
        const y0 = HZ - l.hm[(x + off) % W]
        for (let y = y0; y < HZ; y++) px[y * W + x] = y === y0 ? l.rim : l.body
      }
    }

    // the lake: each row mirrors the sky above it, shifted side to side and darkened with distance
    const rows = H - HZ
    for (let d = 0; d < rows; d++) {
      const wob = Math.round(Math.sin(d * 0.8 - t * 2.5) * (0.5 + d * 0.07))
      const ripple = Math.sin(d * 0.45 + t * 1.5) > 0.96 // now and then a darker line rolls through
      const k = 0.35 + (0.4 * d) / rows + (ripple ? 0.25 : 0)
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

    // glitter on the water under the sun, fanning out toward the viewer
    for (let d = 1; d < rows; d++) {
      const tick = Math.floor(t * 4 + d * 0.37) // each row twinkles on its own beat
      if (hash(d * 7.1 + tick) > 0.28) continue
      const spread = R * (0.5 + d / rows)
      const x0 = Math.round(cx + (hash(d * 3.3 + tick * 1.7) - 0.5) * 2 * spread)
      const len = 1 + Math.floor(hash(d + tick * 5.9) * 4)
      for (let x = Math.max(0, x0); x < Math.min(W, x0 + len); x++) px[(HZ + d) * W + x] = d < rows * 0.3 ? SUN[1] : SUN[3]
    }

    ctx.putImageData(img, 0, 0)
  }
}

export default function Dusk() {
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

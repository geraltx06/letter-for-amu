import { PixelCanvas, pal, dither, ramp, rnd, hash } from './Lanterns'

// Pixel-art Diwali night: fireworks over a town of flat rooftops, and someone sitting alone on a terrace wall lined
// with diyas and marigolds, holding a sparkler. No moon, because Diwali falls on the new moon.

const SKY = pal('#07051a', '#0c0824', '#130c30', '#1c113a', '#281543', '#371a49', '#4a1f4c', '#61264d', '#7d304c', '#9a3f48')
const WALL = pal('#120a1c', '#1c0f22', '#2c1526', '#432028', '#643026')
const FLAME = pal('#fff3b0', '#ffd76b', '#ff9a3c')
const BULBS = pal('#ff4d6d', '#ffd23f', '#4dd4ff', '#7dff8a')
const WINDOWS = pal('#ffcf6b', '#ff9a3c', '#b8743a')
const MARIGOLD = pal('#ff9a1f', '#ffc83d', '#3f6b2a')
const [FAR, NEAR, FIGURE, RIM, STICK, CUP, CUP_LIT, GLOW, WHITE, STAR, FLASH] = pal('#1a1036', '#0d0820', '#05030c', '#a8562a', '#6a5a4a', '#8a4a24', '#c9743a', '#6a3324', '#ffffff', '#b8b4f0', '#4a2a68')
// each runs bright to dim as a spark burns out
const GOLD = pal('#fff7d0', '#ffd76b', '#ff9a3c', '#a84a24')
const SHELLS = [
  GOLD,
  pal('#ffe6f0', '#ff7ab0', '#d9366f', '#6e1d48'),
  pal('#e6fff8', '#6bf0d4', '#22a6a6', '#14505f'),
  pal('#f2e6ff', '#b68aff', '#7a45d9', '#3a2272'),
]

function scene(canvas) {
  const s = Math.max(innerWidth, innerHeight) / 320 // screen px per art pixel
  const W = (canvas.width = Math.ceil(innerWidth / s))
  const H = (canvas.height = Math.ceil(innerHeight / s))
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(W, H)
  const px = new Uint32Array(img.data.buffer)
  const M = Math.min(W, H) // sizes scale off the short side so phones and desktops look alike
  const PY = Math.round(H * 0.84) // top row of the terrace wall
  const put = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = c
  }

  // one row of flat roofs; returns each column's height above the wall
  const roofs = (lo, hi, minW, maxW, onRoof) => {
    const h = new Array(W).fill(0)
    for (let x = 0; x < W; ) {
      const w = Math.round(rnd(minW, maxW))
      const rh = Math.round(M * rnd(lo, hi))
      for (let dx = 0; dx < w && x + dx < W; dx++) h[x + dx] = rh
      onRoof?.(x, w, rh)
      x += w
    }
    return h
  }
  const far = roofs(0.14, 0.3, 6, 16)
  const windows = []
  const bulbs = []
  const tanks = []
  const near = roofs(0.05, 0.17, 8, 20, (x, w, rh) => {
    for (let wy = 3; wy < rh - 1; wy += 3)
      for (let wx = 1; wx < w - 1; wx += 2)
        if (Math.random() < 0.3) windows.push({ x: x + wx, y: PY - wy, col: WINDOWS[Math.floor(rnd(0, 3))], seed: rnd(0, 99) })
    if (Math.random() < 0.55) // a string of fairy lights sagging along the roof edge
      for (let dx = 0; dx < w; dx += 2) bulbs.push({ x: x + dx, y: PY - rh + (dx % 4 === 2 ? 1 : 0) })
    else if (w > 9 && Math.random() < 0.6) tanks.push(x + Math.floor(rnd(1, w - 5))) // rooftop water tank
  })
  for (const x of tanks) for (let dx = 0; dx < 4 && x + dx < W; dx++) near[x + dx] += 3
  const top = far.map((h, x) => PY - Math.max(h, near[x])) // the first row of each column that isn't sky

  // everything that never moves: sky, both rows of town, and the brick wall with its marigold garland
  const still = new Uint32Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const row = y - PY
      still[y * W + x] =
        y >= PY ? ramp(WALL, 1 - row / (H - PY) - (row % 4 === 3 || (x + (row >> 2) * 4) % 8 === 0 ? 0.3 : 0), x, y)
        : y >= PY - near[x] ? NEAR
        : y >= PY - far[x] ? FAR
        : ramp(SKY, (y / PY) ** 1.6, x, y)
    }
  for (let x = 0; x < W; x += 2) {
    const y = PY + 2 + Math.round(Math.abs(Math.sin((x * Math.PI) / 18)) * 5)
    const col = x % 18 === 0 ? MARIGOLD[2] : MARIGOLD[(x >> 1) & 1]
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) if (y + dy < H && x + dx < W) still[(y + dy) * W + x + dx] = col
  }

  const stars = Array.from({ length: Math.round((W * PY) / 500) }, () => ({
    x: Math.floor(rnd(0, W)),
    y: Math.floor(PY * 0.7 * Math.random() ** 1.3),
    phase: rnd(0, 7),
    speed: rnd(0.5, 2),
  }))
  const fx = Math.round(W * 0.24) // where the figure sits
  const diyas = Array.from({ length: Math.ceil(W / 14) }, (_, i) => ({ x: i * 14 + 6, seed: rnd(0, 99) })).filter((d) => Math.abs(d.x - fx) > 7)

  // sky things stay behind the town: falling sparks disappear past the rooftops
  const sky = (x, y, c) => {
    if (x >= 0 && x < W && y >= 0 && y < top[x]) px[y * W + x] = c
  }
  const rockets = []
  const glows = [] // the short flash behind each burst, a dithered disc
  let sparks = []
  let wait = 0
  let t = 0

  const launch = () => {
    const x = Math.round(rnd(W * 0.1, W * 0.9))
    const apex = rnd(0.08, 0.5) * PY
    rockets.push({ x, y: top[x], apex, vy: (apex - top[x]) / rnd(0.8, 1.2) })
  }
  const burst = (x, y) => {
    const cols = SHELLS[Math.floor(rnd(0, SHELLS.length))]
    const kind = Math.floor(rnd(0, 3)) // 0 full chrysanthemum, 1 ring, 2 gold willow that droops
    const n = Math.max(40, Math.round(M * rnd(0.6, 1)))
    const v = M * rnd(0.26, 0.4)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rnd(0, 0.1)
      const sp = kind === 1 ? v : v * Math.sqrt(Math.random()) * (kind === 2 ? 0.7 : 1)
      sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: kind === 2 ? rnd(2, 2.8) : rnd(1.1, 1.7), cols: kind === 2 ? GOLD : cols, g: M * (kind === 2 ? 0.2 : 0.1) })
    }
    glows.push({ x, y, r: M * 0.24, age: 0, life: 0.3, col: FLASH, amt: 0.5 })
  }

  const draw = (dt) => {
    t += dt
    px.set(still)

    for (const st of stars) {
      const b = Math.sin(t * st.speed + st.phase)
      if (b > -0.3) sky(st.x, st.y, b > 0.7 ? WHITE : STAR)
    }

    for (let i = glows.length - 1; i >= 0; i--) {
      const g = glows[i]
      g.age += dt
      if (g.age > g.life) {
        glows.splice(i, 1)
        continue
      }
      const fade = g.amt * (1 - g.age / g.life)
      const r = Math.ceil(g.r)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const d = Math.hypot(dx, dy)
          const x = Math.round(g.x) + dx
          const y = Math.round(g.y) + dy
          if (d < g.r && dither(x, y, fade * (1 - d / g.r))) sky(x, y, g.col)
        }
    }

    wait -= dt
    if (wait <= 0) {
      launch()
      if (Math.random() < 0.15) launch()
      wait = rnd(0.6, 1.8)
    }
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i]
      r.y += r.vy * dt
      sparks.push({ x: r.x, y: r.y, vx: rnd(-2, 2), vy: rnd(2, 8), age: 0, life: 0.35, cols: GOLD, g: 0 })
      if (r.y <= r.apex) {
        burst(r.x, r.y)
        rockets.splice(i, 1)
      }
    }

    // the sparkler, in front of the town
    const tipX = fx + 7
    const tipY = PY - 15
    for (let i = 0; i < 3; i++) {
      const a = rnd(0, Math.PI * 2)
      const sp = M * rnd(0.04, 0.14)
      sparks.push({ x: tipX, y: tipY, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, age: 0, life: rnd(0.15, 0.4), cols: GOLD, g: M * 0.1, front: true })
    }

    for (const p of sparks) {
      p.age += dt
      p.vx *= 1 - 1.6 * dt // air drag slows the burst
      p.vy = p.vy * (1 - 1.6 * dt) + p.g * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      const f = p.age / p.life
      const x = Math.round(p.x)
      const y = Math.round(p.y)
      if (f > 0.75 && !dither(x, y, (1 - f) * 4)) continue // burning out, breaks up into dither
      const plot = p.front ? put : sky
      if (f < 0.6) plot(Math.round(p.x - p.vx * 0.05), Math.round(p.y - p.vy * 0.05), p.cols[2])
      plot(x, y, ramp(p.cols, f * f, x, y)) // squared so sparks stay bright for most of their life
    }
    sparks = sparks.filter((p) => p.age < p.life)

    for (const w of windows) if (hash(w.seed + Math.floor(t * 0.2 + w.seed)) > 0.08) put(w.x, w.y, w.col)
    // the fairy lights chase along each string
    bulbs.forEach((b, i) => put(b.x, b.y, BULBS[(i + Math.floor(t * 3)) % BULBS.length]))

    for (const d of diyas) {
      const f = hash(d.seed + Math.floor(t * 10))
      const r = 4 + f * 2
      for (let dy = -6; dy <= 6; dy++)
        for (let dx = -6; dx <= 6; dx++) {
          const dist = Math.hypot(dx, dy)
          if (dist < r && dither(d.x + dx, PY - 3 + dy, 0.4 * (1 - dist / r))) put(d.x + dx, PY - 3 + dy, GLOW)
        }
      for (let dx = -2; dx <= 2; dx++) put(d.x + dx, PY - 1, dx < 0 ? CUP_LIT : CUP)
      put(d.x - 2, PY - 2, CUP_LIT)
      put(d.x + 2, PY - 2, CUP)
      put(d.x, PY - 3, FLAME[f < 0.5 ? 1 : 2])
      put(d.x, PY - 4, FLAME[f > 0.3 ? 0 : 1])
      if (f > 0.55) put(d.x, PY - 5, FLAME[0])
    }

    // seen from behind: head, shoulders widening to the wall, one arm up with the sparkler; its light rims the arm side so they read against the town
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const d = Math.hypot(dx, dy)
        if (d < 3.4) put(fx + dx, PY - 13 + dy, d > 2.4 && dx > 0 ? RIM : FIGURE)
      }
    for (let y = PY - 10; y < PY; y++) {
      const hw = 3 + ((y - (PY - 10)) >> 2)
      for (let dx = -hw; dx <= hw; dx++) put(fx + dx, y, dx === hw ? RIM : FIGURE)
    }
    for (let i = 0; i < 4; i++) put(fx + 3 + i, PY - 9 - i, RIM)
    put(fx + 7, PY - 13, STICK)
    put(fx + 7, PY - 14, STICK)
    put(tipX, tipY, WHITE)

    ctx.putImageData(img, 0, 0)
  }

  for (let i = 0; i < 60; i++) draw(0.05) // start mid-show, which also gives reduced-motion viewers fireworks in their still frame
  return draw
}

export default function Diwali() {
  return <PixelCanvas scene={scene} />
}

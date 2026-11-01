import rain from './rain.mp4'
import photo1 from './01.jpg'
import clip2 from './02-video.mp4'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const greeting = 'My Joon,'
const greetings = { 1: 'Day 02,' } // days that open with their own first line instead
// one entry per day; days not written yet stay locked even once their date arrives
const letters = [
  [
  `By the time you read this, I'll be on my way home for Diwali. Two whole weeks. It's the first time we'll be apart, and my heart already feels the difference.`,
  `For four months now, we haven't spent a single weekend apart. Every Saturday and every Sunday has had you in it, and I've grown so used to that, I'm not sure I remember what a weekend looks like without you. Gibran wrote that "love knows not its own depth until the hour of separation." I think I'm about to find out just how deep mine goes.`,
  `So I'm taking our memories with me for company. The ramen at Kazan. The tacos at Mezcalita. The day we started Stats and Scribbles together and suddenly had a whole YouTube channel of our own. Every one of them is better because you were in it.`,
  `In White Nights, Dostoevsky's dreamer gets four nights with Nastenka, and at the end he says, "My God, a moment of bliss! Why, isn't that enough for a whole lifetime?" He was content with four nights. I've had four months of you, and I'm not nearly that noble. I want the whole lifetime.`,
  `The painting behind this letter is The Return of Persephone. Every year she has to leave, and the whole world turns cold until she comes back. I love the moment it captures: arms already reaching out, just before they hold each other again. That is us, two weeks from now. I'll be the one climbing back into the light, and you'll be the one waiting with open arms.`,
  `Gibran also said, "let there be spaces in your togetherness." Fine. I'll allow two weeks of space, but not one day more. And while the house fills up with diyas and noise and sweets, every lamp I light will carry a small wish with your name in it.`,
  `Please take care of yourself while I'm gone. Eat properly, sleep on time, and call me whenever you miss me, even if it's late. Especially if it's late.`,
  `I love you more than all the diyas in the world.`,
  ],
  [
    `Hello sugar, it's been 2 days since we've been away from each other, and one of the first weekends that we've spent apart in almost 4 months.`,
    `I know it's not very romantic reading letters from on here, on a digital world, but I try to make them as engaging as possible.`,
    `It was Lakshay's birthday today. Went to the mall to surprise him, and his reaction was absolutely priceless and worth it. Another friend of mine, Buddham, was also there. I'm seeing him after school today. It's been almost a decade, it's insane. Honestly Buddham turned out to be a pretty cool guy in the end, he's also a really big nerd, we share a lot of common hobbies as well and he plays Balatro (it's a really cool game I used to play, you should check it out, you'd love it).`,
    `Also picked up a really really cool book for you, you'll find out when I come back. I knew I wanted to give it to you the moment you made me aware about Randall Munroe's What If that day at the villa, since this is a book I read growing up, so in a lot of ways, this was my version of What If. I'm really excited for you to read that.`,
    `Rilke wrote that love is "two solitudes that protect and touch and greet each other." I used to think that was a sad line. Today it makes sense to me. We're each in our own little solitude for a while, and this letter is me touching yours, just to say hello.`,
  ],
]
// extra bits tucked in after a day's sign-off, keyed by day
const extras = {
  1: (
    <>
      {/* frames are square; objectPosition picks which part of each shot stays in view */}
      <div className="polaroids">
        <div className="polaroid">
          <img className="photo" src={photo1} alt="Selfie of three friends grinning" style={{ objectPosition: '75% 50%' }} />
        </div>
        <div className="polaroid">
          <video className="photo" src={clip2} autoPlay muted loop playsInline aria-label="Looping selfie clip in sunglasses" style={{ objectPosition: '50% 60%' }} />
        </div>
      </div>
      <section className="dispatch">
        <h2>Here's some fun stuff I thought I'd include here </h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            A man enters a windowless room, turns on a single desk lamp, reads one sentence from a handwritten notebook, and immediately shuts off the main power to the entire building. He committed no crime, and nothing was damaged. Why did he do it?
          </li>
          <li>
            <h3>True or myth?</h3>
            NASA spent $1.2 million in the 1960s developing an ink pen that worked in zero gravity, while Soviet cosmonauts simply opted for grease pencils.
            <details>
              <summary>tap for the answer</summary>
              Myth! NASA never paid for it. Paul Fisher funded the space pen himself, then sold it to NASA, and the cosmonauts ended up using it too.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Reply with your entire day summarized using exactly three verbs. Nothing else.
          </li>
        </ol>
      </section>
    </>
  ),
}
const signOff = ['Forever yours,', 'May']

const START = new Date(2026, 9, 31) // day 0 unlocks on this date (local midnight), one more each day after
const DAYS = 15
const unlocked = Math.floor((Date.now() - START) / 864e5) + 1

// hover tilt for mouse; touch devices get tilt from the gyro instead (see App)
function tilt(e) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5) * 2)
  e.currentTarget.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5) * 2)
}
function untilt(e) {
  e.currentTarget.style.removeProperty('--tx')
  e.currentTarget.style.removeProperty('--ty')
}

function Envelope({ label, ...props }) {
  return (
    <button className="envelope" onPointerMove={tilt} onPointerLeave={untilt} {...props}>
      <span className="tilt">
      <span className="env-back" />
      <span className="peek">{label}</span>
      <span className="pocket">
        <i className="left" />
        <i className="right" />
        <i className="bottom" />
      </span>
      <span className="flap"><i /></span>
      <span className="seal">A</span>
      </span>
    </button>
  )
}

export default function App() {
  // gyro: tilt every envelope relative to how the phone was held when the first reading came in
  useEffect(() => {
    let base
    const root = document.documentElement.style
    const clamp = (v) => Math.max(-1, Math.min(1, v / 25))
    const onTilt = (e) => {
      if (e.beta == null) return
      base ??= [e.beta, e.gamma]
      root.setProperty('--tx', clamp(e.gamma - base[1]))
      root.setProperty('--ty', clamp(e.beta - base[0]))
    }
    // iOS only hands out motion data after a tap asks for it
    const ask = () => window.DeviceOrientationEvent?.requestPermission?.().catch(() => {})
    addEventListener('deviceorientation', onTilt)
    addEventListener('click', ask, { once: true })
    return () => {
      removeEventListener('deviceorientation', onTilt)
      removeEventListener('click', ask)
    }
  }, [])

  const [pick, setPick] = useState(null) // { day, rect } of the envelope tapped in the grid
  // one video outside both screens so it keeps playing, not restarting, when the letter opens
  const bg = <video className="bg" src={rain} autoPlay muted loop playsInline aria-hidden="true" />
  if (pick) return <>{bg}<Letter day={pick.day} paragraphs={letters[pick.day]} from={pick.rect} onBack={() => setPick(null)}>{extras[pick.day]}</Letter></>

  return (
    <>
    {bg}
    <main className="scene">
      <div className="grid">
        {Array.from({ length: DAYS }, (_, i) => {
          const open = i < unlocked && letters[i]
          return (
            <div className="tile" key={i}>
              <Envelope
                label="For my Amu"
                className={open ? 'envelope' : 'envelope locked'}
                disabled={!open}
                onClick={(e) => setPick({ day: i, rect: e.currentTarget.getBoundingClientRect() })}
                aria-label={open ? `Open day ${i}` : `Day ${i}, not unlocked yet`}
              />
              <p className="day" aria-hidden="true">day {i}</p>
            </div>
          )
        })}
      </div>
    </main>
    </>
  )
}

function Letter({ day, paragraphs, from, onBack, children }) {
  const [stage, setStage] = useState(0) // 0 sealed, 1 flap open, 2 letter out, 3 reading
  const [flying, setFlying] = useState(true)
  const env = useRef()

  // fly the envelope from its grid tile to centre stage: start it at the tile's spot and size, animate to its own
  useLayoutEffect(() => {
    const to = env.current.getBoundingClientRect()
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return setFlying(false)
    env.current.animate(
      [
        { transformOrigin: 'top left', transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
        { transformOrigin: 'top left', transform: 'none' },
      ],
      { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    ).onfinish = () => setFlying(false)
  }, [from])

  function open() {
    if (stage) return
    setStage(1)
    setTimeout(() => setStage(2), 750)
    setTimeout(() => setStage(3), 2300)
  }

  // each word fades in like ink, one after another across the whole letter
  let n = 0
  const ink = (text) =>
    text.split(' ').map((w, i) => (
      <span key={i}>
        <span className="word" style={{ animationDelay: `${1 + n++ * 0.05}s` }}>{w}</span>{' '}
      </span>
    ))

  const cls = ['scene', `day-${day}`, flying && 'flying', stage > 0 && 'open', stage > 1 && 'out', stage > 2 && 'reading'].filter(Boolean).join(' ')

  return (
    <main className={cls}>
      <button className="back" onClick={onBack}>← all letters</button>
      <Envelope ref={env} label="For my Amu" onClick={open} disabled={stage > 0} aria-label="Open the letter" />
      <p className="hint">tap to break the seal</p>

      {stage > 2 && (
        <div className="overlay">
          <button className="back" onClick={onBack}>← all letters</button>
          <article className="letter">
            <h1>{ink(greetings[day] ?? greeting)}</h1>
            {paragraphs.map((p, i) => <p key={i}>{ink(p)}</p>)}
            <p className="sign">
              {ink(signOff[0])}
              <br />
              <span className="name">{ink(signOff[1])}</span>
            </p>
            {/* fades in once the last word has inked */}
            {children && <div className="extra" style={{ animationDelay: `${1 + n * 0.05}s` }}>{children}</div>}
          </article>
        </div>
      )}
    </main>
  )
}

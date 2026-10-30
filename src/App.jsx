import { useState } from 'react'

const greeting = 'My Joon,'
const paragraphs = [
  `By the time you read this, I'll be on my way home for Diwali. Two whole weeks. It's the first time we'll be apart, and my heart already feels the difference.`,
  `For four months now, we haven't spent a single weekend apart. Every Saturday and every Sunday has had you in it, and I've grown so used to that, I'm not sure I remember what a weekend looks like without you. Gibran wrote that "love knows not its own depth until the hour of separation." I think I'm about to find out just how deep mine goes.`,
  `So I'm taking our memories with me for company. The ramen at Kazan. The tacos at Mezcalita. The day we started Stats and Scribbles together and suddenly had a whole YouTube channel of our own. Every one of them is better because you were in it.`,
  `In White Nights, Dostoevsky's dreamer gets four nights with Nastenka, and at the end he says, "My God, a moment of bliss! Why, isn't that enough for a whole lifetime?" He was content with four nights. I've had four months of you, and I'm not nearly that noble. I want the whole lifetime.`,
  `The painting behind this letter is The Return of Persephone. Every year she has to leave, and the whole world turns cold until she comes back. I love the moment it captures: arms already reaching out, just before they hold each other again. That is us, two weeks from now. I'll be the one climbing back into the light, and you'll be the one waiting with open arms.`,
  `Gibran also said, "let there be spaces in your togetherness." Fine. I'll allow two weeks of space, but not one day more. And while the house fills up with diyas and noise and sweets, every lamp I light will carry a small wish with your name in it.`,
  `Please take care of yourself while I'm gone. Eat properly, sleep on time, and call me whenever you miss me, even if it's late. Especially if it's late.`,
  `I love you more than all the diyas in the world.`,
]
const signOff = ['Forever yours,', 'May']

export default function App() {
  const [stage, setStage] = useState(0) // 0 sealed, 1 flap open, 2 letter out, 3 reading

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

  const cls = ['scene', stage > 0 && 'open', stage > 1 && 'out', stage > 2 && 'reading'].filter(Boolean).join(' ')

  return (
    <main className={cls}>
      <button className="envelope" onClick={open} disabled={stage > 0} aria-label="Open the letter">
        <span className="env-back" />
        <span className="peek">For my Amu</span>
        <span className="pocket">
          <i className="left" />
          <i className="right" />
          <i className="bottom" />
        </span>
        <span className="flap"><i /></span>
        <span className="seal">A</span>
      </button>
      <p className="hint">tap to break the seal</p>
      <p className="caption">The Return of Persephone · Frederic Leighton, 1891</p>

      {stage > 2 && (
        <div className="overlay">
          <article className="letter">
            <h1>{ink(greeting)}</h1>
            {paragraphs.map((p, i) => <p key={i}>{ink(p)}</p>)}
            <p className="sign">
              {ink(signOff[0])}
              <br />
              <span className="name">{ink(signOff[1])}</span>
            </p>
          </article>
        </div>
      )}
    </main>
  )
}

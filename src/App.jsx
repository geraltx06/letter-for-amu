import photo1 from './01.jpg'
import clip2 from './02-video.mp4'
import photo3 from './03.jpg'
import photo4 from './04.jpg'
import rangoli from './06-rangoli.jpg'
import kurta from './06-kurta.jpg'
import lake from './07-lake.mp4'
import cigarettes from './08-cigarettes.mp4'
import hospital from './08-hospital.jpg'
import Lanterns from './Lanterns'
import Diwali from './Diwali'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const greeting = 'My Joon,'
const greetings = { 1: 'Day 02,', 2: 'Day 03,', 3: 'Day 04,', 5: 'Day 06,' } // days that open with their own first line instead
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
  [
    `Today I'm writing this from my bed, which is pretty much where I spent the whole day. I woke up with a really bad fever, a cough and a cold, and I slept through most of it, even though I was supposed to be working from home.`,
    `Instead of resting properly, I kept making fixes to the video from bed and doing whatever I could for the release, because I know how much is riding on it and I didn't want it to slip any further. I know I keep missing timelines and overshooting them. I'm really sorry, Joon. I'm sorry for the delays, and for not being able to hold to the plan.`,
    `I'm sorry about the evening too. What we had wasn't a fight, and I don't want to make it bigger than it was, but it still left a bad feeling. I wasn't taking anything personally. I just felt bad about the day, about the delays, about how badly I wanted this to go right, and it came out sideways. That part is mine to own.`,
    `I know you had a tough day too. Nothing seemed to go right for either of us, and the video was supposed to be the thing that made all of it feel worth it. I haven't been able to deliver that, and I'm sorry. You didn't deserve to carry that on top of everything else.`,
    `Today was also Ain's birthday celebration, and it was so much fun. I got to see all my friends after more than a year, which honestly felt like coming up for air. I got emotional while we were talking, more than I expected, but it was a good kind of emotional. He really liked the gifts, and he really loves your poetry page. I was a little proud to be the one who got to tell you that.`,
    `I love you, even when we're both tired and getting things wrong.`,
  ],
  [
    `It's out. Our very first video is out in the world, and I've been grinning at my phone like a fool ever since.`,
    `A month ago it was only an idea. Then it became scripts, and scribbles, and edits, and late nights, and me promising "just one more fix" more times than I'd care to count. And today we finally pressed publish.`,
    `Yesterday I wrote to you from bed, apologising for the delays and saying I hadn't been able to deliver. Well, Joon, it is delivered. Late, a little feverish, but delivered. Thank you for waiting on me, and for never once letting go of it, even when I was making it hard.`,
    `I'll admit I didn't picture it like this. I always imagined us side by side when we hit that button, probably squabbling over the thumbnail one last time. Instead it was the two of us on a video call, in two different homes, staring at the same screen and holding our breath. It made me a tad sad, if I'm honest. But yours was still the first face I saw when it went live, and I think that counts for a great deal.`,
    `Browning wrote that "a man's reach should exceed his grasp, or what's a heaven for?" For a whole month we were reaching for something just past our fingertips. Today we finally got hold of it.`,
    `This was ours from the very first scribble. And honestly, the best part was never the upload. It was the month itself, the two of us building something out of nothing.`,
    `You made me a better man this month, and not by asking nicely. You wouldn't let me settle, and you wouldn't let me give up, even on the days I wanted to do both. I grumbled about it, I'll own that. But I'm more disciplined than I was a month ago, more patient, and far more honest about what I can actually deliver. That's your doing, every bit of it.`,
    `Here is what I've learnt you are made of:`,
    `Your patience, which I tested far more than anyone should.`,
    `Your honesty, even when a softer answer would have been easier.`,
    `Your stubbornness, the good kind, the kind that wouldn't let this die.`,
    `Your eye for detail, which caught everything I'd stopped seeing.`,
    `Your way with words, which anyone who has read your poetry already knows.`,
    `And your kindness, on the days nothing went right and you'd every excuse not to be kind at all.`,
    `It feels fitting that it happened with Diwali only days away, when everyone is lighting lamps for new beginnings. We got to light one of our own. When we're back, we're celebrating properly, in person, the way we should have today. Until then, consider this letter a toast. To us, to Stats and Scribbles, and to the very first of many.`,
    `I love you, and I'm so terribly proud of us.`,
  ],
  [
    `I sat with this letter for a long time tonight, trying to find the right words, and I've realised there probably aren't any. So I'm just going to talk to you the way I would if I were sitting next to you.`,
    `You've been on my mind all day, Joon. I wish I could take some of today's weight off your shoulders and carry it myself. I can't do that from here, but I can stay close through all of it, for as long as you need, and you never have to explain a single thing to me.`,
    `You don't have to be okay right now. You don't have to find the right words, or any words at all. If all you can manage tonight is to read this and fall asleep, that is more than enough. Be as gentle with yourself as you always are with everyone else.`,
    `I know you've been holding everyone together, being there for your family while carrying all of your own pain at the same time. That is what strength actually looks like. Not never breaking down, but showing up anyway, with your eyes still red. You are so much stronger than you feel right now. You don't have to believe me tonight. I'll believe it for the both of us until you do.`,
    `Rilke has a line I keep coming back to: "Let everything happen to you: beauty and terror. Just keep going. No feeling is final." I know tonight feels like it will never end. But it isn't final. This is not the last thing you will ever feel, and you won't have to walk through any of it alone.`,
    `Diwali is almost here, the night everyone lights lamps to say that light wins in the end. It doesn't feel like it's winning right now, and that's okay. The lanterns behind this letter are for you. Every one of them is a small light rising into a very dark sky, and not one of them is afraid of it.`,
    `I hate that I'm this far away tonight. If I could, I'd be right there beside you, not saying anything clever, just holding you until your breathing slows down. Since I can't, I wrote you something small. It's waiting under my name.`,
    `I love you, and you are safe with me. Always.`,
  ],
  [
    `Happy Diwali, Joon. Not much to report from here. Diyas, noise, too many sweets, the usual.`,
    `I miss you though. More than I thought I would, honestly, and I think we've both been feeling it lately. The weekends especially, they're just weird without you. Two weeks sounded a lot shorter when I was planning it. I've also been thinking about the ramen at Kazan for no real reason. I don't think it's about the ramen.`,
    `Also, about the things you sent me. I saw them, and I know it looked like I ignored them, but I didn't. I was really occupied at the time and I didn't want to send something half-hearted just to have replied. I actually want to answer them properly, and a quick "haha nice" wasn't going to do that. So I'd rather do them justice when I can sit with them. You'll get real replies, maybe just not all at once.`,
    `I know it's been a rough week on your end, so no rush replying to this. I'm in no position to rush anyone on replies anyway. Just eat something and sleep when you can.`,
    `Past halfway now. We still owe the video a proper celebration, and I still have a book to give you. See you soon.`,
  ],
  [
    `So I hear you were planning on breaking up with me. Not because you're tired of me, but because you didn't want to put me through all of this. I've given it some serious thought, and I'm afraid I'll have to decline. I checked the rules, and "I'm sad and I don't want you to be sad too" isn't grounds for a breakup. If anything, it's the exact reason to stay.`,
    `I know you said it half as a joke. But I heard the other half too, and Joon, that might be the most you thing you've ever said. Even at your lowest, the first thing you thought about was protecting me. So let me say this properly: you're not putting me through anything. Nobody is dragging me through your hard days. I'm walking through them with you, because that's where I want to be. I'd much rather be inside the bad weeks with you than safe somewhere outside them without you.`,
    `You don't have to shield me from your life. I'm not a guest who only gets to see the good rooms. I'm supposed to be part of all of it, the heavy parts included.`,
    `I know nothing at home has really moved yet. It's been days of the same weight, and that kind of tired doesn't go away with one good night's sleep. You don't have to be fine, and you definitely don't have to pretend to be fine for my sake. If you've got nothing to say, we can just be on a call and say nothing. I'm good at that. Ask anyone.`,
    `You don't owe me long replies, or good moods, or a version of you that has it all together. I'm not keeping score. A one-word text is fine. A sticker is fine. Going quiet for a while is fine too, as long as you know I'm still right here when you come back up.`,
    `Mary Oliver wrote, "You do not have to be good... You only have to let the soft animal of your body love what it loves." I think about that one a lot. You don't have to be good right now, or strong, or productive. Just eat something, sleep when you can, and let yourself be looked after a little, even from this far away.`,
    `And if you still want to break up with me once I'm back, fine, but you'll have to do it in person. After the book. After the video's proper celebration. I like my odds.`,
    `Only a few more days now.`,
    `I love you on your good days, and on every single one of the other ones too.`,
  ],
  [
    `Sorry it's been a few days since the last one. In my defence, I've been busy developing acute bronchitis. It's going great. I now cough like a man who's smoked for forty years, my chest feels like someone parked a scooter on it, and climbing one flight of stairs counts as cardio. Don't worry, I'm taking the medicines, drinking the warm water, and resting. Mostly. I'll be fully functional by the time you see me, I promise.`,
    `Meanwhile you've been working. Version after version of your voice over. And every time I tell you it's good, you tell me my appreciation doesn't feel real, because I never give you any proper critique.`,
    `So here's my defence, and I'd like it on the record. I'm not being polite, Joon. You're doing everything right. What exactly am I supposed to critique? I listen, I wait for the bit I'd change, and it never comes. You keep redoing lines that were already good, and somehow they come back better. If my notes are boring, that's on you for not leaving me anything to fix.`,
    `And I think I know why it doesn't feel real to you. Somewhere in your head there's a voice that says you have to earn being good enough, take after take, until nobody could possibly find a flaw. I'd like that voice to know it's wrong. You don't have to be flawless for me to be proud of you. I was proud of you before you recorded a single line, and I'll still be proud of you on the takes you think are terrible. My praise isn't a grade, Joon. It's just the truth, said by someone who gets to watch you up close.`,
    `And now we've started on the PageRank video, video number two. Number two! I've been making drafts of the animation, and you've already recorded a few lines and gone and tried a whole new style of voice over, like the first one wasn't good enough for you. It was. This one's going to be better anyway, because that's just how you work.`,
    `Fittingly, PageRank is the idea that a page matters because of everything that points to it. If you ran it on my life, every link would lead back to you. Very important page. Top result. No notes there either.`,
    `There's a picture under my name, and before you panic, I'm fine. It's from the hospital. The cough finally got bad enough that I got dragged in, and somewhere between being handed a mask and being hooked up to a drip, I decided that if I was going to be sick, I was at least going to document it. So that's me, in all my hospital glory. Bed hair, mask, drip, the full set. Not my best angle, but I thought you'd want to see the proof that I'm actually getting looked after and not just telling you I am.`,
    `And please don't spend these days worrying about me, or feeling bad that you're not here. You've had more than enough on your plate without adding me to it. I'm being looked after, I'm getting better, and I'll be okay. You don't owe me anything for being sick. Just knowing you're out there, and that I get to see you in a few days, is doing more for me than any medicine.`,
    `These two weeks have been long, and messy, and not at all how we planned them. You had the heaviest days at home, I ended up in a hospital bed, and somehow we still started a whole new video together. If anything, that's the part I'll remember. Nothing about this distance has made us smaller. We're coming out of it exactly as we went in, maybe a little more sure of each other.`,
    `Only a few more days now. I'll be the one coughing at the door. Try not to break up with me over that either.`,
    `I love you, voice cracks and all. Mine included.`,
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
  2: (
    <>
      <div className="polaroids">
        <div className="polaroid">
          <img className="photo" src={photo3} alt="Photo from today" />
        </div>
      </div>
      <section className="dispatch">
        <h2>Here's some more fun stuff</h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            A woman receives a postcard from a town she has never visited, with her own handwriting on the back. It's dated tomorrow, and she has never mailed anything in her life. What should she do?
          </li>
          <li>
            <h3>True or myth?</h3>
            Wombats produce cube-shaped droppings.
            <details>
              <summary>tap for the answer</summary>
              True! The wombat's intestine stretches unevenly along its length, which squares off the droppings. They leave them on rocks and logs to mark their territory.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Reply with the one song stuck in your head this week. Nothing else.
          </li>
        </ol>
      </section>
    </>
  ),
  3: (
    <>
      <div className="polaroids">
        <div className="polaroid">
          <img className="photo" src={photo4} alt="Launch night: YouTube Studio on the monitor, and Amu on the video call on the laptop" style={{ objectPosition: '95% 50%' }} />
        </div>
      </div>
      <section className="dispatch">
        <h2>And some more fun stuff</h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            An old painter finishes the canvas she has worked on for ten years, signs it with great care, and then paints over the whole thing in white. She has never been happier in her life. Why?
          </li>
          <li>
            <h3>True or myth?</h3>
            The very first video on YouTube was a 19-second clip of one of its co-founders at the zoo, talking about elephants.
            <details>
              <summary>tap for the answer</summary>
              True! Jawed Karim uploaded "Me at the zoo" in April 2005. All he really says is that the elephants have "really, really, really long trunks." Every channel since started somewhere, ours included.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Reply with the one comment you'd most love to see on our video. Nothing else.
          </li>
        </ol>
      </section>
    </>
  ),
  4: (
    <section className="dispatch">
      <p>
        The wind can bend a flame,<br />
        but it has never made one stop burning.<br />
        So lean, if you need to. Shake, if you need to.<br />
        My hands are cupped around you,<br />
        and the dark will have to get through me first.
      </p>
    </section>
  ),
  5: (
    <>
      <div className="polaroids">
        <div className="polaroid">
          <img className="photo" src={rangoli} alt="A flower rangoli of coloured powder on a marble floor, with a lit diya above it" style={{ objectPosition: '50% 22%' }} />
        </div>
        <div className="polaroid">
          <img className="photo" src={kurta} alt="Mirror selfie in sunglasses and a white embroidered kurta" style={{ objectPosition: '50% 12%' }} />
        </div>
      </div>
      <section className="dispatch">
        <h2>Some more fun stuff</h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            A clockmaker keeps every clock in his shop set a few seconds apart, and he refuses to sell any of them. Every evening at six, the whole street stops to listen. What are they hearing?
          </li>
          <li>
            <h3>True or myth?</h3>
            Sharks have been around longer than trees.
            <details>
              <summary>tap for the answer</summary>
              True! Early sharks go back around 400 million years, and the first trees only showed up a little after that.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Reply with the last thing you ate. Nothing else.
          </li>
        </ol>
      </section>
    </>
  ),
  6: (
    <section className="dispatch">
        <h2>Some fun stuff, for when you need a distraction</h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            Every night, a woman switches on one lamp in the window of a house that has stood empty for years. Nobody lives there and nobody is coming back, yet the whole street thanks her for it. Why?
          </li>
          <li>
            <h3>True or myth?</h3>
            Sea otters hold hands while they sleep so they don't drift away from each other.
            <details>
              <summary>tap for the answer</summary>
              True! Sea otters sleep floating on their backs, and they often hold paws or wrap themselves in kelp so the current doesn't carry them apart.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Reply with one emoji for how today felt. Nothing else.
          </li>
        </ol>
      </section>
  ),
  7: (
    <>
      <div className="polaroids">
        <div className="polaroid">
          <img className="photo" src={hospital} alt="Selfie in a hospital bed wearing a blue surgical mask, with an IV drip hanging beside the bed" style={{ objectPosition: '50% 40%' }} />
        </div>
      </div>
      <section className="dispatch">
        <h2>Some fun stuff, prescribed by your sick boyfriend</h2>
        <ol>
          <li>
            <h3>Two-sentence mystery</h3>
            A woman shoots her husband, holds him underwater for five minutes, then hangs him up. An hour later, the two of them go out to dinner together. How?
          </li>
          <li>
            <h3>True or myth?</h3>
            Google's PageRank is named after web pages, because it ranks pages.
            <details>
              <summary>tap for the answer</summary>
              Myth, sort of! It's named after Larry Page, one of Google's co-founders. The fact that it also ranks pages is a very convenient pun.
            </details>
          </li>
          <li>
            <h3>Micro-challenge</h3>
            Send me a voice note of just one line from the new style. No retakes allowed.
          </li>
        </ol>
      </section>
    </>
  ),
}
const signOff = ['Forever yours,', 'May']

const START = new Date(2026, 9, 31) // day 1 unlocks on this date (local midnight), one more each day after
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
  // one background outside both screens so it keeps playing, not restarting, when a letter opens
  const bg =
    pick?.day === 4 ? <Lanterns /> // day 5's letter talks about the lanterns behind it
    : !pick || pick.day === 7 ? <video className="bg" src={cigarettes} autoPlay muted loop playsInline aria-hidden="true" />
    : pick.day === 6 ? <video className="bg" src={lake} autoPlay muted loop playsInline aria-hidden="true" />
    : <Diwali />

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
                aria-label={open ? `Open day ${i + 1}` : `Day ${i + 1}, not unlocked yet`}
              />
              <p className="day" aria-hidden="true">day {i + 1}</p>
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

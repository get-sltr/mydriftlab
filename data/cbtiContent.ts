/**
 * CBT-I lesson content — structured educational material for the 6-week program.
 *
 * Each week has 2–3 lessons mixing education, exercises, and reflections.
 * Guided exercises (PMR, breathing, body scan) reference audio content
 * that can be played via the content player.
 */

import type { CBTILesson } from '../lib/types';

export const cbtiLessons: CBTILesson[] = [
  // ── Week 1: Baseline + Education ───────────────────────
  {
    id: 'w1-sleep-efficiency',
    week: 1,
    title: 'What is Sleep Efficiency?',
    body: `Sleep efficiency is the single most important number in sleep medicine. It answers a simple question: **of the time you spend in bed, how much is actually spent sleeping?**

**Sleep Efficiency = (Total Sleep Time / Time in Bed) x 100**

A healthy sleeper has an efficiency above 85%. Many people with insomnia spend too long in bed tossing and turning, which can drop efficiency below 70%.

**Why it matters:**
- Spending excessive time awake in bed trains your brain to associate the bed with wakefulness
- Low efficiency perpetuates the insomnia cycle
- Improving efficiency is the primary goal of this program

This week, we're measuring your baseline. Record your sleep diary honestly every morning — the data will shape your personalized prescription in Week 2.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w1-why-restriction',
    week: 1,
    title: 'Why Sleep Restriction Works',
    body: `It sounds counterintuitive: to sleep better, you'll spend *less* time in bed. Here's why it works:

**The insomnia trap:**
1. You sleep poorly one night
2. You go to bed earlier the next night to "catch up"
3. You spend more time lying awake, anxious about not sleeping
4. Your brain learns: bed = frustration
5. Repeat

**Sleep restriction breaks the cycle:**
1. We compress your time-in-bed to match your actual sleep time
2. This builds up "sleep pressure" — your body's natural drive to sleep
3. You fall asleep faster and sleep more deeply
4. Your brain relearns: bed = sleep
5. We gradually expand your sleep window as efficiency improves

**Important:** You may feel more tired during the first 1-2 weeks. This is normal and temporary. The short-term fatigue is the price of long-term improvement.

**Safety note:** We never reduce time-in-bed below 5.5 hours. If you drive for work or operate heavy machinery, discuss this program with your doctor first.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w1-your-diary',
    week: 1,
    title: 'Your Sleep Diary',
    body: `The sleep diary is your most powerful tool. Every morning, you'll record:

- **Bedtime** — when you got into bed
- **Lights-off** — when you tried to sleep
- **Sleep onset** — how long it took to fall asleep (estimate)
- **Awakenings** — how many times you woke up
- **Wake time** — total minutes awake during the night
- **Final wake** — when you woke up for good
- **Out of bed** — when you physically got up
- **Quality** — your subjective rating (1-5)

**Tips for accuracy:**
- Fill it out within 30 minutes of waking
- Don't check the clock during the night (clock-watching increases anxiety)
- Estimates are fine — precision isn't the goal, consistency is
- MyDriftLAB's sonar tracking will auto-fill some fields, but your subjective experience matters too

Your diary data drives everything: baseline calculation, weekly adjustments, and progress tracking.`,
    audioId: null,
    estimatedMinutes: 4,
    type: 'reflection',
  },

  // ── Week 2: Sleep Restriction ──────────────────────────
  {
    id: 'w2-sleep-window',
    week: 2,
    title: 'Setting Your Sleep Window',
    body: `Based on your baseline week, we've calculated your personalized sleep window.

**Your prescription:**
Your prescribed bedtime and wake time are shown on the Labs tab. Here's how we calculated them:

1. We averaged your actual sleep time from Week 1
2. Your time-in-bed = max(your average sleep, 5.5 hours)
3. Your wake time stays fixed (you chose this)
4. Your bedtime = wake time minus time-in-bed

**The rules this week:**
- Do NOT go to bed before your prescribed bedtime
- DO get up at your prescribed wake time — every day, including weekends
- No napping during the day
- If you're not sleepy at bedtime, wait until you feel sleepy

**What to expect:**
- The first 2-3 nights may be rough
- You might feel sleepy during the day
- By night 4-5, you'll likely fall asleep faster
- Your brain is rebuilding the bed-sleep association

**Trust the process.** Sleep restriction has the strongest evidence base of any behavioral insomnia treatment.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w2-first-week-hard',
    week: 2,
    title: 'The First Week is Hardest',
    body: `You're in the toughest part of the program right now. Here's what's normal:

**Normal experiences:**
- Feeling groggy or tired during the day
- Wanting to go to bed earlier than prescribed
- Feeling irritable or having difficulty concentrating
- Worrying that you're making things worse

**These are signs it's working.** Your body is building up sleep pressure — the natural drive that makes you fall asleep quickly and sleep deeply.

**What to do:**
- Remind yourself this is temporary (1-2 weeks)
- Avoid caffeine after 2pm (tempting but counterproductive)
- Get some sunlight in the morning (helps set your circadian clock)
- Light exercise is OK but don't overdo it
- Call a friend, take a walk — anything to stay awake until bedtime

**Red flags (contact your doctor):**
- Falling asleep while driving
- Extreme mood changes beyond normal tiredness
- Pre-existing conditions worsening

Hang in there. This gets better.`,
    audioId: null,
    estimatedMinutes: 4,
    type: 'education',
  },
  {
    id: 'w2-daytime-sleepiness',
    week: 2,
    title: 'Daytime Sleepiness is Normal',
    body: `Take a moment to reflect on this week. Answer honestly — no judgment.

**Reflection questions:**

1. **How has your sleep onset changed?** Are you falling asleep faster than during baseline?

2. **How's your daytime energy?** Rate it 1-5 compared to baseline week.

3. **What's been the hardest part?** (staying up until bedtime, getting up on time, daytime sleepiness)

4. **What's working?** What strategies have you used to stay awake until your prescribed bedtime?

5. **How do you feel about continuing?** Remember, you can pause the program anytime, but most people see significant improvement by Week 3-4.

Write your thoughts in the notes field of today's diary entry. Looking back at these reflections at the end of the program is powerful motivation.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'reflection',
  },

  // ── Week 3: Stimulus Control ───────────────────────────
  {
    id: 'w3-bed-for-sleep',
    week: 3,
    title: 'The Bed is for Sleep',
    body: `Stimulus control is about retraining your brain's association with the bed. Right now, your brain may associate bed with anxiety, frustration, phone scrolling, or TV watching.

**The rules:**
1. **Use the bed only for sleep** (and intimacy). No reading, no phone, no TV, no eating.
2. **Only go to bed when sleepy** — not just tired, but actually struggling to keep your eyes open.
3. **If awake >20 minutes, get up.** Go to another room, do something boring (dim light, no screens), return when sleepy.
4. **No clock-watching.** Turn your clock away from you. Checking the time increases anxiety.
5. **Same wake time every day.** No exceptions.

**Why this works:**
Your bed becomes a powerful sleep trigger — like how the smell of coffee makes you alert. Every time you lie awake in bed, you weaken that trigger. Every time you get up and return only when sleepy, you strengthen it.

**The 20-minute rule in practice:**
Don't actually time 20 minutes (no clock-watching!). If you feel you've been awake "a while" and are getting frustrated, that's your cue to get up.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w3-twenty-minute-rule',
    week: 3,
    title: 'The 20-Minute Rule',
    body: `The 20-minute rule is the cornerstone of stimulus control. Here's how to apply it practically:

**When you can't sleep:**
1. Notice the frustration building — this is your signal
2. Calmly get out of bed
3. Go to a different room (this is important — location change matters)
4. Do something unstimulating in dim light:
   - Listen to a calm podcast or audiobook
   - Gentle stretching
   - Drink herbal tea
   - Read a physical book (not a screen)
5. When your eyelids get heavy, return to bed
6. Repeat if needed — some people go back and forth 3-4 times at first

**What NOT to do when you get up:**
- Don't check your phone
- Don't turn on bright lights
- Don't eat heavy snacks
- Don't watch TV (the light is too stimulating)
- Don't do work (trains your brain to be alert at night)

**It gets easier.** Within a week, most people find they rarely need to get up at all. The bed has become a sleep trigger again.`,
    audioId: null,
    estimatedMinutes: 4,
    type: 'education',
  },
  {
    id: 'w3-buffer-zone',
    week: 3,
    title: 'Creating a Buffer Zone',
    body: `Reflect on how stimulus control has changed your relationship with the bed.

**This week's practice:**
Create a 30-60 minute "buffer zone" before your prescribed bedtime. This is transition time between your active day and sleep.

**Buffer zone activities:**
- Play a MyDriftLAB sleep story or soundscape
- Practice the breathing exercises from the Drift tab
- Dim all lights in your home
- Set devices to "Do Not Disturb"
- Gentle stretching or yoga
- Warm bath or shower (the subsequent body cooling promotes sleep)

**Reflection:**
- How many times this week did you use the 20-minute rule?
- Is it getting easier to fall asleep at your prescribed bedtime?
- Have you noticed any improvement in how you feel about going to bed?

The emotional relationship with your bed is as important as the physical one. If bed feels like a welcome, restful place rather than a battleground, you're on the right track.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'reflection',
  },

  // ── Week 4: Cognitive Restructuring ────────────────────
  {
    id: 'w4-thought-records',
    week: 4,
    title: 'Thought Records',
    body: `Insomnia isn't just a body problem — it's a thinking problem. Anxious thoughts about sleep ("I'll never sleep well again") actually make insomnia worse.

**Common unhelpful thoughts:**
- "I need 8 hours or I can't function"
- "One bad night will ruin tomorrow"
- "I've tried everything, nothing works"
- "My insomnia is different — it's physical"
- "I'll never be a good sleeper"

**The thought record technique:**
When you notice an anxious thought about sleep:

1. **Write it down** — "I absolutely need 8 hours tonight"
2. **Rate your belief** — 0-100% (e.g., 90%)
3. **Examine the evidence:**
   - When was the last time you functioned OK on less than 8 hours?
   - Has a bad night ever actually been as catastrophic as you feared?
   - What would you say to a friend with this thought?
4. **Write a balanced alternative** — "I function better with 8 hours, but I've managed on less before. One night doesn't define my week."
5. **Rate your new belief** — often the catastrophic thought drops to 40-50%

Practice this whenever you notice anxious thoughts about sleep, day or night.`,
    audioId: null,
    estimatedMinutes: 6,
    type: 'education',
  },
  {
    id: 'w4-sleep-myths',
    week: 4,
    title: 'Common Sleep Myths',
    body: `Let's debunk some beliefs that may be keeping your insomnia alive:

**Myth: "Everyone needs 8 hours"**
Reality: Sleep needs vary from 6-9 hours. What matters is how you feel, not a number. Many people function perfectly on 7 hours.

**Myth: "I can catch up on weekends"**
Reality: Sleeping in disrupts your circadian rhythm and makes Monday night harder. A consistent schedule is more important than total hours.

**Myth: "Lying in bed resting is almost as good as sleeping"**
Reality: Time awake in bed is actively counterproductive — it weakens the bed-sleep association. Better to get up and do something boring.

**Myth: "I should try harder to fall asleep"**
Reality: Effort and sleep are opposites. Sleep happens when you let go of trying. The paradox: accepting wakefulness often brings sleep faster.

**Myth: "My insomnia is caused by [stress/hormones/genetics]"**
Reality: While these can trigger insomnia, what *maintains* it is usually behavioral patterns. That's why CBT-I works regardless of the original cause.

**Myth: "Medication is the only real solution"**
Reality: CBT-I is more effective than medication long-term, with no side effects or dependency. It's the first-line treatment recommended by every major sleep organization.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w4-catastrophizing',
    week: 4,
    title: 'Catastrophizing vs Reality',
    body: `This week's reflection focuses on the gap between what you fear and what actually happens.

**Exercise:**
Think back to a recent bad night. Answer these questions:

1. **What did you fear would happen the next day?**
   (e.g., "I won't be able to work", "I'll feel terrible all day")

2. **What actually happened?**
   (Usually: you were tired but functioned. Maybe not your best day, but you got through it.)

3. **On a scale of 0-10, how bad was the predicted catastrophe?**
   (The feared outcome: probably 8-9)

4. **On a scale of 0-10, how bad was the reality?**
   (Usually: 4-6. Uncomfortable but manageable.)

**The insight:**
We consistently overestimate the consequences of poor sleep. This overestimation creates anxiety, which causes more poor sleep — the insomnia cycle.

Breaking this cycle requires evidence: keep notes on bad nights vs next-day reality. Over time, you'll see the pattern — it's never as bad as you fear.

Note: If you're 4 weeks into the program, you've likely already seen improvement. Look at your efficiency trend!`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'reflection',
  },

  // ── Week 5: Relaxation Training ────────────────────────
  {
    id: 'w5-pmr',
    week: 5,
    title: 'Progressive Muscle Relaxation',
    body: `Progressive Muscle Relaxation (PMR) systematically releases tension you may not even know you're holding. Research shows PMR reduces time to fall asleep by an average of 20 minutes.

**How it works:**
You'll tense each muscle group for 5 seconds, then release for 15 seconds. Focus on the contrast between tension and relaxation.

**The sequence:**
1. Feet — curl toes tightly, then release
2. Calves — point toes toward knees, then release
3. Thighs — squeeze thigh muscles, then release
4. Glutes — clench, then release
5. Abdomen — tighten core, then release
6. Hands — make fists, then release
7. Arms — flex biceps, then release
8. Shoulders — shrug to ears, then release
9. Neck — gently press head back, then release
10. Face — scrunch everything, then release

**Practice:**
Use the guided audio exercise (play button above) to follow along. Practice every night during your buffer zone before bed. With daily practice, you can learn to release tension on command.`,
    audioId: 'pmr-guided',
    estimatedMinutes: 15,
    type: 'exercise',
  },
  {
    id: 'w5-478-breathing',
    week: 5,
    title: '4-7-8 Breathing',
    body: `The 4-7-8 breathing technique was popularized by Dr. Andrew Weil. It activates your parasympathetic nervous system — your body's "rest and digest" mode.

**The technique:**
1. **Inhale** through your nose for **4 counts**
2. **Hold** your breath for **7 counts**
3. **Exhale** slowly through your mouth for **8 counts**
4. Repeat for 4 cycles

**Why it works:**
- The extended exhale activates the vagus nerve
- Holding the breath builds CO2, which has a calming effect
- The counting gives your mind something to focus on besides anxious thoughts
- The rhythm naturally slows your heart rate

**Tips:**
- Don't force it — if 4-7-8 feels too long, start with 3-5-6 and work up
- Practice during the day first (not just at bedtime)
- Use it whenever you feel anxious, not just for sleep
- After 2 weeks of daily practice, the calming effect becomes nearly instant

Play the guided version above to practice with timing cues.`,
    audioId: '478-breathing',
    estimatedMinutes: 8,
    type: 'exercise',
  },
  {
    id: 'w5-body-scan',
    week: 5,
    title: 'Body Scan Meditation',
    body: `The body scan is a mindfulness practice that helps you notice and release tension without actively tensing muscles (unlike PMR).

**How it works:**
Starting at your toes and moving up to your head, you simply *notice* each body part. No need to change anything — just observe.

**The practice:**
1. Lie down comfortably. Close your eyes.
2. Take 3 deep breaths.
3. Bring attention to your left foot. Notice any sensations — warmth, tingling, pressure, nothing at all. All are fine.
4. Slowly move attention up: left ankle, shin, knee, thigh.
5. Switch to right foot and repeat up.
6. Continue: pelvis, lower back, abdomen, chest, hands, arms, shoulders, neck, face, top of head.
7. End by noticing your body as a whole.

**Why it's effective for sleep:**
- It redirects attention from racing thoughts to physical sensations
- The systematic progression is naturally sleep-inducing
- It teaches body awareness — you'll notice tension earlier and release it

Many people fall asleep during the body scan. That's fine — it's not a failure, it's the goal.

Play the guided version for a 10-minute practice.`,
    audioId: 'body-scan',
    estimatedMinutes: 12,
    type: 'exercise',
  },

  // ── Week 6: Maintenance ────────────────────────────────
  {
    id: 'w6-progress-review',
    week: 6,
    title: 'Your Progress Review',
    body: `Congratulations — you've reached the final week. Let's review what you've accomplished.

**Look at your numbers:**
Check the Trends tab for your sleep efficiency trajectory. Most people see:
- Baseline efficiency: 55-70%
- Week 6 efficiency: 80-90%
- Sleep onset: from 30-60 minutes to under 15 minutes
- Night awakenings: significantly reduced

**What changed:**
1. **Sleep restriction** rebuilt your sleep pressure and bed-sleep association
2. **Stimulus control** made your bed a trigger for sleep, not anxiety
3. **Cognitive restructuring** broke the catastrophizing cycle
4. **Relaxation techniques** gave you tools to manage physical tension

**Your sleep efficiency is now your compass.** If it stays above 85%, you're in great shape. If it dips below 80% for more than a week, revisit the sleep restriction rules.

Even if your numbers aren't "perfect," look at the trend. Improvement — not perfection — is the goal.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'reflection',
  },
  {
    id: 'w6-maintaining-gains',
    week: 6,
    title: 'Maintaining Your Gains',
    body: `The skills you've learned are for life. Here's how to maintain them:

**Non-negotiable habits:**
1. **Consistent wake time** — this is the single most important habit. Even if you sleep badly, get up on time.
2. **No long time in bed awake** — if you can't sleep after ~20 minutes, get up. This rule never expires.
3. **Reserve the bed for sleep** — keep phones, laptops, and TV out of bed permanently.

**When setbacks happen (and they will):**
- A few bad nights is normal and doesn't mean your insomnia is back
- Triggers: stress, travel, illness, time zone changes
- Response: go back to sleep restriction basics for 1-2 weeks
  - Calculate your recent average sleep time
  - Set time-in-bed to match
  - Follow the rules strictly until efficiency returns to 85%+

**Building on your foundation:**
- Continue using MyDriftLAB to track patterns
- Use the relaxation techniques whenever you feel tense
- Pay attention to your BDI trends for breathing health
- If you found a remedy that works (from Labs), keep it up

**The key insight:** You now know that YOU can fix your sleep. You've done it once — you can do it again anytime.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
  {
    id: 'w6-when-to-seek-help',
    week: 6,
    title: 'When to Seek Help',
    body: `CBT-I helps most people significantly, but it's not a complete solution for everyone. Know when to escalate:

**See a sleep specialist if:**
- Your BDI consistently scores above 15 (moderate or severe)
- You still can't achieve 80% sleep efficiency after completing the full program
- Your bed partner reports frequent pauses in your breathing
- You experience excessive daytime sleepiness that interferes with driving or work
- You have restless legs or periodic limb movements
- You experience sleep paralysis, vivid hallucinations at sleep onset, or sudden muscle weakness with emotions (possible narcolepsy)

**See your primary care doctor if:**
- Depression or anxiety is significantly affecting your sleep
- Chronic pain is the primary sleep disruptor
- You're taking medications that may affect sleep
- You have a thyroid condition or other hormonal issues

**What a sleep specialist can offer:**
- Polysomnography (overnight sleep study) — gold standard for diagnosing sleep disorders
- CPAP therapy for sleep apnea
- Medication management if appropriate
- Advanced CBT-I with a trained therapist

**Remember:** This program is educational, not medical treatment. For severe or persistent insomnia, professional guidance is always recommended.

You've done something most people never do — you've actively worked to improve your sleep. That takes real commitment. Well done.`,
    audioId: null,
    estimatedMinutes: 5,
    type: 'education',
  },
];

/** Get lessons for a specific week. */
export function getLessonsForWeek(week: number): CBTILesson[] {
  return cbtiLessons.filter((l) => l.week === week);
}

/** Get all lessons up to and including the given week. */
export function getAvailableLessons(currentWeek: number): CBTILesson[] {
  return cbtiLessons.filter((l) => l.week <= currentWeek);
}

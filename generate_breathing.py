"""
DriftLab Breathing Exercises (4)
Uses NEURAL engine (not long-form) for breathing exercises
Run: python3 generate_breathing.py
"""
import boto3, os, time

client = boto3.client('polly', region_name='us-east-1')
OUTPUT_DIR = './driftlab-audio'
os.makedirs(OUTPUT_DIR, exist_ok=True)
VOICE_ID = 'Ruth'

def gen(filename, ssml, engine='neural'):
    try:
        r = client.synthesize_speech(Text=ssml, TextType='ssml', OutputFormat='mp3', VoiceId=VOICE_ID, Engine=engine)
        fp = os.path.join(OUTPUT_DIR, filename)
        with open(fp, 'wb') as f: f.write(r['AudioStream'].read())
        print(f"    {filename} ({os.path.getsize(fp)/1024:.0f} KB)")
        return fp
    except Exception as e:
        print(f"    ERROR {filename}: {e}")
        return None

def concat(parts, out):
    op = os.path.join(OUTPUT_DIR, out)
    with open(op, 'wb') as o:
        for p in parts:
            if p and os.path.exists(p):
                with open(p, 'rb') as i: o.write(i.read())
                os.remove(p)
    print(f"  >> {out} ({os.path.getsize(op)/1024/1024:.1f} MB)")

def build(name, slug, parts):
    print(f"\n{name}...")
    ps = []
    for i, s in enumerate(parts):
        ps.append(gen(f"_{slug}_p{i+1}.mp3", s))
        time.sleep(1)
    concat(ps, f"{slug}.mp3")

# ── BREATHING 01: 4-7-8 ──
b01 = [
"""<speak>
<prosody rate="85%" volume="soft">
Get comfortable. Let your shoulders drop. Let your jaw soften. We are going to breathe together, slowly, in a rhythm that tells your body it is safe to rest.
<break time="4s"/>
The pattern is simple. Breathe in for four counts. Hold for seven. Breathe out for eight.
<break time="4s"/>
</prosody>
<prosody rate="75%" volume="soft">
Breathe in <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven.
<break time="1s"/>
Breathe out <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="5s"/>
Good. Again. Breathe in <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven.
<break time="1s"/>
And out <break time="1s"/> slowly <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="6s"/>
One more with me. In <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven.
<break time="1s"/>
Out <break time="1s"/> let it all go <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="5s"/>
Now continue on your own. In for four. Hold for seven. Out for eight.
<break time="10s"/>
You are doing well. Let each breath carry you a little deeper.
<break time="10s"/>
There is nothing else to do. Just breathe.
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

# ── BREATHING 02: BOX BREATHING ──
b02 = [
"""<speak>
<prosody rate="85%" volume="soft">
This is box breathing. Four counts in. Four counts hold. Four counts out. Four counts hold. A square. A box. Simple and steady.
<break time="4s"/>
Let your eyes close. Let your body be still.
<break time="3s"/>
</prosody>
<prosody rate="78%" volume="soft">
Breathe in <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Breathe out <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="4s"/>
Again. In <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Out <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="4s"/>
Good. Each side of the box is equal. Each breath is the same. There is a steadiness to this pattern that your body recognizes. It is the rhythm of calm.
<break time="5s"/>
In <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Out <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Hold <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="5s"/>
Now continue on your own. Four equal sides. In, hold, out, hold.
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

# ── BREATHING 03: 2-TO-1 ──
b03 = [
"""<speak>
<prosody rate="85%" volume="soft">
This is two-to-one breathing. Your exhale is twice as long as your inhale. That is all. The longer exhale activates the part of your nervous system that calms you down.
<break time="4s"/>
We will start with four counts in and eight counts out.
<break time="3s"/>
</prosody>
<prosody rate="78%" volume="soft">
Breathe in <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Breathe out <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="4s"/>
Again. In <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Out <break time="1s"/> slowly <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="5s"/>
Notice how the long exhale feels. Like letting something go. Like setting something down. There is nothing to hold onto.
<break time="5s"/>
In <break time="1s"/> two <break time="1s"/> three <break time="1s"/> four.
<break time="1s"/>
Out <break time="1s"/> easy <break time="1s"/> three <break time="1s"/> four <break time="1s"/> five <break time="1s"/> six <break time="1s"/> seven <break time="1s"/> eight.
<break time="5s"/>
Now let the counting go. Just keep the ratio. Short in. Long out. Let your body find its own pace.
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

# ── BREATHING 04: OCEAN BREATHING ──
b04 = [
"""<speak>
<prosody rate="85%" volume="soft">
This is ocean breathing. You are going to match your breath to the rhythm of a wave. In as the wave rises. Out as the wave falls. Slow and steady and endless, the way the ocean has always been.
<break time="4s"/>
Close your eyes. Imagine a wave in the distance, moving toward you.
<break time="3s"/>
</prosody>
<prosody rate="78%" volume="soft">
The wave rises. Breathe in <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> the wave reaches its peak.
<break time="2s"/>
The wave falls. Breathe out <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> the water pulls back.
<break time="3s"/>
A pause. The ocean gathering itself.
<break time="3s"/>
Another wave rises. In <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> up to the top.
<break time="2s"/>
The wave falls. Out <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> slowly <break time="1s"/> back to the shore.
<break time="4s"/>
Again. The wave rises. In.
<break time="5s"/>
The wave falls. Out.
<break time="6s"/>
Now let the waves continue on their own. You do not need to count. You do not need to try. Just breathe with the ocean. In as it rises. Out as it falls. The oldest rhythm in the world.
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Breathing Exercises (4)")
    print(f"Voice: {VOICE_ID} | Engine: neural | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("4-7-8 Breathing", "breath-01-478", b01),
        ("Box Breathing", "breath-02-box", b02),
        ("2-to-1 Breathing", "breath-03-two-to-one", b03),
        ("Ocean Breathing", "breath-04-ocean", b04),
    ]:
        build(name, slug, parts)
    print("\nDone! 4 breathing exercises complete.")

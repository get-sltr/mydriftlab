"""
DriftLab Meditations (6)
Run: python3 generate_meditations.py
"""
import boto3, os, time

client = boto3.client('polly', region_name='us-east-1')
OUTPUT_DIR = './driftlab-audio'
os.makedirs(OUTPUT_DIR, exist_ok=True)
VOICE_ID = 'Ruth'

def gen(filename, ssml, engine='long-form'):
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

# ── MEDITATION 01: LETTING THE DAY GO ──
m01 = [
"""<speak>
<prosody rate="85%" volume="soft">
Find a position that feels comfortable. You do not need to lie perfectly still. Just let your body settle into whatever shape feels right.
<break time="5s"/>
Close your eyes. And take one breath that is a little deeper than the last. Breathe in slowly through your nose. And let it go through your mouth. Not forcefully. Just letting the air leave on its own, the way a door swings closed when you stop holding it.
<break time="6s"/>
You have been carrying this day for hours. All of its conversations, its decisions, its small tensions and quiet efforts. You carried them well. But you do not need to carry them anymore. The day is over. It is finished. And now there is nothing required of you except to be here.
<break time="7s"/>
Bring your attention to the top of your head. Just notice it. The weight of it against the pillow. And as you notice it, let whatever tightness lives there begin to soften. The small muscles around your forehead. Your temples. The space behind your eyes.
<break time="7s"/>
Let your forehead become smooth. Let your eyebrows grow heavy. Let the muscles around your eyes release so completely that your eyelids feel like they are resting, not closed by effort but simply resting, the way a leaf rests on the surface of still water.
<break time="8s"/>
Let that softness move down into your jaw. Your jaw holds so much of the day. Every word you spoke, every word you considered speaking and did not. Let it unhinge slightly. Let your teeth part. Let your tongue rest heavy in your mouth.
<break time="8s"/>
Now your neck. The muscles that held your head upright all day. They can let go now. There is nothing to hold up. Nothing to look at.
<break time="8s"/>
Your shoulders. Drop them. Even now, even lying down, they are probably holding. Let them fall back into the bed. Let the bed take their weight. All the way down. Further than you think.
<break time="9s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
Your arms. Your hands. Your fingers. Let them uncurl if they are curled. Let them lie open. Your hands did so much today. They are done now. They can be still.
<break time="9s"/>
Your chest. Your breathing has already begun to slow, and you did not need to try. That is your body remembering what it knows how to do when you stop asking it to do other things.
<break time="9s"/>
Your stomach. Your hips. Your lower back, where the day often settles. Let the bed support all of it. Every ounce. You are not floating. You are held.
<break time="10s"/>
Your legs. Heavy now. Let them be so still that they seem to sink into the mattress, the way a stone sinks slowly into soft sand.
<break time="10s"/>
Your feet. The soles of your feet, which carried you through every room and every step of this day. Let them rest. Let the arches soften. Let the toes uncurl. They are done.
<break time="9s"/>
Now your whole body is resting. Not because you are trying to rest, but because you have stopped doing all the things that were keeping you from resting. And that is all sleep is. It is not something you do. It is what remains when you stop doing everything else.
<break time="10s"/>
And in the quiet that follows, there is only this. Your breath. Your body. The gentle weight of the dark. And the slow, certain knowledge that you are exactly where you are supposed to be.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── MEDITATION 02: THE QUIET ROOM ──
m02 = [
"""<speak>
<prosody rate="85%" volume="soft">
Lie down. Get comfortable. Let your body be heavy.
<break time="5s"/>
Take a slow breath in. And out.
<break time="4s"/>
Again. In. And out.
<break time="4s"/>
You are going to imagine a room. A quiet room. There is nothing in this room except you and a comfortable place to lie down. The walls are soft. The light is dim. The temperature is perfect.
<break time="5s"/>
This room has no windows. Not because it is closed off, but because there is nothing outside that you need to see right now. No weather. No time of day. No world to keep track of. Just this room. Just this moment.
<break time="6s"/>
In this room, there is no sound except your breathing. Listen to it. The air going in. The air going out. It does not need your help. It has been doing this all day without you thinking about it. You can trust it.
<break time="7s"/>
Now imagine that with each breath out, you are letting something go. Not something specific. You do not need to name it. Just a small weight. Each exhale takes a little of it away.
<break time="8s"/>
Breathe in. Nothing to take in except air.
<break time="3s"/>
Breathe out. A little lighter.
<break time="5s"/>
Breathe in.
<break time="3s"/>
Breathe out. A little lighter still.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
The room is getting softer. The light is getting dimmer. Not dark. Just dim. The kind of dim that your eyes adjust to easily, where shapes are soft and edges are gentle and everything looks like it is wrapped in something warm.
<break time="7s"/>
Your body is heavy. Not tired heavy. Relaxed heavy. The kind of heavy where every part of you has decided, at the same time, to stop holding on.
<break time="8s"/>
There is nothing to figure out. Nothing to solve. Nothing to plan. The room does not ask anything of you. It is just here, holding space for you, the way a cupped hand holds water. Gently. Completely. Without effort.
<break time="8s"/>
If thoughts come, let them. They are just echoes. The last vibrations of a day that is already over. They will pass through like a breeze through an open window. You do not need to close the window. You do not need to follow the breeze. Just let it pass.
<break time="9s"/>
You are in the quiet room. You are lying down. You are breathing. And with each breath, the room gets softer, and you get heavier, and the distance between you and sleep gets shorter and shorter and shorter.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── MEDITATION 03: CLOUDS PASSING ──
m03 = [
"""<speak>
<prosody rate="85%" volume="soft">
Close your eyes.
<break time="3s"/>
Picture a sky. A wide, open sky, late in the afternoon. It is pale blue and calm and there is nothing in it except a few clouds. Soft, white clouds, the kind that drift slowly, moving so gently that you can only tell they are moving if you watch one for a long time.
<break time="5s"/>
You are lying on your back, looking up at this sky. The ground beneath you is soft grass. It is warm from the sun. It holds you the way a mattress holds you.
<break time="5s"/>
Now. Your thoughts. The ones that are still buzzing around from today. They are all still there, and that is fine. You are not going to fight them. You are going to give them somewhere to go.
<break time="6s"/>
Take one thought. Any one. And place it on a cloud. Watch the cloud drift slowly across the sky, carrying that thought with it. It does not disappear. It just moves. Slowly, gently, from one side of the sky to the other. And then it is gone. Past the edge. Out of sight.
<break time="7s"/>
Take another thought. Place it on another cloud. Watch it drift. Slow and easy. No rush. The cloud does not care what the thought is about. It carries everything the same way. Lightly. Calmly.
<break time="8s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
Keep going. Each thought gets a cloud. Each cloud drifts away. Some thoughts come back. That is fine. Put them on another cloud. They will drift again. They always do.
<break time="8s"/>
The sky is wide. There is room for all of them. Every worry. Every plan. Every unfinished thing. The sky can hold them all, and they drift, and the sky stays calm because the sky is always calm. The clouds come and go. The sky remains.
<break time="8s"/>
You are the sky. The thoughts are the clouds. They pass through you but they are not you. You are the wide, open space that holds them. And when they are gone, you are still here. Still open. Still calm.
<break time="9s"/>
The clouds are thinning now. Fewer thoughts. Fewer worries. The sky is clearing. More blue. More space. More quiet.
<break time="9s"/>
And you lie here on the warm grass and look up at the wide, open, empty sky, and your breathing is slow and your body is heavy and the last cloud is drifting toward the edge, carrying the last thought of the day, and soon it will be gone, and all that will be left is blue. Just blue. Just space. Just quiet. Just rest.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── MEDITATION 04: THE STAIRCASE ──
m04 = [
"""<speak>
<prosody rate="85%" volume="soft">
Get comfortable. Let your body sink.
<break time="5s"/>
Imagine you are standing at the top of a staircase. It is a wide staircase, made of smooth stone. The steps go down. Not steeply. Gently. Each step is easy.
<break time="4s"/>
The staircase is lit by a soft, warm light. The walls on either side are smooth and warm to the touch. The air is comfortable. Perfect.
<break time="5s"/>
You are going to walk down this staircase. Slowly. One step at a time. And with each step, you will feel a little heavier. A little more relaxed. A little closer to rest.
<break time="5s"/>
Step one. Your feet feel the smooth stone. It is warm. Your shoulders drop slightly.
<break time="5s"/>
Step two. Your arms feel heavier. They hang at your sides without effort.
<break time="5s"/>
Step three. Your jaw loosens. Your mouth relaxes.
<break time="5s"/>
Step four. Your breathing slows. You do not try to slow it. It just happens.
<break time="5s"/>
Step five. Your eyelids feel heavy. Pleasantly heavy. Like they want to close.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
Step six. Your legs are heavier. Each step takes a little less effort because gravity is doing more of the work.
<break time="6s"/>
Step seven. Your thoughts are getting quieter. Like someone is turning down the volume.
<break time="6s"/>
Step eight. The light is dimmer here. Softer. Warmer. Like candlelight.
<break time="7s"/>
Step nine. You can barely feel your feet on the stone. Everything is soft.
<break time="7s"/>
Step ten. You reach the bottom. There is a bed here. A wide, comfortable bed with soft pillows and a heavy blanket. It is waiting for you. It has been waiting for you.
<break time="8s"/>
You lie down. The mattress accepts you completely. The pillow cradles your head. The blanket covers you, heavy and warm, and the weight of it feels like being held.
<break time="8s"/>
The light is very dim now. Almost dark. Just a faint glow. The stairs above you are gone. There is only this place. This bed. This dark, warm, quiet place at the bottom of everything.
<break time="9s"/>
You are as far down as you can go. And down here, there is nothing. No noise. No worry. No time. Just rest. Deep, heavy, complete rest.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── MEDITATION 05: THE RIVER WITHIN ──
m05 = [
"""<speak>
<prosody rate="85%" volume="soft">
Lie still. Let your eyes close.
<break time="4s"/>
Imagine a river. A wide, slow river moving through a valley. The water is dark and smooth and quiet. It does not rush. It does not crash. It just moves. Forward. Always forward. Slowly and steadily.
<break time="5s"/>
You are sitting on the bank of this river. The grass beneath you is soft. The air is warm. You can hear the water moving, a soft, constant sound, like a whisper that never stops.
<break time="5s"/>
Now imagine that each thought in your mind is a leaf. A small leaf, light and dry, sitting on the surface of your mind. And one by one, you are going to set each leaf on the water and watch it float away.
<break time="6s"/>
Pick up the first leaf. It is a thought about tomorrow. Something you need to do. Set it on the water. Watch the river take it. Slowly, gently, the leaf moves downstream. Getting smaller. Farther away. And then it turns a bend and is gone.
<break time="7s"/>
Pick up the next leaf. This one is something from today. A conversation. A decision. Set it on the water. Let the river have it. Watch it drift. Smaller. Farther. Gone.
<break time="7s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
Keep going. Each thought, each worry, each plan. A leaf on the water. The river takes them all. It does not judge them. It does not sort them. It just carries them away with the same steady current.
<break time="8s"/>
The river keeps moving. Your hands are empty. All the leaves are gone. And you sit on the bank and listen to the water, which is still moving, which will always be moving, and the sound of it is so constant and so steady that it becomes like breathing. In and out. Forward and forward.
<break time="8s"/>
You lie back on the grass. The sky above you is dark and full of stars. The river keeps whispering. The grass is soft beneath you. And there is nothing left to carry, nothing left to set down, nothing left to let go of. It is all downstream now. All of it. Carried away by water that does not need your help to flow.
<break time="9s"/>
You are empty and light and still. And the river moves. And the stars turn. And you rest.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── MEDITATION 06: ARRIVING AT REST ──
m06 = [
"""<speak>
<prosody rate="85%" volume="soft">
Settle in. Feel the weight of your body.
<break time="4s"/>
You are going to count backward from ten. With each number, you will feel yourself getting heavier, calmer, closer to sleep. There is no effort required. Just listen to the numbers and let them carry you.
<break time="5s"/>
Ten. You are awake. You are here. You can feel the bed beneath you and the air around you. All of it is normal. All of it is fine.
<break time="6s"/>
Nine. Your breathing slows. Just a little. Your body decided. It knows what to do.
<break time="6s"/>
Eight. Your muscles begin to let go. Starting with your face. Your forehead smooths. Your jaw loosens.
<break time="7s"/>
Seven. Your hands are heavy. Your feet are heavy. Everything below your neck has decided to stop working for the day.
<break time="7s"/>
Six. The sounds around you are getting softer. Not quieter, exactly. Softer. Like they are being heard through cotton. Through water. Through distance.
<break time="8s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="75%" volume="x-soft">
Five. You are halfway. The world above is getting farther away. The world below, the quiet one, the dark one, the restful one, is getting closer.
<break time="8s"/>
Four. Your thoughts are slowing down. The spaces between them are getting wider. Like the pause between waves.
<break time="9s"/>
Three. Heavy. Warm. Still. The bed is holding you. The dark is holding you. Everything is holding you.
<break time="9s"/>
Two. Almost there. The last small thread connecting you to the day is thin. Thin and getting thinner.
<break time="10s"/>
One. Let go.
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Meditations (6)")
    print(f"Voice: {VOICE_ID} | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("Letting the Day Go", "med-01-letting-day-go", m01),
        ("The Quiet Room", "med-02-quiet-room", m02),
        ("Clouds Passing", "med-03-clouds-passing", m03),
        ("The Staircase", "med-04-staircase", m04),
        ("The River Within", "med-05-river-within", m05),
        ("Arriving at Rest", "med-06-arriving-rest", m06),
    ]:
        build(name, slug, parts)
    print("\nDone! 6 meditations complete.")

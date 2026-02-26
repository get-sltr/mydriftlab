"""
DriftLab Stories 01-05
Run: python3 generate_stories_01_05.py
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

# ── STORY 01: THE RAIN HOUSE ──
s01 = [
"""<speak>
<prosody rate="92%" volume="soft">
It is raining.
<break time="3s"/>
You are inside a house. A small house with wooden floors and large windows. The kind of house where every room feels warm even before you turn on the heat. The kind of house that smells like wood and clean sheets and something baking a long time ago.
<break time="3s"/>
You are sitting in a chair by the window. It is a deep chair, the kind you sink into and do not want to leave. There is a blanket over your legs. It is soft and heavy and warm.
<break time="3s"/>
Outside, the rain is steady. Not a storm. Not a downpour. Just rain. The kind that starts in the afternoon and keeps going through the evening and into the night. The kind you can hear on the roof above you, a soft drumming, thousands of tiny taps, all at once, all the time.
<break time="4s"/>
The window in front of you is tall. Through it, you can see the yard. The grass is dark green and wet. There is a fence at the far end, old wood, the color of driftwood. Beyond the fence, there are trees. You cannot see much of them because the rain has made the air soft and grey, like everything past a certain distance has been gently erased.
<break time="4s"/>
The rain runs down the glass in thin lines. Some of them are fast. Some are slow. Some of them join together and become one thicker line that moves quickly to the bottom. You watch them without thinking about them. Your eyes follow one line, then another, then another. There is nothing to figure out. Nothing to solve. Just water on glass.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
Behind you, in the kitchen, there is a kettle on the stove. It is not boiling yet. You can hear the water inside it just starting to move, a faint hissing sound, the sound water makes when it is getting warm but is not yet ready. You do not need to get up. It will take care of itself.
<break time="5s"/>
The house is quiet except for the rain. There is a clock on the wall in the hallway, but it ticks so softly that you only hear it when everything else goes still. And even then, it sounds less like a clock and more like a heartbeat. Something steady. Something that has always been there.
<break time="5s"/>
You notice the light in the room is changing. Not because someone turned a switch. Because the afternoon is moving forward, the way afternoons do, slowly and without announcement. The grey light from the window is getting softer. Warmer. The shadows in the corners of the room are growing longer, but they are not dark. They are the color of tea. The color of honey in a glass jar held up to a window.
<break time="5s"/>
Your hands are resting on the arms of the chair. Your fingers are relaxed. Your shoulders are low. You did not decide to relax them. The chair did it for you. The blanket did it for you. The rain did it for you.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The kettle begins to whistle. It is a low whistle, almost a hum. You do not get up right away. You listen to it for a moment. It does not sound urgent. It sounds like the house is humming to itself.
<break time="5s"/>
You stand slowly. The blanket stays on your shoulders. The floor is cool under your feet but not cold. Three steps to the kitchen doorway. Four more to the stove. You turn off the burner. The kettle goes quiet. You pour the water into a cup where a tea bag is already waiting. The water turns dark. Steam rises and curls and disappears.
<break time="5s"/>
You carry the cup back to your chair. You sit down. You pull the blanket back over your legs. The cup is warm in your hands. You do not drink it yet. You just hold it and feel the warmth move through your palms, up through your wrists, into your arms.
<break time="6s"/>
Outside, the rain has not changed. It is still steady. Still soft. The yard is darker now. The fence is harder to see. The trees beyond it have become shapes without edges, grey and blue, like a painting that someone left out in the rain on purpose because it looked better that way.
<break time="7s"/>
You take a sip of tea. It is warm and simple. Nothing fancy. The kind of tea that tastes like comfort and not much else. And that is enough. That is exactly enough.
<break time="7s"/>
The rain keeps falling. The room keeps getting softer. The blanket keeps you warm. And you sit in your chair by the window and watch the water run down the glass and listen to the steady sound of something that requires nothing from you at all.
<break time="8s"/>
You could stay here forever. And right now, that is exactly what it feels like you are doing.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 02: THE FISHING VILLAGE ──
s02 = [
"""<speak>
<prosody rate="92%" volume="soft">
There is a small fishing village on the coast. You have never been here before, but it feels familiar. The kind of place you might have seen in a photograph once and remembered without knowing why.
<break time="3s"/>
The village has one main street that runs along the water. On one side, there are houses. Small ones. White walls. Blue doors. Some have flower boxes in the windows. On the other side of the street, there is the harbor. A stone wall curves out into the water, and inside that curve, the water is flat and calm, protected from the open sea.
<break time="3s"/>
You are sitting on the dock. Your legs hang over the edge. Your feet are a couple of feet above the water. The stone beneath you is warm because it has been in the sun all day. The sun is going down now, but the stone still holds the heat. It feels good against your hands when you lean back.
<break time="4s"/>
In the harbor, there are boats. Small fishing boats, painted in bright colors. Red and blue and yellow and green. They are tied to the dock with thick ropes, and they move gently with the water, rocking back and forth, back and forth. The ropes creak softly each time a boat shifts. It is a slow, easy sound.
<break time="4s"/>
The water in the harbor is clear enough that you can see the bottom. Sand and small stones and the occasional flash of a fish turning in the last of the sunlight. The water makes a quiet lapping sound against the boats and against the stone wall. It is the kind of sound that fills silence without breaking it.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
Out past the harbor wall, you can see the open sea. It is calm tonight. Long, slow waves rolling in from somewhere far away, rising gently and then flattening out as they reach the shallower water near the shore. The horizon is a straight line where the water meets the sky, and the sky is turning colors. Orange near the bottom. Then pink. Then a pale blue that gets darker the higher you look.
<break time="5s"/>
Two boats are coming in. You can see them out on the water, moving slowly toward the harbor entrance. They are close enough that you can hear their engines, a low steady hum that carries across the flat water. As they get closer, one of the fishermen raises his hand. Not waving exactly. Just a greeting. The way people do in small towns where everyone knows everyone.
<break time="5s"/>
The boats enter the harbor and the engines cut off. Suddenly it is quieter. The boats drift the last few feet to the dock on their own momentum. Ropes are thrown and tied. The hulls bump gently against the rubber bumpers on the dock wall. One of the fishermen steps out and stretches his back. Another one starts stacking plastic crates. Nobody is in a hurry.
<break time="6s"/>
You can smell the sea. Salt and something clean. And now, mixed with it, the smell of fish and diesel and wet rope. It is not a bad smell. It is the smell of work being done and then finished. The smell of a day ending.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
Behind you, in the village, someone has turned on a light. You can see it in one of the windows, a warm yellow square in a white wall. Then another light comes on, in a different house. Then another. One by one, the village is waking up for the evening, the way coastal towns do, slowly and without fuss.
<break time="6s"/>
Somewhere up the street, a door opens and closes. You can hear voices, but not the words. Just the sound of people talking, the rise and fall of conversation, comfortable and familiar, like music you have heard so many times that you do not need to listen to know how it goes.
<break time="7s"/>
The fishermen on the dock have finished their work. The crates are stacked. The ropes are coiled. The boats are tied and still, rocking so gently now that the motion is almost invisible. One of the men walks past you and nods. His boots are heavy on the stone. Then he is gone, up the street toward the lights.
<break time="7s"/>
You are alone on the dock. The sun is gone now, but the sky still holds a pale glow along the horizon. The water has changed color, from blue to grey to something darker, and the reflections of the village lights stretch out across the surface in long, shimmering lines that bend and shift with the movement of the water.
<break time="8s"/>
The stone beneath you is still warm. The air is cool but not cold. You can hear the water, and the boats, and the distant sound of the village settling into its evening. And you sit here, on the edge of the dock, with your feet above the water, and there is nowhere else you need to be.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 03: THE CABIN ──
s03 = [
"""<speak>
<prosody rate="92%" volume="soft">
The cabin is small. One room and a bathroom and that is all. But it has everything you need. A bed with a thick quilt. A fireplace with a stack of wood beside it. A window that looks out into the trees. And right now, it is snowing.
<break time="3s"/>
You arrived an hour ago. You carried your bag inside, turned on the light, and started a fire. The fire took a few minutes to catch, but now it is burning steadily, popping and crackling, filling the room with a warmth that reaches all the way to the corners.
<break time="3s"/>
The cabin smells like wood smoke and pine. The walls are made of logs, dark brown, smooth from years of being touched by the warmth of this same fireplace. The floor is wood too, covered with a thick rug near the bed that feels soft under your feet.
<break time="4s"/>
You are sitting on the bed. Your shoes are off. Your jacket is hanging on a hook by the door. You have a cup of something warm in your hands. Coffee or tea or hot chocolate, it does not matter. It is warm and it tastes good and that is all that matters right now.
<break time="4s"/>
Through the window, you can see the snow falling. Big flakes, the kind that fall slowly, drifting back and forth on their way down like they are in no hurry to reach the ground. The trees outside are tall pines, and their branches are already covered in white. The snow on the branches looks soft, like someone draped cotton over them carefully, one layer at a time.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
It is quiet outside. Snow does that. It covers everything and muffles every sound until the world feels wrapped in something thick and soft. No cars. No voices. No wind right now. Just the snow falling and the fire crackling and your own breathing.
<break time="5s"/>
The fire makes shadows on the wall. They move slowly, stretching and shrinking, flickering when a log shifts. You watch them the way you watch clouds. Not looking for shapes. Not looking for meaning. Just watching because your eyes want something gentle to rest on.
<break time="5s"/>
You take another sip from your cup. It has cooled down a little, just enough that you can drink it without waiting. The warmth goes down your throat and into your chest and you feel it spread. Your shoulders drop a little lower. Your hands relax around the cup. You did not know you were holding on so tight.
<break time="6s"/>
Outside, the snow is getting thicker. The trees that were clear an hour ago are starting to disappear behind a curtain of white. The world is getting smaller. Not in a bad way. In the way that feels safe. Like the snow is drawing a circle around this cabin and saying, this is all you need to think about tonight. This room. This fire. This bed.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
You set down your cup on the small table beside the bed. You pull back the quilt and slide underneath it. The sheets are cool for a moment, then warm quickly from your body. The quilt is heavy. Not too heavy. Just enough that you feel it holding you down gently, like a hand resting on your chest.
<break time="6s"/>
From the bed, you can still see the fire. The flames have gotten lower now. Less crackling, more glowing. The logs have turned into red and orange shapes that pulse with heat. Every few minutes, something shifts and a small shower of sparks rises up and disappears into the chimney.
<break time="7s"/>
You can still see the snow through the window. It has not stopped. The flakes are smaller now, and they fall straight down because there is no wind at all. The window has fogged up at the edges from the warmth inside, and through the clear center, the snow looks like static on an old television, soft and white and constant.
<break time="7s"/>
Your eyes are getting heavy. The fire is warm. The quilt is warm. The room is small and safe and quiet. Outside, the snow is covering everything. The path you walked to get here. The car you drove. The road that brought you. All of it disappearing under white, as if the world is agreeing with you that none of it matters right now.
<break time="8s"/>
The fire glows. The snow falls. And you are here, in this cabin, under this quilt, warm and still, with nothing to do and nowhere to go and no one expecting anything from you until morning.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 04: THE GARDEN AT DUSK ──
s04 = [
"""<speak>
<prosody rate="92%" volume="soft">
There is a garden behind the house. It is not a fancy garden. No fountains. No statues. Just plants and flowers and a stone path that winds through them from the back door to a bench at the far end.
<break time="3s"/>
You are walking the path. Slowly. The stones are flat and smooth and warm from the day's sun. You are barefoot and each step feels good. The stones fit your feet like they were placed here for exactly this purpose, which maybe they were.
<break time="3s"/>
The sun is low. Not gone yet, but low enough that the light is coming in from the side, making everything glow. The flowers along the path have that look they get in the evening, when the light turns golden and every color gets deeper and richer, like someone turned up the saturation on the whole world.
<break time="4s"/>
There are roses on your left. Deep red ones that are so dark they are almost black in the center. You stop and lean close. The smell is strong and sweet, the way roses smell when the air is warm and still, which it is right now. There is no wind. The garden is completely calm.
<break time="4s"/>
You keep walking. The path curves to the right, past a row of lavender bushes. The lavender is purple and grey and the smell hits you before you reach it. It smells like clean laundry. Like soap. Like something your grandmother had in her dresser drawers. You brush your hand over the tops of the bushes as you pass, and the smell gets stronger, and tiny bits of purple stick to your palm.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
Past the lavender, there is a patch of herbs. You can see them but more than that you can smell them. Basil and rosemary and mint, all growing close together, their smells mixing in the warm air. The basil is bright green with wide leaves. The rosemary is darker, with thin needle-shaped leaves. The mint is spreading everywhere the way mint always does, taking more space than it was given.
<break time="5s"/>
The path leads you past a small vegetable garden. Tomatoes on stakes, their branches heavy with fruit. Some are red. Some are still green. The leaves smell sharp and earthy when you brush against them. There are beans climbing up a wooden frame, and peppers hanging like little lanterns, yellow and red and orange.
<break time="5s"/>
You reach the bench. It is made of wood, old and grey from being outside in all seasons. You sit down. The wood is warm. From here, you can see the whole garden. The path you just walked. The roses. The lavender. The herbs. The vegetables. And beyond all of that, the back of the house, with its kitchen window lit up warm and yellow.
<break time="6s"/>
A bird is singing somewhere in the trees along the fence. You cannot see it. It does not matter. The song is clear and simple. A few notes repeated, then a pause, then the same notes again. It sounds like the bird is not performing. Just talking to itself. Just saying something small and true because the evening is beautiful and it feels like something that should be said.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The sun is almost down now. The golden light has turned to something softer. Rose and amber. The shadows in the garden are long and thin and they are all pointing the same direction, east, away from where the sun is disappearing.
<break time="6s"/>
The air is cooling. Just a little. Just enough that you notice the difference between how it felt when you started your walk and how it feels now. It feels like the garden is letting out a long, slow breath at the end of a warm day. And you are breathing with it. Slowly. Easily. Without trying.
<break time="7s"/>
The bird has stopped singing. The garden is quiet now. Not silent. You can hear insects. A soft buzzing and clicking that seems to come from everywhere at once. It is the sound summer evenings make. The sound of small things going about their business in the grass and the leaves and the flowers.
<break time="7s"/>
You lean back on the bench. The wood supports your back. Your hands rest on your legs. Your feet are on the warm stone. And you look at this garden that is slowly going to sleep around you. The flowers closing. The colors fading. The light pulling back like a tide going out.
<break time="8s"/>
And it is enough. This bench. This garden. This evening. The smell of lavender and roses and warm earth. The last light in the sky. It is more than enough.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 05: THE TRAIN RIDE ──
s05 = [
"""<speak>
<prosody rate="92%" volume="soft">
You are on a train. It is night. You have a window seat, and the compartment is nearly empty. Just you and your bag on the seat beside you and the quiet hum of the train moving.
<break time="3s"/>
The lights in the compartment are dim. Not off, but turned down low enough that you can see out the window without your own reflection getting in the way. The seat is comfortable. Not fancy, but worn in the right way. The fabric is soft. The backrest is angled just enough.
<break time="3s"/>
Outside the window, the countryside is dark. Not completely dark. There is a moon, almost full, and it lights up the fields in silver. You can see them rolling by, one after another. Flat fields of grass or wheat or something you cannot tell in the dark. They go on and on, stretching out to the horizon on both sides of the tracks.
<break time="4s"/>
The train makes a steady sound. The wheels on the rails, a rhythmic clicking that repeats every second or so. Click, click. Click, click. It is the kind of sound that your brain locks onto and then forgets about. It becomes part of the background, like a heartbeat. You do not notice it until it changes, and right now, it is not changing. The train is moving at the same speed it has been moving since you left the station.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
A small town passes by. You see it for maybe thirty seconds. A cluster of houses with lights in some of the windows. A church steeple. A parking lot with a few cars. A gas station, closed, its sign still glowing. Then it is gone, swallowed by the dark fields again. You wonder briefly about the people in those houses. What they are doing right now. Watching television. Reading. Getting ready for bed. Then the wondering fades, because the train has moved on and there is nothing outside the window but moonlight and fields again.
<break time="5s"/>
The train sways gently. Left, right. Left, right. It is a small motion, barely noticeable, but you can feel it in your body. It is like being rocked. Not aggressively. Just the tiniest movement, back and forth, the way a hammock moves in a breeze so light you cannot feel it on your skin but you can feel it in the swing.
<break time="6s"/>
You have nowhere to be. The train is going where it is going and you are going with it. You do not need to check the time. You do not need to check your phone. You do not need to watch for your stop because your stop is hours away and there is nothing to do between now and then except sit here and look out the window and listen to the sound of the wheels.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
A river appears alongside the tracks. You can see the moonlight on the water, a long silver line that curves and bends through the dark landscape. The train follows the river for a while, both of them heading in the same direction, the train on its tracks and the river in its bed. The water is smooth and dark except where the moonlight touches it.
<break time="7s"/>
The train passes over a bridge. The sound changes for a few seconds, a deeper rumble beneath you, a slight vibration in the floor. Then the bridge is behind you and the sound goes back to normal. Click, click. Click, click.
<break time="7s"/>
You lean your head against the window. The glass is cool against your temple. You can feel the vibration of the train through it, a gentle buzzing that is almost pleasant. Like a massage you did not ask for.
<break time="7s"/>
The fields keep passing. The moon keeps shining. The train keeps moving. And you sit here in your seat with the dim light and the steady rhythm and the cool glass against your skin, and you let the distance between where you were and where you are going grow longer and longer, and it does not matter how far it is, because right now you are right here, and right here is a good place to be.
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Stories 01-05")
    print(f"Voice: {VOICE_ID} | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("The Rain House", "story-01-rain-house", s01),
        ("The Fishing Village", "story-02-fishing-village", s02),
        ("The Cabin", "story-03-cabin", s03),
        ("The Garden at Dusk", "story-04-garden-dusk", s04),
        ("The Train Ride", "story-05-train-ride", s05),
    ]:
        build(name, slug, parts)
    print("\nDone! Stories 01-05 complete.")

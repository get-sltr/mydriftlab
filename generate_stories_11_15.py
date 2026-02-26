"""
DriftLab Stories 11-15
Run: python3 generate_stories_11_15.py
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

# ── STORY 11: THE LAUNDROMAT ──
s11 = [
"""<speak>
<prosody rate="92%" volume="soft">
It is eleven o'clock at night and you are in a laundromat. Not because you planned to be. Just because you needed clean clothes and this was the only time you could come, and honestly, this is the best time anyway. Nobody else is here.
<break time="3s"/>
The laundromat is bright. Fluorescent lights that make everything look slightly blue-white. Rows of washing machines on one side, dryers on the other. The floor is linoleum, clean, with that faint bleach smell that laundromats always have. In the corner, there is a folding table and two plastic chairs and a vending machine that hums to itself.
<break time="3s"/>
Your clothes are in the dryer. Two machines, because you waited too long and now you have a lot. The dryers are running, and the sound they make is the best thing about this place. A steady, low tumbling. The clothes going around and around inside the drum. The occasional soft thump when something heavy like a pair of jeans hits the bottom of the turn. Tumble, tumble, thump. Tumble, tumble, thump.
<break time="4s"/>
You are sitting in one of the plastic chairs. It is not comfortable, but you do not care. You are warm. The dryers push out heat, and the whole laundromat is warm because of it. Warm and bright and humming.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
Through the big front window, you can see the street. It is quiet. A few parked cars. A streetlight on the corner that casts a circle of orange on the sidewalk. Every now and then, a car passes, its headlights sweeping across the window and then gone.
<break time="5s"/>
The dryer window is round, like a porthole on a ship. You watch your clothes go around. Blue shirts and white socks and a grey hoodie, all tumbling over each other in slow motion. There is something hypnotic about it. The same rotation, over and over. The same clothes appearing at the top of the cycle and then disappearing to the bottom and then appearing again. You could watch it for hours.
<break time="5s"/>
The vending machine in the corner has a steady hum. It is lower than the dryers, a bass note underneath everything else. Together, the dryers and the vending machine create a sound that is not quiet but is deeply peaceful. Like the inside of an airplane at cruising altitude. A white noise that fills the space so completely that it becomes silence.
<break time="6s"/>
You pick up a magazine from the table. It is three months old. You flip through it without reading, just looking at the pictures. None of it matters. It is just something for your hands and eyes to do while the dryer does its work.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
A timer goes off on one of your dryers. A gentle beeping that means the first load is done. You do not get up right away. The beeping stops after a few seconds. The dryer goes still. The other one is still running, still tumbling, still making that warm, steady sound.
<break time="6s"/>
You get up slowly and open the dryer. The clothes inside are hot. You pull them out and they feel wonderful. Warm and soft and clean. You carry them to the folding table and spread them out. The heat rises off them like steam. You fold each piece slowly. A shirt. Another shirt. A pair of pants. Fold in half, fold in thirds, set aside. Fold in half, fold in thirds, set aside.
<break time="7s"/>
The second dryer is still running. You can hear it from across the room. That steady tumble. That soft thump. You go back to your chair and sit down and watch the clothes go around through the porthole window. Round and round and round.
<break time="7s"/>
Outside, the street is even quieter now. No cars. No people. Just the streetlight and the parked cars and the dark. And inside, just you and the warm, bright room and the sound of your clothes drying and the hum of the vending machine and the soft, clean smell of laundry, which might be the most comforting smell in the world.
<break time="8s"/>
You lean back in the plastic chair. It is not comfortable, but somehow it is. Because the room is warm and the sound is steady and your clothes are getting clean and there is absolutely nothing else in the world that needs your attention right now.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 12: THE GREENHOUSE ──
s12 = [
"""<speak>
<prosody rate="92%" volume="soft">
You push open the glass door and step inside, and immediately the world changes. Outside, it is cold. Grey sky, bare trees, wind that cuts through your jacket. But inside the greenhouse, it is warm and humid and green. So green. Green everywhere you look.
<break time="3s"/>
The greenhouse is long and narrow, with a curved glass ceiling that lets in all the light. The glass is foggy with condensation. Droplets of water cling to the inside, some of them slowly sliding down, leaving clear trails behind them. The light that comes through is soft and diffused, the way light looks through a shower door.
<break time="3s"/>
The air hits you like a warm towel. Thick and moist and heavy with the smell of soil and leaves and water. You take a deep breath and your lungs fill with it. Your face, which was tight from the cold outside, begins to relax. Your shoulders drop. The warmth soaks into you.
<break time="4s"/>
The path through the greenhouse is narrow, made of old brick, with moss growing in the cracks. On both sides, plants rise up on tables and shelves and from pots on the ground. Some of them are small, with leaves no bigger than your pinky nail. Some are enormous, with leaves the size of dinner plates, dark green and waxy and heavy, leaning out over the path like they want to touch you as you walk by.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You walk slowly. There is no reason to hurry. The greenhouse is not going anywhere and neither are you. You look at the plants as you pass them. You do not know all their names, but that does not matter. You know what they look like and how they smell and the way their leaves feel when you brush your fingers across them, which is what you are doing now. Running your hand along a row of ferns, feeling the soft, feathery fronds tickle your palm.
<break time="5s"/>
There is the sound of water. Not loud. A gentle dripping, coming from somewhere up ahead. As you walk closer, you find it. A watering system, a thin hose with small holes in it, stretched along one of the tables. Water drips from each hole, slowly, steadily, onto the soil below. Drip. Drip. Drip. It is the most patient sound in the world.
<break time="6s"/>
You pass a section of orchids. They are on a shelf at eye level, and their flowers are extraordinary. Purple and white and pink and yellow. Some of them have spots. Some have stripes. Their petals are thin and delicate and they look like they should not exist in nature, like they are too beautiful to be real. But here they are, quietly being beautiful, not needing anyone to notice.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
At the far end of the greenhouse, there is a bench. Wooden slats, painted green, though the paint is peeling. You sit down. The bench is warm from the air around it. From here, you can see the whole length of the greenhouse. The rows of plants. The foggy glass ceiling. The brick path stretching back to the door you came in through.
<break time="6s"/>
A drop of water falls from the ceiling and lands on a large leaf below it. The leaf bounces slightly from the impact, then goes still. Another drop falls. And another. It is slow and random and each drop makes the smallest sound, a tiny tap, barely there.
<break time="7s"/>
You can feel the warmth in your bones now. Not just on your skin, but deep inside, the way you feel after a hot bath or a long time under a heavy blanket. Your hands are warm. Your feet are warm. Your face is warm. The cold from outside is a memory that is already fading.
<break time="7s"/>
Outside, through the foggy glass, you can see the grey sky and the bare branches of a tree. But in here, everything is alive and warm and growing. The plants do not know what season it is. They do not care. They just grow, slowly and steadily, reaching toward the light, drinking the water, doing exactly what they are meant to do.
<break time="8s"/>
And you sit on the bench and breathe the warm, thick air and let the green surround you and there is nothing to do and nothing to think about and the only sound is the dripping of water and the quiet growing of a hundred plants that do not need anything from you at all.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 13: THE RECORD SHOP ──
s13 = [
"""<speak>
<prosody rate="92%" volume="soft">
The record shop is on a side street you almost missed. It does not have a big sign. Just a small wooden one above the door with the name written in faded gold letters. You push the door open and a bell rings above you, a single ding that echoes briefly and then is gone.
<break time="3s"/>
Inside, it smells like cardboard and dust and vinyl. The good kind of dust. The kind that means things have been here a long time and nobody is in a hurry to move them. The shop is small, maybe the size of a large living room. Every wall has shelves, and every shelf has records, standing upright, packed tight, hundreds of them.
<break time="3s"/>
In the center of the room, there are wooden bins, like the kind you see at flea markets. These are full of records too, organized by genre. Small handwritten cards separate the sections. Rock. Jazz. Soul. Classical. Folk. The cards are yellowed with age and the handwriting is neat and small.
<break time="4s"/>
Music is playing. Not loud. Just background level. Something with a piano and a slow drumbeat and a woman's voice singing low and easy. It comes from speakers mounted high on the walls, and it fills the room without filling it up. There is still plenty of space in the air for silence.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You start flipping through the records in one of the bins. The motion is satisfying. The records are packed tight, so you have to press them apart to see each cover. Flip, look, flip, look. The covers are works of art. Photographs and paintings and designs, some bold and colorful, some plain and simple, just text on a white background.
<break time="5s"/>
You pull one out. A jazz album. The cover is dark blue with a photograph of a man holding a trumpet, standing under a streetlight. You turn it over and read the track listing on the back. Song titles you do not recognize, which is good, because it means you have something new to discover.
<break time="5s"/>
The man behind the counter is reading a book. He looked up when you came in, nodded once, and went back to reading. He does not ask if you need help. He does not follow you around the shop. He is just there, in case you need something, which you do not. You like this about the shop. It lets you be.
<break time="6s"/>
The song on the speakers changes. Something different now. A guitar, acoustic, picked slowly, each note ringing clear for a moment before the next one comes. No voice. Just the guitar. It sounds like someone sitting on a porch playing for no one in particular.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
You move to the next bin. Soul. The covers here are beautiful. Men and women in sharp clothes, all confidence and style. You flip through them slowly. Some you recognize. Most you do not. Each one is a little window into a time and a place you can only imagine.
<break time="6s"/>
The light in the shop is warm. Not bright. The overhead lights have been turned down and there is a lamp on the counter near the register that gives off a yellow glow. The light makes the room feel like evening even though it is the middle of the afternoon.
<break time="7s"/>
You pick up another record. This one has a painting on the cover. A woman sitting in a field, looking at something in the distance. The colors are soft, muted, like the painting was done a long time ago and has faded in a way that made it more beautiful, not less.
<break time="7s"/>
You do not buy anything. Not today. Today is just for looking. For flipping through the bins. For standing in this warm, quiet room that smells like old cardboard and listening to music chosen by someone with good taste who does not feel the need to explain his choices.
<break time="8s"/>
The guitar on the speakers plays its last note. There is a pause. Then something new begins. Something soft. Something slow. And you keep flipping. And the bell above the door does not ring. And the afternoon stretches out in front of you, unhurried and wide and full of music you have not heard yet.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 14: THE BOAT ON THE LAKE ──
s14 = [
"""<speak>
<prosody rate="90%" volume="soft">
The lake is still. Completely still. Not a ripple anywhere except the ones your boat makes as it drifts slowly away from the dock. Those ripples spread out in wide circles and then disappear, and the lake goes back to being a mirror.
<break time="3s"/>
You rowed out here a few minutes ago. Just a few strokes of the oars, enough to get to the middle of the lake. Now the oars are resting in the boat and your hands are resting in your lap and the boat is drifting on its own, barely moving, turning very slowly in a direction you are not paying attention to.
<break time="3s"/>
The lake is not large. You can see the entire shore from where you are sitting. Trees all the way around. Pine and birch and a few oaks. They come right down to the water's edge. Their reflections in the lake are so clear that if you turned a photograph upside down, you would not know which was real and which was reflection.
<break time="4s"/>
The sun is going down behind the trees on the western shore. It is not visible anymore, but the light is still here, golden and warm, coming through the gaps in the branches and laying across the surface of the water in long, bright stripes.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The boat makes small sounds. The wood creaks occasionally. Water taps gently against the hull. The oars in their locks shift slightly and make a soft clinking sound. These are the only sounds, because the lake is quiet in the way that only water surrounded by trees can be quiet.
<break time="5s"/>
You trail your fingers in the water. It is cool but not cold. The surface tension resists for a moment before your fingers break through, and then the water flows around them, smooth and soft. You leave your hand there and watch the tiny wake your fingers make as the boat drifts, five thin lines fanning out behind your hand.
<break time="6s"/>
A fish jumps somewhere to your left. You hear it before you see it. A splash, quick and bright, and then rings spreading outward across the still surface. You turn and see the last of the rings dissolving. The fish is gone, back under the water where the world is dark and cool and silent.
<break time="6s"/>
The boat has turned so that you are facing east now, away from the sunset. The sky in this direction is darker. Deep blue shading toward purple. And high up, so high it looks like it is in a different world, a single airplane, its contrail catching the last of the sunlight, a thin line of gold drawn across the blue.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
The light is fading. The stripes of gold on the water are getting thinner. The reflections of the trees are getting darker. The lake is changing color, shifting from blue to grey to something deeper, a color that does not have a name, the color water turns when the day is ending and the night has not yet arrived.
<break time="7s"/>
You lean back in the boat. There is a cushion behind you and it supports your back. The boat rocks slightly as you shift your weight, a small movement, left and right, and then settles. You look up. The sky directly above you is enormous. Open and wide and getting darker by the minute, and the first stars are there, faint, like someone penciled them in and has not gone over them in ink yet.
<break time="7s"/>
The boat drifts. The water is still. The trees are dark shapes around the edge of the lake. You can hear frogs now. They started a few minutes ago, one at first, then more, a chorus of low sounds, some deep, some higher, all of them together making a sound that is the lake saying good night.
<break time="8s"/>
You could row back to the dock. You probably should, eventually. But not yet. Not yet. The boat is drifting and the sky is opening up above you and the water is holding you gently, the way water holds everything that floats, without effort, without complaint, just holding.
<break time="8s"/>
And that is all there is. The lake. The boat. The sky. And you, floating in the middle of all of it, still and quiet and perfectly, completely at rest.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 15: THE WINDOW SEAT ──
s15 = [
"""<speak>
<prosody rate="90%" volume="soft">
There is a window seat in the upstairs hallway. It was built into the wall when the house was built, a hundred years ago, maybe more. It is wide enough to sit in with your legs stretched out and deep enough that the wall surrounds you on three sides like a small cave.
<break time="3s"/>
You have put a cushion on it and two pillows against the wall and a blanket that you pulled from the closet. You are sitting in the window seat with the blanket over your legs and a book in your hands and outside the window, it is raining hard.
<break time="3s"/>
This is not gentle rain. This is a real storm. The kind where the rain hits the window so hard you can feel the vibration in the glass. The kind where the water does not fall straight down but comes in sideways, pushed by wind, slamming against the house in waves. The kind where you are grateful, deeply grateful, to be inside.
<break time="4s"/>
The window is old. Single pane. The glass is thick and slightly wavy. Rain runs down it in heavy streams that merge and split and merge again. Through the water, the world outside is blurred. You can see the shapes of things. The tree in the yard. The fence. The house next door. But everything is soft and out of focus, like an impressionist painting.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The sound of the rain is enormous. It is on the roof above you and on the window beside you and on the ground below you. It is everywhere. It drowns out everything else. The house could be full of people talking and you would not hear them over this rain.
<break time="5s"/>
But the house is not full of people. It is quiet except for the storm. It is just you, in this window seat, wrapped in this blanket, with this book. The hallway is dim. There is a lamp on a table at the far end, turned on low, and the light from it reaches you just enough to read by.
<break time="5s"/>
Your book is open but you are not reading. You stopped a few pages ago because the rain got louder and you wanted to listen to it. It sounds like applause. Like a thousand people clapping at different speeds, some fast, some slow, all of them together making a wall of sound that is chaotic and steady at the same time.
<break time="6s"/>
Lightning. A bright flash that turns the whole world white for a second. You see the tree and the fence and the rain, all of it frozen in light, sharp and clear. Then it is gone and the grey comes back. A few seconds later, thunder. Deep and long, starting with a crack and then rolling outward, getting lower and softer, rumbling across the sky like something heavy being dragged across a wooden floor upstairs.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The rain continues. It does not let up. If anything, it gets heavier. The water on the window is so thick now that you cannot see through it at all. Just color. Green from the tree. Grey from the sky. Dark from the fence. All of it melting together.
<break time="7s"/>
You pull the blanket higher. It covers your chest now, up to your chin. The blanket is soft. Old and soft, the kind of soft that comes from being washed a hundred times. It smells faintly like the closet it lives in, cedar and clean linen.
<break time="7s"/>
Another flash of lightning, farther away this time. The thunder comes later. Quieter. The storm is moving, heading east, taking its noise with it. But the rain stays. The rain will stay for a while. It has settled in.
<break time="7s"/>
You close your book and set it on the windowsill beside you. You lean back against the pillows. The window seat holds you. The walls around you are solid and old and thick and the rain hits them and does not get through. You are dry and warm and small in this little space, and the storm is big and loud and wild outside, and the distance between you and it is just a few inches of glass and a hundred years of brick, and that is enough. That is more than enough.
<break time="8s"/>
The rain falls. The thunder fades. The blanket keeps you warm. And you lean against the wall and listen to the oldest lullaby there is.
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Stories 11-15")
    print(f"Voice: {VOICE_ID} | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("The Laundromat", "story-11-laundromat", s11),
        ("The Greenhouse", "story-12-greenhouse", s12),
        ("The Record Shop", "story-13-record-shop", s13),
        ("The Boat on the Lake", "story-14-boat-lake", s14),
        ("The Window Seat", "story-15-window-seat", s15),
    ]:
        build(name, slug, parts)
    print("\nDone! Stories 11-15 complete.")

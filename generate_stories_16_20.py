"""
DriftLab Stories 16-20
Run: python3 generate_stories_16_20.py
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

# ── STORY 16: THE NIGHT KITCHEN ──
s16 = [
"""<speak>
<prosody rate="90%" volume="soft">
It is late. The rest of the house is dark and quiet. Everyone else is asleep. But you are in the kitchen, and the kitchen is warm, and you are making soup.
<break time="3s"/>
Not because you are hungry, really. Just because you felt like standing in a warm room and doing something simple with your hands. And soup is the simplest thing you know how to make.
<break time="3s"/>
The kitchen light is off. You turned on the light above the stove instead, the small one, the one that makes a little pool of warm light on the counter and the stove and leaves the rest of the kitchen in soft shadow. It feels better this way. Quieter. More like the middle of the night and less like the middle of the day.
<break time="4s"/>
You are chopping an onion. The knife moves slowly, steady, making thin slices that fan out across the cutting board. The sound of the knife is crisp. A firm tap each time it meets the board. You do not rush. There is no timer. There is no recipe. There is just you and the cutting board and the knife and the onion.
<break time="4s"/>
The pot on the stove is warming up. There is olive oil in the bottom, and it is starting to shimmer. You can smell it. Olive oil has a clean, grassy smell when it heats up. You sweep the onion off the cutting board and into the pot. A sizzle. The sound of moisture hitting hot oil. Then the sound settles into a gentle frying, like quiet static on a radio.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The onions start to soften. You stir them with a wooden spoon. The spoon is old and stained from years of stirring. It fits your hand perfectly. The onions go from white to clear to golden, and as they cook, the smell changes. It goes from sharp to sweet. The whole kitchen fills with it. The warm, sweet, rich smell of onions browning in olive oil, which might be the most comforting cooking smell there is.
<break time="5s"/>
You add garlic. Just a few cloves, chopped roughly. The garlic hits the pot and the smell deepens. Then carrots, peeled and cut into coins. Then celery, sliced thin. The pot is getting full of color now. Gold and orange and pale green.
<break time="5s"/>
You pour in broth. Slowly, watching it fill the spaces between the vegetables. The pot goes from sizzling to simmering. The surface of the broth moves gently, small bubbles rising from the bottom and popping at the surface. You turn the heat down. Low and slow. There is no hurry.
<break time="6s"/>
While the soup simmers, you lean against the counter. The counter is cool under your forearms. You stand there and listen to the pot. It makes a steady, quiet bubbling sound, like a conversation at a low volume. The steam rises and curls and disappears into the dark air above the stove.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The house is so quiet that you can hear things you normally do not. The refrigerator humming. The clock in the hallway ticking. A branch tapping against a window somewhere upstairs, moved by a wind you cannot feel in here.
<break time="6s"/>
You taste the soup. You dip the wooden spoon in and bring it to your lips and blow on it. It is hot and savory and simple. Salt, vegetables, broth. Nothing complicated. Nothing that needs a special ingredient or a technique you had to learn. Just the basics. And the basics are enough.
<break time="7s"/>
You add a little salt. A little pepper. You stir once more and then put the lid on, leaving it cracked so steam can escape. The sound changes to something even softer. A muffled simmer. A whisper.
<break time="7s"/>
You pour yourself a glass of water and sit down at the kitchen table. You sit and listen to the pot and the refrigerator and the clock and the branch, all of them making their small sounds in the dark, quiet house.
<break time="8s"/>
And you think, this is nice. This late night kitchen with its one small light and its warm pot of soup and its steady sounds. This is what peace feels like. Not the absence of something. The presence of something simple and good.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 17: THE COUNTRY ROAD ──
s17 = [
"""<speak>
<prosody rate="90%" volume="soft">
You are driving. Slowly. There is no one behind you and no one in front of you and the road is straight and flat and empty. It is a two-lane country road, the kind with no center line, just pavement and gravel shoulders and fields on both sides stretching out to the horizon.
<break time="3s"/>
The sun went down a while ago. The sky is that color it turns after sunset, when the blue deepens and the last orange fades and everything is in between day and night. Some people call it the blue hour. Others just call it dusk.
<break time="3s"/>
Your headlights are on but you do not really need them yet. There is still enough light in the sky to see the road. The headlights just make the pavement in front of you a little brighter. Two cones of yellow light reaching out ahead of you.
<break time="4s"/>
The car is warm inside. The heater is on low. The radio is off. The windows are up. The only sound is the engine, steady and low, and the tires on the pavement, a constant hiss that changes pitch slightly depending on the surface. Smoother pavement, higher pitch. Rougher, lower.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The fields on both sides of the road are harvested. Whatever grew here this summer is gone. The ground is dark and bare, with rows of short stubble running parallel to the road. In the blue light, the fields look like water. Like a calm, dark sea on both sides of you, and the road is the only solid thing.
<break time="5s"/>
A farmhouse appears on the right. You see it coming from a distance because the land is so flat. First just a light. Then the shape of the house. Then the barn beside it and the fence around it. A dog is in the yard, but it does not bark. It just watches you pass. The house has lights on in two windows. Then it is behind you and the road is empty again.
<break time="5s"/>
You drive with one hand on the wheel. Your other hand rests on your leg. The seat is comfortable. You have been driving for a while and the seat has shaped itself to you, and you to it, and now it is like sitting in a chair at home.
<break time="6s"/>
The sky is getting darker. The blue is deepening toward black. Stars are appearing. A few at first, then more, like someone is slowly turning up a dimmer switch on the sky. The road ahead of you is darker too, and your headlights are more important now, cutting through the dusk in two bright beams.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
You pass a small bridge over a creek. The road dips slightly and then rises again. The tires make a different sound on the bridge, a brief hollow thrum, and then it is gone and you are back on solid road.
<break time="6s"/>
There is no hurry. You are not late for anything. You are not driving toward a deadline or an appointment. You are just driving because the road is here and the evening is beautiful and the car is warm and the quiet hum of the engine is the best kind of company.
<break time="7s"/>
Another set of lights ahead. Not a house this time. A small town. A water tower. A gas station. A diner with a neon sign, half the letters lit, the other half dark. You pass through it in about thirty seconds. Then it is in your rearview mirror, getting smaller, and the road is empty again.
<break time="7s"/>
The stars are bright now. The sky is full of them. You can see them because out here there are no streetlights, no city glow, nothing between you and space except the glass of your windshield.
<break time="8s"/>
The road goes on. The engine hums. The tires hiss. And you drive slowly through the dark, flat, quiet world, with the stars above you and the fields around you and nothing ahead of you but more road and more night and more of this easy, endless peace.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 18: THE AQUARIUM ──
s18 = [
"""<speak>
<prosody rate="90%" volume="soft">
The aquarium is closed. Everyone has gone home. The lights in the hallways are turned off. But the tanks are still lit, glowing blue and green in the dark, and you are here, walking through the empty building, alone with the fish.
<break time="3s"/>
The first tank you pass is small. The size of a window. Inside, there are tiny fish, silver and yellow, moving together in a group. They turn at the same time, all of them, as if someone gave a signal that only they can hear. Left. Right. Up. Down. They stay together no matter what direction they go. A living cloud of silver.
<break time="3s"/>
The hallway curves to the right and the tanks get bigger. You stop at one that is built into the wall, floor to ceiling. The water inside is dark blue, like looking into the deep ocean. Somewhere in there, a sea turtle moves slowly, its flippers pulling it forward in long, easy strokes. It does not look like it is swimming. It looks like it is flying. Underwater flying, in slow motion, through blue space.
<break time="4s"/>
The glass of the tank is cold when you touch it. You put your palm flat against it and watch the turtle pass by. It does not look at you. It does not care that you are here. It has been swimming in this tank for years, doing the same laps, and a face on the other side of the glass is just part of the scenery.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You keep walking. Your footsteps echo slightly on the concrete floor. The only light comes from the tanks. Blue on one side, green on the other. The light moves because the water moves, and the water moves because the fish move, and so the whole hallway is full of light that shifts and ripples across the walls and the floor and your hands and your face.
<break time="5s"/>
There is a jellyfish tank. It is round, like a drum, and lit from below with soft purple light. The jellyfish float inside it. There are maybe twenty of them, translucent and slow, their bodies pulsing gently as they move through the water. Open, close. Open, close. They are so simple. No brain. No bones. Just a body made mostly of water, drifting through water, glowing purple in the light.
<break time="6s"/>
You stand at the jellyfish tank for a long time. There is something about watching them that makes your brain slow down. They do not think. They do not plan. They do not worry. They just pulse and drift and pulse and drift. And watching them, you start to feel a little like them. Simple. Slow. Drifting.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
The last room is the big one. The main tank. It takes up an entire wall, thirty feet wide, twenty feet tall. A window into a world. The water is deep blue, and inside it, everything is moving. Sharks glide by in long, smooth arcs. A manta ray passes overhead, its wide body rippling at the edges. Schools of fish, hundreds of them, move through the water in waves.
<break time="7s"/>
There is a bench in front of the tank. You sit down. The blue light washes over you. The water moves on the other side of the glass, and the light moves with it, and you are sitting in a room that is made of light and water and silence.
<break time="7s"/>
A shark passes close to the glass. It is bigger than you expected. Its skin is grey and smooth and its eye is dark and round and completely calm. It passes you without slowing down. Always forward, always gliding.
<break time="7s"/>
You lean back on the bench. The blue light is on your face and your hands and your closed eyes. You can still see it through your eyelids, a soft blue glow that pulses gently as the water moves. The fish swim. The sharks glide. The jellyfish pulse. And you sit here in the dark, quiet building, surrounded by water on the other side of glass, and everything is blue and slow and calm.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 19: THE WOOL SHOP ──
s19 = [
"""<speak>
<prosody rate="90%" volume="soft">
The wool shop is warm. That is the thing you notice before anything else. The cold from outside disappears the moment you step through the door, replaced by a warmth that is soft and dry and gentle, the kind of warmth that comes from a radiator that has been on all day.
<break time="3s"/>
The shop is small. One room. The walls are lined with shelves, and the shelves are full of yarn. Every color you can imagine and some you cannot. Deep reds and bright oranges and soft blues and rich greens and pale yellows and creamy whites. The yarn is wound into balls and skeins, some thick, some thin, some fluffy, some smooth. The shelves look like a painting made entirely of texture.
<break time="3s"/>
There is a woman behind the counter. She is knitting. Her hands move steadily, the needles clicking softly as they cross and loop and pull. She looks up when you come in and smiles, then looks back down at her work. She does not need to stop. Her hands know what to do without her watching.
<break time="4s"/>
You walk along the shelves. You touch the yarn as you go. Some of it is soft like a kitten's ear. Some is rough and thick, like rope. Some is somewhere in between. You pick up a ball of deep green wool and hold it. It is warm from the room. It is lighter than it looks. You press it against your cheek and it is the softest thing you have felt all day.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The sound of the knitting needles is steady. Click, click, click. It is a fast sound, but a quiet one, like tiny footsteps. The woman's hands move in a pattern. Right needle under left loop, wrap the yarn, pull through, slip off. Over and over. The fabric grows slowly from the ends of her needles, one row at a time.
<break time="5s"/>
There is a basket on the floor near the counter, full of finished scarves. You pick one up. It is thick and soft, made of a dark red yarn that feels heavy in your hands. You can see every stitch. Thousands of small loops, each one placed by hand, one after another, making a thing that is warm and beautiful and functional all at once.
<break time="5s"/>
Outside the shop window, it is grey and cold. People walk by with their collars up and their hands in their pockets. A bus passes. A bicycle. The wind moves a newspaper down the sidewalk. But inside, none of that matters. Inside is the warmth and the yarn and the clicking needles and the quiet.
<break time="6s"/>
There is a chair in the corner. A soft chair with a cushion on the seat. Beside it, a small table with a cup of tea that someone left there. The tea is still warm, you can see the steam. The chair is for customers who want to sit and knit. Or sit and not knit. Or just sit.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
You sit in the chair. The cushion is soft. You pick up a ball of pale blue yarn from the basket beside the chair and hold it in your lap. You are not going to knit. You do not know how. You are just going to sit here and hold this ball of yarn and listen to the needles and feel the warmth and look at all the colors on the walls.
<break time="7s"/>
The woman behind the counter finishes a row and turns her work. The needles start again. Click, click, click. It is the most patient sound in the world. Each stitch takes a second. A scarf takes thousands of stitches. She does not seem to mind. She seems to enjoy each stitch the same as the last, and the same as the next.
<break time="7s"/>
The radiator makes a soft ticking sound. The window fogs slightly at the edges from the warmth. The tea on the table sends a thin line of steam straight up into the still air. Everything in this room is slow and warm and unhurried.
<break time="7s"/>
You lean back in the chair. The ball of yarn is warm in your hands. The clicking needles keep their steady rhythm. And the shop holds you the way a warm sweater holds you, gently and completely, keeping the cold on the other side of the glass where it belongs.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 20: THE BOOKSHOP ──
s20 = [
"""<speak>
<prosody rate="90%" volume="soft">
There is a bookshop in a village so small that it does not have a traffic light. It does not need one. The single road that passes through the village carries so few cars that the cat who sleeps in the bookshop window has never learned to be afraid of them.
<break time="3s"/>
The shop is on the corner of the high street and a lane that has no name. The building is made of brick the color of dark bread, and its windows are the old kind, with thick glass that warps the light slightly, so that the books displayed behind them always look a little softer than they really are, as if the glass is dreaming them.
<break time="3s"/>
Inside, the shop is exactly as you would hope it would be. The ceilings are low. The shelves reach from floor to almost touching them, and they are full in the way that old bookshops are full. Not organized by any system that a stranger could follow, but arranged by a logic that makes sense to the woman who owns it.
<break time="4s"/>
Her name is Helen. She opens the shop at ten each morning and closes it at five each evening, except on Sundays, when she does not open at all, and on rainy afternoons, when she sometimes stays open late because the sound of rain on the roof makes the shop feel like the only warm room in the world.
<break time="4s"/>
Today is one of those afternoons. The rain began just after lunch, not heavy but steady, the kind of English rain that seems less like weather and more like a mood.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
Helen is behind the counter, which is not really a counter so much as an old oak table that she found at an estate sale twenty years ago and has used for everything since. Its surface is marked with ring stains from cups of tea and small scratches from keys and coins and the corners of books set down carelessly, and she loves every mark because each one is evidence that this table has been useful.
<break time="5s"/>
She is reading. Not a new book. An old one that she has read many times, a novel set in a house by the sea where very little happens and the beauty of it is in the noticing. She reads slowly, not because the words are difficult but because she does not want to arrive at the end any sooner than she has to.
<break time="5s"/>
The cat stirs in the window. It stretches, one long slow extension of its body from nose to tail, and then curls back into itself and closes its eyes. The rain taps against the glass behind it, and the cat's ears twitch once, twice, and then go still.
<break time="6s"/>
The shop is warm. The radiator near the door makes a soft clicking sound every few minutes. The warmth gathers near the ceiling and slowly descends, and the air in the shop feels thick and gentle, like a blanket that has been draped over the room itself.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
She turns a page. The paper whispers against her thumb. Outside, the rain continues, and the lane without a name is empty and shining and the gutters are carrying small rivers of water toward the drain at the corner.
<break time="7s"/>
And the books on their shelves are quiet too, each one holding its own world inside its covers, hundreds of worlds in this one small room, all of them waiting, not impatiently, just waiting, the way seeds wait in the ground through winter, complete and unhurried.
<break time="7s"/>
</prosody>
<prosody rate="75%" volume="x-soft">
Helen sets her book down on the table and lifts her cup of tea and finds that it has gone cold, which means she has been reading for longer than she thought, which is a thing that only happens when a book is doing what a book is supposed to do.
<break time="8s"/>
She does not mind the cold tea. She drinks it anyway, slowly, looking out through the warped glass at the rain, and she thinks, as she often thinks on afternoons like this, that there is nowhere else she would rather be, and nothing else she would rather be doing, and that this feeling, this exact feeling, is what people mean when they say the word home.
<break time="9s"/>
The rain falls. The cat sleeps. The books wait on their shelves. And the shop holds them all, gently, asking for nothing, offering everything, warm and still and full of stories that will be there whenever someone is ready to hear them.
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Stories 16-20")
    print(f"Voice: {VOICE_ID} | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("The Night Kitchen", "story-16-night-kitchen", s16),
        ("The Country Road", "story-17-country-road", s17),
        ("The Aquarium", "story-18-aquarium", s18),
        ("The Wool Shop", "story-19-wool-shop", s19),
        ("The Bookshop", "story-20-bookshop", s20),
    ]:
        build(name, slug, parts)
    print("\nDone! Stories 16-20 complete.")

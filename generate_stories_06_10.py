"""
DriftLab Stories 06-10
Run: python3 generate_stories_06_10.py
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

# ── STORY 06: THE BAKERY ──
s06 = [
"""<speak>
<prosody rate="92%" volume="soft">
It is four in the morning and the bakery is dark except for the light in the back. The front of the shop is empty. The display cases are clean and bare, waiting to be filled. The chairs are still upside down on the tables from last night's closing.
<break time="3s"/>
But in the back, in the kitchen, things are happening. Slowly and quietly, the way they happen every morning. The ovens have been on for an hour already. The room is warm. Warmer than outside, where the streets are empty and the air is cool and damp.
<break time="3s"/>
You are standing at the long wooden table in the center of the kitchen. In front of you, there is a mound of dough. It is smooth and pale and soft. You press your hands into it and push forward. The dough gives way, stretches, folds over itself. You pull it back and push again. There is a rhythm to it. Push, fold, turn. Push, fold, turn.
<break time="4s"/>
The dough feels good under your hands. It is warm from the yeast working inside it. Alive, almost. It resists a little when you push, then relaxes when you let go. You have done this a thousand times. Your hands know what to do without you telling them.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The kitchen smells like flour and butter and yeast. These are the base smells, the ones that are always here. Later, when things start baking, the smells will change. Bread has one smell. Croissants have another. Cinnamon rolls have another. But right now, before any of that, it just smells like possibility. Like the beginning of something.
<break time="5s"/>
You finish kneading and shape the dough into a round ball. You place it in a large metal bowl, cover it with a cloth, and set it aside. The yeast will do the rest. In an hour, the dough will have doubled in size, risen up under the cloth like it is breathing.
<break time="5s"/>
While you wait, you start on the croissants. The butter has been in the fridge overnight, cold and firm. You place it between two sheets of parchment paper and roll it flat with a wooden rolling pin. The pin makes a satisfying thud each time it presses down. Thud, roll. Thud, roll. The butter spreads and thins.
<break time="5s"/>
Outside, through the small window above the sink, the sky is still dark. But not as dark as it was an hour ago. There is a faint glow along the bottom edge, like someone turned on a light in the next room and it is leaking under the door. Morning is coming, but it is not here yet. You have time.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The first batch goes into the oven. You slide the tray in carefully and close the door. Through the glass, you can see the rolls sitting on the tray, pale and round, waiting for the heat to do its work. In twenty minutes they will be golden brown and the kitchen will smell like the best thing in the world.
<break time="6s"/>
You pour yourself a cup of coffee. The coffee maker has been on since you arrived. The coffee is strong and dark and hot. You drink it standing up, leaning against the counter, listening to the quiet sounds of the kitchen. The hum of the ovens. The tick of the clock. The soft settling sounds the building makes in the early morning, creaks and sighs, as if the building is still waking up.
<break time="7s"/>
The sky outside is getting lighter. Blue now, a deep blue that is just starting to separate from black. In another hour, the sun will be up. In another two hours, you will unlock the front door and flip the sign from closed to open and the first customers will come in, bringing the cold morning air with them, and they will smell what you have been making and they will smile without meaning to.
<break time="7s"/>
But that is later. Right now, it is just you and the kitchen and the bread rising under its cloth and the croissants waiting to be folded and the coffee in your cup and the steady warmth of the ovens and the quiet that belongs to people who are awake before the rest of the world.
<break time="8s"/>
And there is nowhere else you would rather be.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 07: THE BEACH AT LOW TIDE ──
s07 = [
"""<speak>
<prosody rate="92%" volume="soft">
The tide is out. Way out. The beach stretches so far in front of you that the waterline is just a thin silver strip in the distance. The sand between here and there is smooth and wet and firm under your feet.
<break time="3s"/>
You are walking. Not fast. Not with any destination. Just walking because the beach is wide open and the evening is warm and your feet like the feeling of the cool, packed sand.
<break time="3s"/>
The sun went down about twenty minutes ago. The sky is still bright along the horizon, a band of orange fading up into pink fading up into pale blue. Above you, the first stars are just starting to appear. One or two, the bright ones, the ones that always show up first like they want to make sure they get the best spots.
<break time="4s"/>
The sand under your feet leaves shallow footprints that fill with water almost immediately. You look behind you and see a trail of dark spots stretching back to where you started. In a few minutes, even those will be gone. Smoothed out by the thin layer of water that covers the sand when the tide is this low.
<break time="4s"/>
There are tide pools. Small ones, the size of dinner plates. Larger ones, the size of bathtubs. You stop at one and look in. The water is clear and still. You can see the bottom. Sand and small rocks and a few shells. A tiny crab, no bigger than your thumbnail, moves sideways across the bottom and then freezes, like it thinks that if it stays still enough, you will not see it.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You keep walking. The air smells like salt and seaweed and something clean that you cannot name but that you know is just the ocean itself. The smell of a thousand miles of water.
<break time="5s"/>
There are seashells scattered across the sand. Most of them are small. Broken halves of clam shells, white and purple on the inside. A few spiral shells, the kind that look like someone designed them on purpose. You pick one up and turn it over in your fingers. It is smooth and light and perfect. You put it in your pocket without thinking about it.
<break time="5s"/>
The sound of the waves is distant because the water is so far out. You can hear them breaking, but it sounds soft and far away, like someone shushing a baby in another room. Closer to you, the sounds are smaller. The soft squelch of your feet in the sand. The drip of water from a rock you just passed. A seagull somewhere behind you, making one call, then going quiet.
<break time="6s"/>
You come to a long, flat rock that sticks up out of the sand like a low table. You sit down on it. It is cool and smooth. From here, you can see the whole beach. Miles of wet sand in every direction. The sky getting darker. The stars getting brighter. The orange glow on the horizon getting thinner and thinner.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The tide will come back eventually. It always does. Slowly, the water will creep back across this sand, covering the footprints and the tide pools and the shells, filling in everything you walked past, until the beach is ocean again. But that will take hours. Right now, the water is still far away, and you have this whole wide space to yourself.
<break time="7s"/>
You lean back on your hands. The rock is solid beneath you. The air is getting cooler as the sky gets darker. It feels good. The kind of cool that comes after a warm day, gentle and welcome, like a cold glass of water when you are thirsty.
<break time="7s"/>
The stars are filling in now. Dozens of them. More every minute. The sky is deep blue directly overhead and still a faint peach near the horizon and the stars are scattered across both like someone threw handfuls of sand into the air and it stayed there.
<break time="7s"/>
You can hear the waves. Distant and steady. The same rhythm they have always had. Coming in, going out. Coming in, going out. The oldest sound in the world, and it is still going, and it does not care that you are listening, and that is exactly what makes it so easy to listen to.
<break time="8s"/>
The beach is wide and empty and dark and quiet and you are sitting right in the middle of it all, and you are not waiting for anything, and nothing is waiting for you, and the night is just beginning and it is already perfect.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 08: THE LIBRARY ──
s08 = [
"""<speak>
<prosody rate="92%" volume="soft">
The library is on the second floor of an old building downtown. You climb the stairs, push open the heavy wooden door, and step inside.
<break time="3s"/>
It is warm. That is the first thing you notice. Outside, it is cold and grey and the wind is sharp. But in here, the air is warm and still and smells like old books. Thousands of them. On shelves that go from the floor to the ceiling. Dark wood shelves, the kind that look like they have been here since the building was built, which was a very long time ago.
<break time="3s"/>
The ceiling is high. Much higher than a normal room. It makes the space feel open and grand, like a church or a train station. There are tall windows on one wall, and the grey winter light comes through them in wide, soft beams. You can see tiny particles of dust floating in the light, drifting slowly, going nowhere in particular.
<break time="4s"/>
You find a chair. It is in a corner, near one of the windows, a leather armchair that is cracked and faded from years of sun and use. You sit down and the leather creaks once and then accepts you. The chair is deep and the arms are wide and it feels like the chair was waiting for someone to sit in it. Maybe it was waiting for you.
<break time="4s"/>
You have a book in your hands. You do not remember choosing it. You just pulled it from a shelf as you walked past, and now here it is, a book about nothing important. A novel set in a country you have never been to, with characters whose lives are quiet and small and full of the kind of details that make you feel like you are right there with them.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The library is not empty, but it is quiet. There are other people here. A woman at one of the long tables, writing something by hand in a notebook. A man in another chair, reading with his glasses pushed up on his forehead, which means he is probably not reading anymore. An older man at the newspaper rack, slowly turning pages.
<break time="5s"/>
Nobody is talking. The only sounds are small ones. The turn of a page. A cough, muffled behind a hand. The creak of a chair as someone shifts their weight. The faint tick of the radiator, which is the source of all this warmth, pushing hot water through iron pipes that run along the baseboards.
<break time="5s"/>
You start reading. The words come easily. The sentences are calm and the paragraphs are long and the story moves slowly, the way good stories do when they are not in a hurry to get anywhere. You read one page, then another, then another. Your eyes move across the lines and the room around you fades. Not disappears. Fades. Like someone turned down the brightness on everything except the page in front of you.
<break time="6s"/>
Outside, through the tall window, you can see the rooftops of the buildings across the street. They are wet from an earlier rain that has already stopped. The sky is low and white and the kind of grey that does not look sad, just quiet. Like the sky itself decided to rest today.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
You stop reading and look up. Not because something happened. Just because your eyes wanted to rest on something farther away for a moment. The dust particles are still drifting in the light from the window. The woman at the table is still writing. The man with the glasses has closed his eyes. The library is the same as it was ten minutes ago and twenty minutes ago and probably the same as it was ten years ago.
<break time="7s"/>
There is something about this. About being in a room full of books, surrounded by stories that are waiting patiently on their shelves, stories that have been waiting for years and will wait for years more, not urgent, not demanding, just there. Available. Ready whenever someone reaches out and picks them up.
<break time="7s"/>
You close your book, but you keep your finger on the page. You let your head rest against the back of the chair. The leather is cool against the back of your neck. You look at the ceiling, which is so far above you. You can see the wooden beams that cross it, and between them, the plaster, and in one corner, a small crack that has probably been there for decades and will be there for decades more.
<break time="8s"/>
Your eyes get heavy. The book is in your lap. The chair is holding you. The library is warm and quiet and full of stories and the afternoon light is soft and grey and there is nothing you need to do except be here, in this chair, in this room, for as long as you want.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 09: THE POTTERY STUDIO ──
s09 = [
"""<speak>
<prosody rate="92%" volume="soft">
The studio is in the back of the building. You go through a door, down a short hallway, and there it is. One room with concrete floors and shelves full of finished and unfinished work and a single wheel in the center under a warm light.
<break time="3s"/>
It is late. The rest of the building is empty. The other studios are dark. But yours is lit, and the wheel is waiting, and there is a fresh block of clay on the table.
<break time="3s"/>
You sit down at the wheel. The stool is wooden and the right height for you because you adjusted it months ago and nobody has moved it. You pick up the clay. It is cool and dense and heavy for its size. You press it between your hands a few times, feeling the weight of it, getting used to it.
<break time="4s"/>
You begin to wedge the clay. This means you push it against the table with the heel of your hand, fold it over, turn it, and push again. Over and over. It is repetitive and physical and simple. You do it to get the air bubbles out. But you also do it because the rhythm feels good. Push, fold, turn. Push, fold, turn.
<break time="4s"/>
The studio smells like wet earth. Like a forest floor after rain. The clay has that smell. It fills the whole room. Mixed with it is the faint smell of the glazes on the shelves, and beneath that, the smell of the concrete floor, cool and mineral.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You place the clay on the center of the wheel and press it down firmly. You dip your hands in the bowl of water beside you. The water is cloudy from earlier work. Your hands are wet and cool. You press the foot pedal and the wheel begins to spin.
<break time="5s"/>
Slowly at first. The clay turns in front of you, a lopsided lump going around and around. You cup your hands around it and squeeze gently, steadily, and the clay begins to center. This is the most important part. Getting it centered. Your hands stay steady while the wheel spins and the clay moves under your palms, and gradually, slowly, it becomes round. Symmetrical. Balanced.
<break time="6s"/>
You press your thumbs into the center of the spinning clay. A hole opens up. You push down slowly, carefully, feeling the thickness of the bottom, making sure it is even. Then you begin to pull up. Both hands, one inside and one outside, drawing the walls of the clay upward. The lump becomes a cylinder. The cylinder becomes a shape. A bowl, maybe. Or a cup. You have not decided yet. You are just letting the clay show you what it wants to be.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
Water runs down the side of the clay as the wheel turns. It drips onto the tray below and makes a soft, steady sound. The wheel hums. Your hands are wet and slippery and the clay is smooth and alive under your fingers.
<break time="6s"/>
The walls of the piece get thinner as you pull them higher. You can feel the thickness between your fingers, inside and outside. You know when to stop. When the walls are thin enough to be elegant but thick enough to survive the kiln. Your hands know this.
<break time="7s"/>
You ease off the pedal. The wheel slows. The clay piece sits there, shining and wet, turning lazily. It is a bowl. Simple and round and a little uneven in a way that is not a mistake but a feature. The kind of unevenness that reminds you a person made this, not a machine.
<break time="7s"/>
You cut it off the wheel with a wire, sliding it under the base. You lift it carefully, gently, and set it on the shelf to dry. It will sit there overnight. By morning, it will be firm enough to trim. In a week, it will be fired. In two weeks, glazed. In three, it will be a bowl that someone eats breakfast from.
<break time="8s"/>
But right now it is just clay. Wet and fresh and new. And you sit at the wheel in the quiet studio with your wet hands and the smell of earth all around you, and you feel the kind of tired that comes from making something with your hands, which is the best kind of tired there is.
<break time="10s"/>
</prosody>
</speak>"""
]

# ── STORY 10: THE PORCH SWING ──
s10 = [
"""<speak>
<prosody rate="92%" volume="soft">
The porch wraps around the front of the house. It is made of wood that has been painted white so many times that the layers are thick and you can see the cracks where the paint has dried on top of paint on top of paint. The boards creak when you walk across them, but it is a good creak. A house-is-alive creak.
<break time="3s"/>
The swing is at the far end. It hangs from the ceiling on two chains that are strong enough to hold three people, though right now it is just you. You sit down and the swing moves back, then forward, then settles into a gentle motion. You push off with your foot and let it go.
<break time="3s"/>
It is summer. Late summer, when the days are still long but you can feel them getting shorter. The sun went down an hour ago and the sky is deep blue, almost purple, and the first fireflies are showing up in the yard. Little flashes of yellow-green light, here and there, random and beautiful, like someone is taking photographs in the dark.
<break time="4s"/>
The swing moves back and forth. The chains creak at the top with each swing. It is a slow, easy rhythm. You do not push anymore. The swing does it on its own, losing a tiny bit of momentum each time, getting slower and shorter, and you let it, because slower is fine.
<break time="4s"/>
The air is warm. Not hot like it was this afternoon, when the sun was high and everything felt heavy. Now it is that perfect evening warm, where the air feels like it is the same temperature as your skin, so you cannot tell where you end and the air begins.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
You can hear crickets. Thousands of them, all around, in the grass and the bushes and the trees. Their sound is constant and steady, a high-pitched humming that rises and falls slightly but never stops. It is the sound of summer nights. If you grew up somewhere warm, this is a sound you know in your bones.
<break time="5s"/>
The yard in front of the porch is big and dark. You can make out the shapes of things. The old oak tree in the middle with its wide branches. The mailbox at the end of the driveway. The fence along the road. Everything is a slightly different shade of dark. Black and dark grey and dark blue.
<break time="5s"/>
Down the road, a dog barks once, twice, and then stops. Somewhere farther away, you can hear a car driving. Just the sound of its engine and its tires on the road, getting louder as it gets closer, passing by without stopping, then getting quieter and quieter until it is gone and the crickets are the only sound left.
<break time="6s"/>
The swing has almost stopped. You are barely moving now. Just the smallest back and forth. You push off once more with your foot, gently, and the swing picks up again, not much, just enough. The chains creak. The boards under the swing shift. And you rock.
<break time="6s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
There is a glass on the table beside the swing. Something cold with ice in it. You pick it up and take a sip. The ice has mostly melted but the drink is still cool. It tastes like summer. Like the end of a day that was good and is now finished.
<break time="6s"/>
The fireflies are everywhere now. Dozens of them. Hundreds maybe. The whole yard is blinking with them. They float up from the grass and drift through the air, flashing their lights in no pattern you can figure out. You watch one rise up from near the fence, flash three times, and then go dark. Then another one picks up somewhere else. Then another.
<break time="7s"/>
You set the glass back down. You lean back in the swing and look up at the ceiling of the porch. It is painted blue. A tradition in some parts of the country. They say it keeps the wasps from building nests because they think it is the sky. You do not know if that is true, but the color is nice. A soft blue that is almost grey, and in the dark it does look a little like the sky.
<break time="7s"/>
The swing rocks. The crickets sing. The fireflies blink. The night is warm and wide and unhurried and you are on this porch, in this swing, with nowhere to be and nothing to think about, and the summer is all around you like a warm hand resting on your shoulder, gentle and familiar and in no rush to let go.
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print("\nDriftLab Stories 06-10")
    print(f"Voice: {VOICE_ID} | Output: {OUTPUT_DIR}/\n")
    for name, slug, parts in [
        ("The Bakery", "story-06-bakery", s06),
        ("The Beach at Low Tide", "story-07-beach", s07),
        ("The Library", "story-08-library", s08),
        ("The Pottery Studio", "story-09-pottery", s09),
        ("The Porch Swing", "story-10-porch-swing", s10),
    ]:
        build(name, slug, parts)
    print("\nDone! Stories 06-10 complete.")

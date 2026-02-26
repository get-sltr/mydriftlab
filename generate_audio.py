"""
DriftLab Content Generator v2
Splits long scripts into parts, concatenates into final MP3s.

SETUP:
1. pip3 install boto3
2. AWS credentials configured: aws configure
3. Run: python3 generate_audio.py
"""

import boto3
import os
import time

client = boto3.client('polly', region_name='us-east-1')
OUTPUT_DIR = './driftlab-audio'
os.makedirs(OUTPUT_DIR, exist_ok=True)

VOICE_ID = 'Danielle'


def generate_part(filename, ssml_text, engine='long-form'):
    try:
        response = client.synthesize_speech(
            Text=ssml_text,
            TextType='ssml',
            OutputFormat='mp3',
            VoiceId=VOICE_ID,
            Engine=engine,
        )
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(response['AudioStream'].read())
        size_kb = os.path.getsize(filepath) / 1024
        print(f"    Part saved: {filename} ({size_kb:.0f} KB)")
        return filepath
    except Exception as e:
        print(f"    ERROR on {filename}: {e}")
        return None


def concatenate_mp3s(parts, output_filename):
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    with open(output_path, 'wb') as outfile:
        for part in parts:
            if part and os.path.exists(part):
                with open(part, 'rb') as infile:
                    outfile.write(infile.read())
                os.remove(part)
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"  Final: {output_filename} ({size_mb:.1f} MB)")


keeper_parts = [
"""<speak>
<prosody rate="92%" volume="soft">
There is an island that does not appear on any map.
<break time="3s"/>
It sits where the Atlantic meets the North Sea, in a stretch of water so remote that ships pass it without noticing. Fishermen know it exists. They have seen its lighthouse from a distance on clear nights. But none of them have ever needed to go there, and so none of them ever have.
<break time="2s"/>
The island is small. You could walk its full perimeter in an afternoon if the wind was kind, which it rarely is. There are no trees. The ground is covered in long grass that leans permanently eastward, shaped by decades of wind into soft silver waves that ripple even on still days, as if remembering storms that passed long ago.
<break time="3s"/>
At the island's highest point, which is not very high at all, there is a lighthouse made of pale stone. It was built more than a hundred years ago by people whose names have been forgotten. The stone came from the island itself, cut from a quarry that is now a shallow pond where rainwater collects and reflects the sky.
<break time="2s"/>
The lighthouse has a keeper. Her name is Marguerite, though no one has called her that in years. She calls herself nothing. There is no one on the island to speak to, and she long ago stopped speaking to herself. She does not need words for the work she does.
<break time="3s"/>
Every evening, just before the sun touches the horizon, Marguerite climbs the seventy-three steps of the lighthouse. She has climbed them so many times that her feet know each one by feel. The fourteenth step has a small chip on its left edge. The thirty-first step is slightly shorter than the others. The fifty-eighth step has a faint groove worn into it from a century of footsteps, hers and all the keepers who came before her.
<break time="2s"/>
At the top, she lights the lamp. Not because ships are coming. Ships almost never come. She lights it because that is what the lighthouse is for, and she is its keeper, and some things do not need a reason beyond their own nature.
<break time="4s"/>
Tonight, she climbs the stairs a little more slowly than usual. Not because she is tired, though perhaps she is. But because the evening is unusually still, and the stillness seems to ask for slowness in return.
<break time="2s"/>
Outside the glass at the top of the tower, the sea stretches in every direction, flat and silver and enormous. The sun is low, turning the water the color of old honey. There is no wind at all, which is so rare on this island that Marguerite stands at the window for a long moment, simply looking.
<break time="3s"/>
She has been the keeper for eleven years. Before that, there was a man named Callum who kept the light for thirty-two years. Before Callum, there was a woman whose name Marguerite found carved into the wooden frame of the bedroom door: Elspeth, 1961. She sometimes wonders about Elspeth. Whether she stood at this same window on evenings like this. Whether the stillness felt the same to her.
<break time="4s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
The lamp takes a few minutes to warm. It is an old mechanism, older than electric light, though it has been converted now to run on a generator that hums softly in the basement of the lighthouse, a sound so constant that Marguerite no longer hears it, the way you stop hearing your own heartbeat unless you listen for it.
<break time="4s"/>
While the lamp warms, she performs the small rituals of evening. She checks the glass for salt residue. On stormy nights, the spray reaches even this high, leaving a fine white crust that dims the beam. Tonight the glass is clean. She runs a cloth over it anyway, slowly, in wide circles, because the motion is soothing and there is nowhere else she needs to be.
<break time="5s"/>
Below the lantern room there is a small kitchen where she makes her evening tea. The kitchen has one window that faces west, and she has positioned her chair so that she can watch the last light drain from the sky while the kettle heats. The kettle is copper, darkened with age, and it makes a sound when it begins to boil that is less like a whistle and more like a long, slow exhale.
<break time="4s"/>
She pours the water over the tea leaves and watches the color bloom. Dark amber spreading outward from the center of the cup like ink dropped into still water. She does not time it. She waits until it looks right, and it always looks right at about the same moment, because eleven years of making tea in the same cup with the same leaves from the same tin has given her hands a knowledge that does not need measuring.
<break time="5s"/>
The tea is warm and slightly bitter and tastes the way this kitchen has always smelled. She carries it back up the stairs, all seventy-three of them, and sits in the chair beside the lamp, which is now burning steadily, sending its wide beam out across the darkening water.
<break time="5s"/>
From here, she can see the sea in all directions. The sun has gone now, but the sky still holds a faint glow along the western horizon, a thin band of pale rose that will linger for another half hour before the dark takes it. The water has shifted from silver to a deep, soft grey, the color of old pewter, and it moves so gently tonight that the motion is almost invisible, just a slow, rhythmic lifting and lowering, as if the entire ocean were breathing.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
The stars are beginning to appear. Not all at once, but one by one, as if someone very patient were placing them carefully in their correct positions. First the brightest ones, the ones that insist on being seen even before the sky is fully dark. Then the smaller ones, filling in the spaces between, until the sky above the island is dense with light, so much light that the darkness between the stars seems thin, like fabric worn almost to transparency by years of use.
<break time="6s"/>
There is no moon tonight. Marguerite knows this without checking, because she has lived with the tides long enough to carry the moon's schedule in her body the way birds carry the seasons. A moonless night means the stars are brighter and the sea is darker and the lighthouse beam is the only line drawn between the two.
<break time="7s"/>
She sets down her empty cup and leans back in her chair. The chair is old and has shaped itself to her over the years, the way a favorite coat shapes itself to the body that wears it, so that sitting in it now feels less like sitting and more like being gently held. She closes her eyes for a moment. Not to sleep, though sleep would come easily if she let it. Just to listen.
<break time="7s"/>
The ocean is so quiet tonight that she can hear the individual waves arriving at the island's shore far below, each one a soft collapse of water onto stone, followed by a long whispered retreat as the water pulls back, gathering itself to arrive again. The rhythm is so steady and so ancient that it feels less like a sound and more like a pulse, the heartbeat of something vast and calm and endlessly patient.
<break time="7s"/>
She breathes in time with it without meaning to. The wave arrives. She breathes in. The wave retreats. She breathes out. And in the space between breaths, there is a stillness so complete that it seems to have a texture, like velvet, like the inside of a shell held up to your ear, where the silence sounds like the memory of the sea.
<break time="8s"/>
The lamp turns. The beam goes out. The beam returns. And each time it returns it illuminates the same water, the same darkness, and yet each time the light touches the sea it seems to discover it for the first time, as if the act of looking is always new, always a small astonishment, the way opening your eyes each morning is a small astonishment even though you have done it ten thousand times before.
<break time="8s"/>
Marguerite lets her thoughts grow quiet. This is not something she forces. It is something that happens here, in this chair, in this light, on nights like this. The thoughts do not stop so much as they slow, like boats drifting into harbor on a falling tide, losing their momentum gradually, turning gently, finding their places along the dock, and going still.
<break time="8s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="75%" volume="x-soft">
The island holds its breath. The grass has gone still. The sea lifts and lowers, lifts and lowers, as if rocking something very gently toward sleep. The stars turn overhead in their slow, enormous wheel, and the lighthouse turns beneath them, answering their ancient light with its own small, steady one.
<break time="9s"/>
Somewhere far to the south, on a coast she cannot see, a harbor is filling with boats returning from the day's work. Ropes are being coiled. Engines are going quiet. Lanterns are being lit in kitchens. Doors are closing softly against the night air. And the people in those houses are sitting down to their evening meals, or reading, or watching the last light fade from their own windows, and each of them is arriving, in their own way, at the same stillness that Marguerite has already found.
<break time="9s"/>
Because stillness is not emptiness. It is the fullness that comes when everything unnecessary has been set down. The worries of the day. The plans for tomorrow. The noise of wanting and remembering and reaching. All of it set down, the way you set down a heavy bag at the end of a long walk, and suddenly your shoulders remember what it feels like to carry nothing at all.
<break time="10s"/>
The beam turns. The stars drift. The waves arrive and retreat and arrive again, patient and unhurried, as they have done since long before this lighthouse was built and will continue to do long after the last stone has fallen and the island has returned to the sea.
<break time="10s"/>
And Marguerite sits in her chair at the top of the light, wrapped in a silence that is not lonely but rather full, full the way a deep breath is full, full the way a calm sea is full, holding everything gently on its surface and asking for nothing in return.
<break time="10s"/>
The lamp turns. The light goes out across the water. And the water holds it for a moment, just a moment, before letting it pass, the way sleep takes a last thought and holds it gently and then lets it go.
<break time="10s"/>
</prosody>
</speak>"""
]

meditation_parts = [
"""<speak>
<prosody rate="85%" volume="soft">
Find a position that feels comfortable. You do not need to lie perfectly still. Just let your body settle into whatever shape feels right.
<break time="5s"/>
Close your eyes. And take one breath that is a little deeper than the last. Breathe in slowly through your nose. And let it go through your mouth. Not forcefully. Just letting the air leave on its own, the way a door swings closed when you stop holding it.
<break time="6s"/>
You have been carrying this day for hours. All of its conversations, its decisions, its small tensions and quiet efforts. You carried them well. But you do not need to carry them anymore. The day is over. It is finished. And now there is nothing required of you except to be here.
<break time="7s"/>
Bring your attention to the top of your head. You do not need to do anything. Just notice it. The weight of it against the pillow. The temperature of the air against your scalp. And as you notice it, let whatever tightness lives there begin to soften. The small muscles around your forehead. Your temples. The space behind your eyes where tension gathers when you have been looking at things too hard for too long.
<break time="7s"/>
Let your forehead become smooth. Let your eyebrows grow heavy. Let the muscles around your eyes release so completely that your eyelids feel like they are resting, not closed by effort but simply resting, the way a leaf rests on the surface of still water.
<break time="8s"/>
Let that softness move down into your jaw. Your jaw holds so much of the day. Every word you spoke, every word you considered speaking and did not. Let it unhinge slightly. Let your teeth part. Let your tongue rest heavy in your mouth, released from the work of forming language.
<break time="8s"/>
Now your neck. The muscles that held your head upright all day, that turned when someone called your name, that bent toward screens and conversations and tasks. They can let go now. There is nothing to hold up. Nothing to look at. The pillow holds your head and you can let it, fully, without reservation, the way you hand something to someone you trust completely.
<break time="8s"/>
Your shoulders. Drop them. Even now, even lying down, they are probably holding. Let them fall back into the bed. Let the bed take their weight. All the way down. Further than you think. There is always more to release. Let them be heavy. Let them be so heavy that they press into the mattress and leave an impression, as if the bed is remembering the shape of you.
<break time="9s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="80%" volume="x-soft">
Your arms. Your hands. Your fingers. Let them uncurl if they are curled. Let them lie open, palms up or down, whichever way they fell. Notice the warmth gathering in your palms. The gentle pulse in your fingertips. Your hands did so much today. Typing, holding, opening, reaching. They are done now. They can be still.
<break time="9s"/>
Your chest. Your breathing has already begun to slow, and you did not need to try. That is your body remembering what it knows how to do when you stop asking it to do other things. Each breath comes a little slower and a little deeper, and the space between breaths grows a little wider, and in that widening space there is a quietness that feels like coming home.
<break time="9s"/>
Your stomach. Your hips. Your lower back, where the day often settles, a dull ache that you carry without noticing until you lie down and the absence of standing reveals how much effort standing required. Let the bed support all of it. Every ounce. You are not floating. You are held.
<break time="10s"/>
Your legs. Heavy now. The muscles in your thighs releasing their last hold on the day, the walking and climbing and standing and bracing. Let them be still. Let them be so still that they seem to sink into the mattress, the way a stone sinks slowly into soft sand.
<break time="10s"/>
Your feet. The soles of your feet, which carried you through every room and every step of this day. Let them rest. Let the arches soften. Let the toes uncurl. They are done.
<break time="9s"/>
Now your whole body, from the top of your head to the soles of your feet, is resting. Not because you are trying to rest, but because you have stopped doing all the things that were keeping you from resting. And that is all sleep is. It is not something you do. It is what remains when you stop doing everything else.
<break time="10s"/>
So let the last thoughts come if they want to come. They will pass through like clouds crossing a wide, dark sky. You do not need to follow them. You do not need to answer them. They are just the last echoes of a day that is already over, already behind you, already becoming memory.
<break time="10s"/>
And in the quiet that follows, there is only this. Your breath. Your body. The gentle weight of the dark. And the slow, certain knowledge that you are exactly where you are supposed to be.
<break time="10s"/>
</prosody>
</speak>"""
]

breathing_parts = [
"""<speak>
<prosody rate="85%" volume="soft">
Get comfortable. Let your shoulders drop. Let your jaw soften. We are going to breathe together, slowly, in a rhythm that tells your body it is safe to rest.
<break time="4s"/>
The pattern is simple. Breathe in for four counts. Hold for seven. Breathe out for eight. I will guide you through the first few rounds, and then you can continue on your own.
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
Now continue on your own. Keep the same rhythm. In for four. Hold for seven. Out for eight.
<break time="10s"/>
You are doing well. Let each breath carry you a little deeper.
<break time="10s"/>
There is nothing else to do. Just breathe.
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
<break time="10s"/>
</prosody>
</speak>"""
]

bookshop_parts = [
"""<speak>
<prosody rate="90%" volume="soft">
There is a bookshop in a village so small that it does not have a traffic light. It does not need one. The single road that passes through the village carries so few cars that the cat who sleeps in the bookshop window has never learned to be afraid of them.
<break time="3s"/>
The shop is on the corner of the high street and a lane that has no name, or if it once had a name, no one alive remembers it. The building is made of brick the color of dark bread, and its windows are the old kind, with thick glass that warps the light slightly, so that the books displayed behind them always look a little softer than they really are, as if the glass is dreaming them.
<break time="3s"/>
Inside, the shop is exactly as you would hope it would be. The ceilings are low. The shelves reach from floor to almost touching them, and they are full in the way that old bookshops are full, not organized by any system that a stranger could follow, but arranged by a logic that makes sense to the woman who owns it, a logic built from thirty years of placing books where they seem to want to be.
<break time="3s"/>
Her name is Helen. She opens the shop at ten each morning and closes it at five each evening, except on Sundays, when she does not open at all, and on rainy afternoons, when she sometimes stays open late because the sound of rain on the roof makes the shop feel like the only warm room in the world and she cannot bring herself to lock the door against anyone who might need it.
<break time="4s"/>
Today is one of those afternoons. The rain began just after lunch, not heavy but steady, the kind of English rain that seems less like weather and more like a mood, a gentle grey suggestion that perhaps today is a day for being indoors, for tea and reading and the particular quietness that comes when water is falling softly on the other side of a window.
<break time="4s"/>
Helen is behind the counter, which is not really a counter so much as an old oak table that she found at an estate sale twenty years ago and has used for everything since. Its surface is marked with ring stains from cups of tea and small scratches from keys and coins and the corners of books set down carelessly, and she loves every mark because each one is evidence that this table has been useful, that it has held things for people who needed a place to set things down.
<break time="5s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="85%" volume="soft">
She is reading. Not a new book. An old one that she has read many times, a novel set in a house by the sea where very little happens and the beauty of it is in the noticing, in the way the author describes the light changing on the water through a kitchen window, or the sound a wooden spoon makes when it is set down on a stone countertop, or the exact quality of silence that fills a room after someone has left it.
<break time="5s"/>
She reads slowly, not because the words are difficult but because she does not want to arrive at the end any sooner than she has to. There is a kind of reading that is less about finding out what happens and more about being inside the sentences, letting them surround you the way warm water surrounds you in a bath, and this is the kind of reading Helen is doing now, on this rainy afternoon, in this shop that smells like old paper and wood polish and the faintly sweet dust that gathers on books that have been sitting in the same place for a very long time.
<break time="6s"/>
</prosody>
<prosody rate="80%" volume="x-soft">
The cat stirs in the window. It stretches, one long slow extension of its body from nose to tail, and then curls back into itself and closes its eyes. The rain taps against the glass behind it, and the cat's ears twitch once, twice, and then go still.
<break time="7s"/>
The shop is warm. The radiator near the door makes a soft clicking sound every few minutes, a sound so familiar that Helen hears it only when it stops, the way you notice the absence of a clock's ticking more than the ticking itself. The warmth gathers near the ceiling and slowly descends, and the air in the shop feels thick and gentle, like a blanket that has been draped over the room itself.
<break time="7s"/>
</prosody>
</speak>""",
"""<speak>
<prosody rate="78%" volume="x-soft">
She turns a page. The paper whispers against her thumb. Outside, the rain continues, and the lane without a name is empty and shining and the gutters are carrying small rivers of water toward the drain at the corner, where the water turns and disappears, going somewhere underground, somewhere dark and cool and quiet.
<break time="8s"/>
And the books on their shelves are quiet too, each one holding its own world inside its covers, hundreds of worlds in this one small room, all of them waiting, not impatiently, just waiting, the way seeds wait in the ground through winter, complete and unhurried, knowing that someone will come for them eventually, and until then, the waiting itself is a kind of rest.
<break time="8s"/>
</prosody>
<prosody rate="75%" volume="x-soft">
Helen sets her book down on the table, open and face down to hold her place, and lifts her cup of tea and finds that it has gone cold, which means she has been reading for longer than she thought, which is a thing that only happens when a book is doing what a book is supposed to do, which is to make time disappear.
<break time="9s"/>
She does not mind the cold tea. She drinks it anyway, slowly, looking out through the warped glass at the rain, and the lane, and the grey sky that is soft and low and close, like a ceiling made of cloud, and she thinks, as she often thinks on afternoons like this, that there is nowhere else she would rather be, and nothing else she would rather be doing, and that this feeling, this exact feeling, is what people mean when they say the word home.
<break time="10s"/>
The rain falls. The cat sleeps. The books wait on their shelves. And the shop holds them all, gently, the way a cupped hand holds water, carefully and completely, asking for nothing, offering everything, warm and still and full of stories that will be there whenever someone is ready to hear them.
<break time="10s"/>
</prosody>
</speak>"""
]

if __name__ == '__main__':
    print(f"\nDriftLab Audio Generator v2")
    print(f"Voice: {VOICE_ID}")
    print(f"Output: {OUTPUT_DIR}/\n")

    print("Generating: The Keeper of Tides...")
    parts = []
    for i, ssml in enumerate(keeper_parts):
        p = generate_part(f"_keeper_part{i+1}.mp3", ssml, engine='long-form')
        parts.append(p)
        time.sleep(1)
    concatenate_mp3s(parts, "01-keeper-of-tides.mp3")

    print("\nGenerating: Letting the Day Go...")
    parts = []
    for i, ssml in enumerate(meditation_parts):
        p = generate_part(f"_meditation_part{i+1}.mp3", ssml, engine='long-form')
        parts.append(p)
        time.sleep(1)
    concatenate_mp3s(parts, "02-letting-the-day-go.mp3")

    print("\nGenerating: 4-7-8 Breathing...")
    parts = []
    for i, ssml in enumerate(breathing_parts):
        p = generate_part(f"_breathing_part{i+1}.mp3", ssml, engine='neural')
        parts.append(p)
        time.sleep(1)
    concatenate_mp3s(parts, "03-breathing-478.mp3")

    print("\nGenerating: The Bookshop at the End of the Lane...")
    parts = []
    for i, ssml in enumerate(bookshop_parts):
        p = generate_part(f"_bookshop_part{i+1}.mp3", ssml, engine='long-form')
        parts.append(p)
        time.sleep(1)
    concatenate_mp3s(parts, "04-bookshop-end-of-lane.mp3")

    print(f"\nDone! 4 audio files in {OUTPUT_DIR}/")

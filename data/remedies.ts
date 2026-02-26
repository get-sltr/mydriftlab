/**
 * Curated remedy library — evidence-based sleep improvement strategies.
 *
 * Each remedy has matching rules that connect it to user metrics
 * (BDI, sleep efficiency, snoring frequency, etc.) so the
 * remedyMatcher can suggest relevant interventions.
 */

import type { Remedy } from '../lib/types';

export const remedies: Remedy[] = [
  // ── Positional ──────────────────────────────────────────
  {
    id: 'side-sleeping',
    name: 'Side Sleeping',
    category: 'positional',
    description:
      'Sleeping on your side reduces airway collapse and snoring. Gravity keeps soft tissue from obstructing the airway.',
    howTo:
      'Place a pillow behind your back to prevent rolling onto your back. Some people sew a tennis ball into the back of a sleep shirt.',
    evidenceLevel: 'strong',
    source: 'Journal of Clinical Sleep Medicine, 2014',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 5 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'elevated-pillow',
    name: 'Elevated Pillow (30°)',
    category: 'positional',
    description:
      'Elevating the head 30° reduces gravitational collapse of upper airway tissues and can decrease snoring intensity.',
    howTo:
      'Use a wedge pillow or stack pillows to achieve a 30-degree angle. A bed risers set under the headboard also works.',
    evidenceLevel: 'moderate',
    source: 'Sleep and Breathing, 2017',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 10 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'tennis-ball',
    name: 'Tennis Ball Technique',
    category: 'positional',
    description:
      'A tennis ball sewn into the back of a sleep shirt physically prevents supine sleeping, the position most associated with snoring.',
    howTo:
      'Sew a pocket onto the back of a T-shirt and insert a tennis ball. Alternatively, use a specialized positional therapy belt.',
    evidenceLevel: 'moderate',
    source: 'Sleep Medicine Reviews, 2015',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'snoring_nights_per_week', condition: 'gte', value: 3 }],
    experimentDuration: 7,
    disclaimer: null,
  },

  // ── Environmental ──────────────────────────────────────
  {
    id: 'room-temp',
    name: 'Room Temperature 65-68°F',
    category: 'environmental',
    description:
      'The ideal sleep temperature is 60-67°F (15.5-19.5°C). Too warm or too cold disrupts slow-wave sleep.',
    howTo:
      'Set your thermostat to 65-68°F before bed. Use breathable bedding materials like cotton or bamboo.',
    evidenceLevel: 'strong',
    source: 'Sleep Medicine Reviews, 2012',
    targetMetrics: ['temperature_events', 'sleepEfficiency'],
    matchRules: [{ metric: 'temperature_events', condition: 'gt', value: 2 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'white-noise',
    name: 'White Noise Machine',
    category: 'environmental',
    description:
      'Consistent background noise masks sudden sound disruptions (traffic, neighbors, pets) that fragment sleep.',
    howTo:
      'Place a white noise machine or fan near your bed. Set volume just loud enough to mask environmental sounds without being distracting.',
    evidenceLevel: 'moderate',
    source: 'Journal of Caring Sciences, 2016',
    targetMetrics: ['noise_events', 'sleepEfficiency'],
    matchRules: [{ metric: 'noise_events', condition: 'gt', value: 3 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'blackout-curtains',
    name: 'Blackout Curtains',
    category: 'environmental',
    description:
      'Even dim light exposure during sleep suppresses melatonin production and disrupts circadian rhythm.',
    howTo:
      'Install blackout curtains or use a sleep mask. Cover any LED indicator lights in the bedroom with tape.',
    evidenceLevel: 'strong',
    source: 'Journal of Clinical Endocrinology, 2011',
    targetMetrics: ['light_events', 'sleepEfficiency'],
    matchRules: [{ metric: 'light_events', condition: 'gt', value: 1 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'humidifier',
    name: 'Humidifier',
    category: 'environmental',
    description:
      'Dry air irritates nasal passages and throat, increasing congestion and snoring. Optimal humidity is 40-60%.',
    howTo:
      'Run a cool-mist humidifier in the bedroom. Clean it weekly to prevent mold growth. Target 40-50% humidity.',
    evidenceLevel: 'moderate',
    source: 'Environmental Health Perspectives, 2013',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'snoring_nights_per_week', condition: 'gte', value: 3 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'air-purifier',
    name: 'Air Purifier',
    category: 'environmental',
    description:
      'Allergens (dust mites, pet dander, pollen) cause nasal congestion that worsens breathing during sleep.',
    howTo:
      'Use a HEPA air purifier in the bedroom. Keep pets out of the bedroom during sleep hours.',
    evidenceLevel: 'moderate',
    source: 'Annals of Allergy, Asthma & Immunology, 2018',
    targetMetrics: ['bdi'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 10 }],
    experimentDuration: 14,
    disclaimer: null,
  },

  // ── Behavioral ─────────────────────────────────────────
  {
    id: 'consistent-bedtime',
    name: 'Consistent Bedtime',
    category: 'behavioral',
    description:
      'Going to bed and waking at the same time every day (including weekends) strengthens your circadian rhythm.',
    howTo:
      'Set a fixed bedtime and wake time. Use alarms for both. Avoid sleeping in more than 30 minutes on weekends.',
    evidenceLevel: 'strong',
    source: 'Sleep Health, 2017',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 80 }],
    experimentDuration: 14,
    disclaimer: null,
  },
  {
    id: 'no-screens',
    name: 'No Screens 1hr Before Bed',
    category: 'behavioral',
    description:
      'Blue light from screens suppresses melatonin and delays sleep onset. The cognitive stimulation also keeps the mind active.',
    howTo:
      'Set a "screens off" alarm 1 hour before bedtime. Switch to reading, gentle stretching, or listening to audio content.',
    evidenceLevel: 'strong',
    source: 'Proceedings of the National Academy of Sciences, 2014',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 85 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'wind-down-routine',
    name: 'Wind-Down Routine',
    category: 'behavioral',
    description:
      'A consistent pre-sleep routine signals to your body that sleep is approaching. This conditions faster sleep onset over time.',
    howTo:
      'Create a 30-minute routine: dim lights, play a sleep story or soundscape, practice breathing exercises, then lights out.',
    evidenceLevel: 'moderate',
    source: 'Sleep Medicine, 2018',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 80 }],
    experimentDuration: 14,
    disclaimer: null,
  },
  {
    id: 'no-alcohol',
    name: 'Avoid Alcohol 3hrs Before Bed',
    category: 'behavioral',
    description:
      'Alcohol relaxes throat muscles (increasing snoring/apnea), fragments sleep in the second half of the night, and suppresses REM.',
    howTo:
      'Stop drinking alcohol at least 3 hours before bedtime. Switch to herbal tea in the evening.',
    evidenceLevel: 'strong',
    source: 'Alcoholism: Clinical and Experimental Research, 2013',
    targetMetrics: ['bdi', 'sleepEfficiency'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 5 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'no-caffeine',
    name: 'Avoid Caffeine After 2pm',
    category: 'behavioral',
    description:
      'Caffeine has a half-life of 5-6 hours. Afternoon caffeine can still be active at bedtime, delaying sleep onset.',
    howTo:
      'Switch to decaf or herbal tea after 2pm. Be aware of hidden caffeine in chocolate, some medications, and energy drinks.',
    evidenceLevel: 'strong',
    source: 'Journal of Clinical Sleep Medicine, 2013',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 80 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'nasal-breathing-practice',
    name: 'Nasal Breathing Practice',
    category: 'behavioral',
    description:
      'Training yourself to breathe through your nose during the day helps maintain nasal breathing during sleep, reducing snoring.',
    howTo:
      'Practice conscious nasal breathing for 10 minutes daily. Close your mouth and breathe slowly through your nose. Use nasal strips at night if needed.',
    evidenceLevel: 'moderate',
    source: 'International Journal of Exercise Science, 2018',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 5 }],
    experimentDuration: 14,
    disclaimer: null,
  },

  // ── Device ─────────────────────────────────────────────
  {
    id: 'nasal-strips',
    name: 'Nasal Strips / Dilators',
    category: 'device',
    description:
      'External nasal strips or internal dilators physically open the nasal passages, reducing airflow resistance and snoring.',
    howTo:
      'Apply a nasal strip across the bridge of your nose before bed, or insert a nasal dilator into each nostril.',
    evidenceLevel: 'moderate',
    source: 'American Journal of Rhinology & Allergy, 2019',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'snoring_nights_per_week', condition: 'gte', value: 3 }],
    experimentDuration: 7,
    disclaimer: null,
  },
  {
    id: 'mouth-tape',
    name: 'Mouth Tape',
    category: 'device',
    description:
      'Gentle mouth tape encourages nasal breathing during sleep. Some users report less snoring and better sleep quality.',
    howTo:
      'Use specialized sleep tape (not regular tape). Apply a small strip vertically over closed lips. Start with short naps to build comfort.',
    evidenceLevel: 'emerging',
    source: 'Journal of Clinical Sleep Medicine, 2022',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 5 }],
    experimentDuration: 7,
    disclaimer:
      'Do not use if you have nasal congestion, a deviated septum, or any condition that makes nasal breathing difficult. Consult a doctor before trying.',
  },
  {
    id: 'chin-strap',
    name: 'Chin Strap',
    category: 'device',
    description:
      'A chin strap holds the jaw in a forward position, keeping the airway open and reducing snoring from mouth breathing.',
    howTo:
      'Wear a comfortable chin strap that holds your mouth gently closed. Ensure it does not restrict jaw movement too tightly.',
    evidenceLevel: 'emerging',
    source: 'Sleep and Breathing, 2014',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 15 }],
    experimentDuration: 7,
    disclaimer: null,
  },

  // ── Dietary ────────────────────────────────────────────
  {
    id: 'anti-inflammatory-diet',
    name: 'Anti-Inflammatory Diet',
    category: 'dietary',
    description:
      'Chronic inflammation narrows airways and worsens sleep apnea. An anti-inflammatory diet can reduce tissue swelling.',
    howTo:
      'Emphasize fruits, vegetables, fish, nuts, and olive oil. Reduce processed foods, sugar, and refined carbohydrates.',
    evidenceLevel: 'moderate',
    source: 'Nutrients, 2020',
    targetMetrics: ['bdi'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 15 }],
    experimentDuration: 21,
    disclaimer: null,
  },
  {
    id: 'no-heavy-meals',
    name: 'Avoid Heavy Meals 3hrs Before Bed',
    category: 'dietary',
    description:
      'Large meals before bed increase gastric reflux and discomfort, disrupting sleep quality and increasing arousals.',
    howTo:
      'Eat your last large meal at least 3 hours before bedtime. A light snack (banana, small handful of nuts) is OK.',
    evidenceLevel: 'moderate',
    source: 'British Journal of Nutrition, 2015',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 80 }],
    experimentDuration: 7,
    disclaimer: null,
  },

  // ── Exercise ───────────────────────────────────────────
  {
    id: 'regular-cardio',
    name: 'Regular Cardio Exercise',
    category: 'exercise',
    description:
      'Moderate aerobic exercise (150 min/week) improves sleep quality, reduces time to fall asleep, and increases slow-wave sleep.',
    howTo:
      'Walk, jog, swim, or cycle for 30 minutes, 5 days a week. Finish exercise at least 2 hours before bedtime.',
    evidenceLevel: 'strong',
    source: 'Journal of Clinical Sleep Medicine, 2015',
    targetMetrics: ['sleepEfficiency'],
    matchRules: [{ metric: 'sleepEfficiency', condition: 'lt', value: 85 }],
    experimentDuration: 14,
    disclaimer: null,
  },
  {
    id: 'throat-tongue-exercises',
    name: 'Throat & Tongue Exercises',
    category: 'exercise',
    description:
      'Myofunctional therapy strengthens oropharyngeal muscles, reducing airway collapse and snoring by up to 36%.',
    howTo:
      'Practice daily: push tongue tip firmly against roof of mouth and slide backward (20x). Suck tongue up against palate (20x). Force the back of tongue down while keeping tip touching lower front teeth (20x).',
    evidenceLevel: 'moderate',
    source: 'American Journal of Respiratory and Critical Care Medicine, 2015',
    targetMetrics: ['bdi', 'snoring'],
    matchRules: [{ metric: 'bdi', condition: 'gt', value: 10 }],
    experimentDuration: 21,
    disclaimer: null,
  },
];

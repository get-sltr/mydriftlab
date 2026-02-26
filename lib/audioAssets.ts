/**
 * Audio asset map — maps content IDs to bundled audio files.
 * Expo requires static require() paths (no dynamic strings).
 */
export const audioAssets: Record<string, any> = {
  // ── Original 4 tracks ───────────────────────────────────────
  'story-010': require('../assets/audio/01-keeper-of-tides.mp3'),
  'med-010': require('../assets/audio/02-letting-the-day-go.mp3'),
  'breath-010': require('../assets/audio/03-breathing-478.mp3'),
  'story-011': require('../assets/audio/04-bookshop-end-of-lane.mp3'),

  // ── Stories (20) ────────────────────────────────────────────
  'story-101': require('../assets/audio/story-01-rain-house.mp3'),
  'story-102': require('../assets/audio/story-02-fishing-village.mp3'),
  'story-103': require('../assets/audio/story-03-cabin.mp3'),
  'story-104': require('../assets/audio/story-04-garden-dusk.mp3'),
  'story-105': require('../assets/audio/story-05-train-ride.mp3'),
  'story-106': require('../assets/audio/story-06-bakery.mp3'),
  'story-107': require('../assets/audio/story-07-beach.mp3'),
  'story-108': require('../assets/audio/story-08-library.mp3'),
  'story-109': require('../assets/audio/story-09-pottery.mp3'),
  'story-110': require('../assets/audio/story-10-porch-swing.mp3'),
  'story-111': require('../assets/audio/story-11-laundromat.mp3'),
  'story-112': require('../assets/audio/story-12-greenhouse.mp3'),
  'story-113': require('../assets/audio/story-13-record-shop.mp3'),
  'story-114': require('../assets/audio/story-14-boat-lake.mp3'),
  'story-115': require('../assets/audio/story-15-window-seat.mp3'),
  'story-116': require('../assets/audio/story-16-night-kitchen.mp3'),
  'story-117': require('../assets/audio/story-17-country-road.mp3'),
  'story-118': require('../assets/audio/story-18-aquarium.mp3'),
  'story-119': require('../assets/audio/story-19-wool-shop.mp3'),
  'story-120': require('../assets/audio/story-20-bookshop.mp3'),

  // ── Meditations (6) ─────────────────────────────────────────
  'med-101': require('../assets/audio/med-01-letting-day-go.mp3'),
  'med-102': require('../assets/audio/med-02-quiet-room.mp3'),
  'med-103': require('../assets/audio/med-03-clouds-passing.mp3'),
  'med-104': require('../assets/audio/med-04-staircase.mp3'),
  'med-105': require('../assets/audio/med-05-river-within.mp3'),
  'med-106': require('../assets/audio/med-06-arriving-rest.mp3'),

  // ── Breathing (4) ───────────────────────────────────────────
  'breath-101': require('../assets/audio/breath-01-478.mp3'),
  'breath-102': require('../assets/audio/breath-02-box.mp3'),
  'breath-103': require('../assets/audio/breath-03-two-to-one.mp3'),
  'breath-104': require('../assets/audio/breath-04-ocean.mp3'),
};

/**
 * Phase 3: On-device ML classifier using TensorFlow Lite
 * Classifies noise types: traffic, dog, siren, HVAC, snoring, coughing, sleep talk
 * Placeholder for Phase 3
 */

export type NoiseClass =
  | 'traffic'
  | 'dog'
  | 'siren'
  | 'hvac'
  | 'snoring'
  | 'coughing'
  | 'sleep_talk'
  | 'unknown';

export interface ClassificationResult {
  noiseClass: NoiseClass;
  confidence: number;
}

// Phase 3 implementation
export async function classifyAudio(
  _audioData: Float32Array,
): Promise<ClassificationResult> {
  return { noiseClass: 'unknown', confidence: 0 };
}

/**
 * DSP utilities — shared signal processing primitives.
 *
 * Extracted from breathingMonitor.ts and extended for sonar analysis.
 * All functions are pure (no side effects) and operate on number arrays.
 */

/** Remove DC offset: subtract the mean so signal is centered at 0. */
export function zeroMeanNormalize(buffer: number[]): number[] {
  if (buffer.length === 0) return [];
  const mean = buffer.reduce((a, b) => a + b, 0) / buffer.length;
  return buffer.map((v) => v - mean);
}

/** Smooth signal with a centered moving average window. */
export function movingAverage(data: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2);
  const out: number[] = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(data.length - 1, i + half);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += data[j];
    out[i] = sum / (hi - lo + 1);
  }
  return out;
}

/**
 * Autocorrelation — find the dominant periodic cycle in the signal.
 *
 * Returns the best lag (in samples) and a normalized strength (0–1).
 * `minLag` and `maxLag` define the search range in sample indices.
 */
export function autocorrelate(
  samples: number[],
  minLag: number,
  maxLag: number,
): { bestLag: number; strength: number } {
  const n = samples.length;

  let energy = 0;
  for (let i = 0; i < n; i++) energy += samples[i] * samples[i];
  if (energy === 0) return { bestLag: 0, strength: 0 };

  let bestLag = 0;
  let bestCorr = -Infinity;

  for (let lag = minLag; lag <= maxLag && lag < n; lag++) {
    let corr = 0;
    for (let i = 0; i < n - lag; i++) {
      corr += samples[i] * samples[i + lag];
    }
    corr /= energy;
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag === 0 || bestCorr < 0.15) {
    return { bestLag: 0, strength: 0 };
  }

  return {
    bestLag,
    strength: Math.max(0, Math.min(1, bestCorr)),
  };
}

/** Convert an autocorrelation lag (in samples) to BPM. */
export function lagToBpm(lag: number, sampleRateHz: number): number {
  if (lag <= 0) return 0;
  return (sampleRateHz * 60) / lag;
}

/**
 * Simple bandpass filter — isolate a frequency band from a signal.
 *
 * Uses a windowed sinc approach (FIR). For real-time sonar work on
 * metering data this is sufficient; we're not doing full PCM DSP.
 *
 * `centerFreqHz` — center of the pass band
 * `bandwidthHz`  — total width of the pass band
 * `sampleRateHz` — sample rate of the input buffer
 */
export function bandpassFilter(
  buffer: number[],
  centerFreqHz: number,
  bandwidthHz: number,
  sampleRateHz: number,
): number[] {
  const n = buffer.length;
  if (n === 0) return [];

  const lowCutoff = (centerFreqHz - bandwidthHz / 2) / sampleRateHz;
  const highCutoff = (centerFreqHz + bandwidthHz / 2) / sampleRateHz;

  // FIR filter kernel length (odd, reasonable size)
  const kernelLen = Math.min(n, 65);
  const half = Math.floor(kernelLen / 2);
  const kernel: number[] = new Array(kernelLen);

  // Windowed sinc bandpass
  for (let i = 0; i < kernelLen; i++) {
    const m = i - half;
    if (m === 0) {
      kernel[i] = 2 * (highCutoff - lowCutoff);
    } else {
      const hp = Math.sin(2 * Math.PI * highCutoff * m) / (Math.PI * m);
      const lp = Math.sin(2 * Math.PI * lowCutoff * m) / (Math.PI * m);
      kernel[i] = hp - lp;
    }
    // Hamming window
    kernel[i] *= 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (kernelLen - 1));
  }

  // Normalize kernel
  let kSum = 0;
  for (let i = 0; i < kernelLen; i++) kSum += Math.abs(kernel[i]);
  if (kSum > 0) {
    for (let i = 0; i < kernelLen; i++) kernel[i] /= kSum;
  }

  // Convolve
  const out: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < kernelLen; j++) {
      const idx = i - half + j;
      if (idx >= 0 && idx < n) {
        sum += buffer[idx] * kernel[j];
      }
    }
    out[i] = sum;
  }

  return out;
}

/**
 * Generate a sine wave buffer.
 *
 * Used by sonar to produce the ultrasonic pilot tone (18.5 kHz).
 * Returns values in the range [-1, 1].
 */
export function generateSineWave(
  freqHz: number,
  durationMs: number,
  sampleRate: number,
): number[] {
  const numSamples = Math.floor((durationMs / 1000) * sampleRate);
  const buffer: number[] = new Array(numSamples);
  const omega = (2 * Math.PI * freqHz) / sampleRate;
  for (let i = 0; i < numSamples; i++) {
    buffer[i] = Math.sin(omega * i);
  }
  return buffer;
}

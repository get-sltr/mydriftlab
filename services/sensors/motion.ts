/**
 * Accelerometer service
 * Detects movement near bed, phone bumps, nightstand vibration.
 * Runs at 1Hz to minimize battery impact.
 *
 * Thresholds:
 *   - 0.15g delta from gravity = any movement
 *   - 0.4g delta from gravity = significant movement
 */

import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import type { EnvironmentEvent } from '../../lib/types';

const GRAVITY = 9.81;
const MOVEMENT_THRESHOLD_G = 0.15;
const SIGNIFICANT_THRESHOLD_G = 0.4;
const COOLDOWN_MS = 60_000; // 60s between motion events

export type MotionCallback = (event: Partial<EnvironmentEvent>) => void;

export class MotionSensor {
  private subscription: Subscription | null = null;
  private lastEventTime = 0;
  private sessionId = '';
  private onEvent: MotionCallback | null = null;

  async start(sessionId: string, onEvent: MotionCallback): Promise<void> {
    this.sessionId = sessionId;
    this.onEvent = onEvent;
    this.lastEventTime = 0;

    const available = await Accelerometer.isAvailableAsync();
    if (!available) return;

    Accelerometer.setUpdateInterval(1000); // 1Hz

    this.subscription = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      this.processReading(data);
    });
  }

  async stop(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.onEvent = null;
  }

  private processReading(data: AccelerometerMeasurement): void {
    // Magnitude of acceleration vector
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    // Delta from gravity (at rest, magnitude ~ 1g)
    const delta = Math.abs(magnitude - 1); // In g units

    if (delta < MOVEMENT_THRESHOLD_G) return;

    const now = Date.now();
    if (now - this.lastEventTime < COOLDOWN_MS) return;

    this.lastEventTime = now;
    const isSignificant = delta >= SIGNIFICANT_THRESHOLD_G;

    this.onEvent?.({
      sessionId: this.sessionId,
      timestamp: new Date(now).toISOString(),
      category: 'partner',
      type: 'movement',
      severity: isSignificant ? 'medium' : 'low',
      durationSeconds: 1,
      confidence: Math.min(0.9, 0.4 + delta * 0.5),
    });
  }
}

/**
 * Barometer / pressure monitoring service
 * Tracks atmospheric pressure changes at 0.1Hz.
 *
 * Temperature comes from the user's thermostat setting (UserPreferences),
 * NOT from the barometer. Phone barometers measure pressure only.
 */

import { Barometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import type { EnvironmentEvent } from '../../lib/types';

// Significant pressure change threshold (hPa)
const PRESSURE_CHANGE_THRESHOLD = 5;
const COOLDOWN_MS = 300_000; // 5 min between pressure events

export type BarometerCallback = (event: Partial<EnvironmentEvent>) => void;

export class BarometerSensor {
  private subscription: Subscription | null = null;
  private sessionId = '';
  private onEvent: BarometerCallback | null = null;
  private baselinePressure: number | null = null;
  private lastEventTime = 0;
  private thermostatF: number | null = null;

  async start(
    sessionId: string,
    onEvent: BarometerCallback,
    thermostatF?: number,
  ): Promise<void> {
    this.sessionId = sessionId;
    this.onEvent = onEvent;
    this.thermostatF = thermostatF ?? null;
    this.baselinePressure = null;
    this.lastEventTime = 0;

    const available = await Barometer.isAvailableAsync();
    if (!available) return;

    Barometer.setUpdateInterval(10_000); // 0.1Hz

    this.subscription = Barometer.addListener(({ pressure }) => {
      this.processReading(pressure);
    });
  }

  async stop(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.onEvent = null;
  }

  getEstimatedTempF(): number | null {
    return this.thermostatF;
  }

  private processReading(pressure: number): void {
    if (this.baselinePressure === null) {
      this.baselinePressure = pressure;
      return;
    }

    const now = Date.now();
    const delta = Math.abs(pressure - this.baselinePressure);

    if (delta >= PRESSURE_CHANGE_THRESHOLD && now - this.lastEventTime >= COOLDOWN_MS) {
      this.lastEventTime = now;
      this.onEvent?.({
        sessionId: this.sessionId,
        timestamp: new Date(now).toISOString(),
        category: 'climate',
        type: 'temp_change',
        severity: 'low',
        durationSeconds: 1,
        temperatureF: this.thermostatF ?? undefined,
        confidence: 0.5,
      });
    }

    // Update baseline slowly
    this.baselinePressure = this.baselinePressure * 0.95 + pressure * 0.05;
  }
}

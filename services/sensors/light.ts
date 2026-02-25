/**
 * Ambient light sensor service
 * Tracks lux changes for light-on/off, streetlight leakage, bathroom trips.
 * Runs at 0.5Hz to minimize battery impact.
 *
 * ANDROID ONLY — iOS has no ambient light sensor API.
 * On iOS this is a safe no-op.
 */

import { LightSensor as ExpoLightSensor } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import { Platform } from 'react-native';
import type { EnvironmentEvent } from '../../lib/types';

const LIGHT_ON_LUX = 50;
const LIGHT_OFF_LUX = 10;
const LIGHT_SPIKE_LUX = 200;
const COOLDOWN_MS = 120_000; // 2 min between light events

export type LightCallback = (event: Partial<EnvironmentEvent>) => void;

export class LightSensor {
  private subscription: Subscription | null = null;
  private sessionId = '';
  private onEvent: LightCallback | null = null;
  private lastLux = 0;
  private wasLightOn = false;
  private lastEventTime = 0;

  async start(sessionId: string, onEvent: LightCallback): Promise<void> {
    // iOS has no light sensor API — safe no-op
    if (Platform.OS === 'ios') return;

    this.sessionId = sessionId;
    this.onEvent = onEvent;
    this.lastEventTime = 0;
    this.wasLightOn = false;

    const available = await ExpoLightSensor.isAvailableAsync();
    if (!available) return;

    ExpoLightSensor.setUpdateInterval(2000); // 0.5Hz

    this.subscription = ExpoLightSensor.addListener(({ illuminance }) => {
      this.processReading(illuminance);
    });
  }

  async stop(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.onEvent = null;
  }

  getCurrentLux(): number {
    return this.lastLux;
  }

  private processReading(lux: number): void {
    this.lastLux = lux;
    const now = Date.now();

    if (now - this.lastEventTime < COOLDOWN_MS) return;

    // Light spike (sudden bright light)
    if (lux >= LIGHT_SPIKE_LUX) {
      this.lastEventTime = now;
      this.onEvent?.({
        sessionId: this.sessionId,
        timestamp: new Date(now).toISOString(),
        category: 'light',
        type: 'light_spike',
        severity: 'medium',
        durationSeconds: 1,
        luxLevel: Math.round(lux),
        confidence: 0.8,
      });
      return;
    }

    // Light turned on
    if (lux >= LIGHT_ON_LUX && !this.wasLightOn) {
      this.wasLightOn = true;
      this.lastEventTime = now;
      this.onEvent?.({
        sessionId: this.sessionId,
        timestamp: new Date(now).toISOString(),
        category: 'light',
        type: 'light_on',
        severity: 'low',
        durationSeconds: 1,
        luxLevel: Math.round(lux),
        confidence: 0.7,
      });
      return;
    }

    // Light turned off
    if (lux < LIGHT_OFF_LUX && this.wasLightOn) {
      this.wasLightOn = false;
      this.lastEventTime = now;
      this.onEvent?.({
        sessionId: this.sessionId,
        timestamp: new Date(now).toISOString(),
        category: 'light',
        type: 'light_off',
        severity: 'low',
        durationSeconds: 1,
        luxLevel: Math.round(lux),
        confidence: 0.7,
      });
    }
  }
}

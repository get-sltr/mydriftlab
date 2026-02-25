/**
 * Sensor coordination manager
 * Unified interface to start/stop all 3 sensors (motion, light, barometer).
 * Translates raw sensor events into EnvironmentEvent partials.
 */

import type { EnvironmentEvent } from '../../lib/types';
import { MotionSensor } from './motion';
import { LightSensor } from './light';
import { BarometerSensor } from './barometer';

export type SensorEventCallback = (event: Partial<EnvironmentEvent>) => void;

export class SensorManager {
  private motion = new MotionSensor();
  private light = new LightSensor();
  private barometer = new BarometerSensor();

  async start(
    sessionId: string,
    onEvent: SensorEventCallback,
    thermostatF?: number,
  ): Promise<void> {
    await Promise.all([
      this.motion.start(sessionId, onEvent),
      this.light.start(sessionId, onEvent),
      this.barometer.start(sessionId, onEvent, thermostatF),
    ]);
  }

  async stop(): Promise<void> {
    await Promise.all([
      this.motion.stop(),
      this.light.stop(),
      this.barometer.stop(),
    ]);
  }

  getEstimatedTempF(): number | null {
    return this.barometer.getEstimatedTempF();
  }

  getCurrentLux(): number {
    return this.light.getCurrentLux();
  }
}

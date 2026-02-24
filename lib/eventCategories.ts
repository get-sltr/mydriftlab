/**
 * Event category definitions for DriftLab
 * Maps event categories to display properties
 */

import { colors } from './colors';

export interface EventCategoryInfo {
  key: string;
  label: string;
  color: string;
  icon: string;
  description: string;
}

export const eventCategories: Record<string, EventCategoryInfo> = {
  noise: {
    key: 'noise',
    label: 'Noise',
    color: colors.noise,
    icon: 'volume-high',
    description: 'Sound disruptions detected by microphone',
  },
  climate: {
    key: 'climate',
    label: 'Climate',
    color: colors.temperature,
    icon: 'thermometer',
    description: 'Temperature and humidity changes',
  },
  light: {
    key: 'light',
    label: 'Light',
    color: colors.light,
    icon: 'sunny',
    description: 'Light level changes in your room',
  },
  partner: {
    key: 'partner',
    label: 'Partner',
    color: colors.partner,
    icon: 'people',
    description: 'Movement and sounds from partner',
  },
  snoring: {
    key: 'snoring',
    label: 'Snoring',
    color: colors.snoring,
    icon: 'moon',
    description: 'Snoring patterns detected',
  },
};

/** Event type labels for display */
export const eventTypeLabels: Record<string, string> = {
  loud_event: 'Loud Event',
  sustained_noise: 'Sustained Noise',
  snoring: 'Snoring Detected',
  temp_change: 'Temperature Change',
  temp_high: 'High Temperature',
  temp_low: 'Low Temperature',
  light_spike: 'Light Spike',
  light_on: 'Light Turned On',
  light_off: 'Light Turned Off',
  movement: 'Movement Detected',
  partner_movement: 'Partner Movement',
  partner_snoring: 'Partner Snoring',
};

/** Group events by category for the report view */
export function groupEventsByCategory(
  events: Array<{ category: string }>
): Record<string, typeof events> {
  return events.reduce(
    (groups, event) => {
      const key = event.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
      return groups;
    },
    {} as Record<string, typeof events>
  );
}

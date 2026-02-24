/**
 * Environment events API service
 */

import { EnvironmentEvent } from '../../lib/types';
import { apiRequest } from './client';

export async function createEvent(
  token: string,
  event: Partial<EnvironmentEvent>,
): Promise<EnvironmentEvent> {
  return apiRequest<EnvironmentEvent>('/events', {
    method: 'POST',
    body: event,
    token,
  });
}

export async function getSessionEvents(
  token: string,
  sessionId: string,
): Promise<EnvironmentEvent[]> {
  return apiRequest<EnvironmentEvent[]>(`/events?sessionId=${sessionId}`, {
    token,
  });
}

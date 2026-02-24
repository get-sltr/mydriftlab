/**
 * Sleep session API service
 */

import { SleepSession } from '../../lib/types';
import { apiRequest } from './client';

export async function createSession(
  token: string,
  data: Partial<SleepSession>,
): Promise<SleepSession> {
  return apiRequest<SleepSession>('/sessions', {
    method: 'POST',
    body: data,
    token,
  });
}

export async function updateSession(
  token: string,
  sessionId: string,
  data: Partial<SleepSession>,
): Promise<SleepSession> {
  return apiRequest<SleepSession>(`/sessions/${sessionId}`, {
    method: 'PUT',
    body: data,
    token,
  });
}

export async function getSessions(
  token: string,
  limit = 14,
): Promise<SleepSession[]> {
  return apiRequest<SleepSession[]>(`/sessions?limit=${limit}`, { token });
}

export async function getSession(
  token: string,
  sessionId: string,
): Promise<SleepSession> {
  return apiRequest<SleepSession>(`/sessions/${sessionId}`, { token });
}

/**
 * Experiments API service
 */

import { Experiment } from '../../lib/types';
import { apiRequest } from './client';

export async function getExperiments(
  token: string,
): Promise<Experiment[]> {
  return apiRequest<Experiment[]>('/experiments', { token });
}

export async function createExperiment(
  token: string,
  data: Partial<Experiment>,
): Promise<Experiment> {
  return apiRequest<Experiment>('/experiments', {
    method: 'POST',
    body: data,
    token,
  });
}

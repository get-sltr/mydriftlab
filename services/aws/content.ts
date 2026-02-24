/**
 * Content items API service
 */

import { ContentItem } from '../../lib/types';
import { apiRequest } from './client';

export async function getContent(
  token: string,
  type?: string,
): Promise<ContentItem[]> {
  const query = type ? `?type=${type}` : '';
  return apiRequest<ContentItem[]>(`/content${query}`, { token });
}

/**
 * Insight and recommendation generation
 * Produces actionable insights from night data
 */

import { EnvironmentEvent, Insight } from '../../lib/types';

export function generateInsights(
  events: EnvironmentEvent[],
  restScore: number,
): Insight[] {
  const insights: Insight[] = [];

  // Simple Phase 1 insight: identify top disruptor
  if (events.length > 0) {
    const noisyEvents = events.filter((e) => e.category === 'noise');
    if (noisyEvents.length > 0) {
      insights.push({
        id: `insight-${Date.now()}`,
        sessionId: '',
        type: 'recommendation',
        title: 'Noise was your top disruptor',
        body: `${noisyEvents.length} noise event${noisyEvents.length === 1 ? '' : 's'} were detected tonight. Consider using a white noise machine or earplugs to mask ambient sounds.`,
        confidence: 0.7,
        relatedEventIds: noisyEvents.map((e) => e.id),
      });
    }
  }

  // Encouragement
  if (restScore >= 80) {
    insights.push({
      id: `insight-enc-${Date.now()}`,
      sessionId: '',
      type: 'encouragement',
      title: 'Great night!',
      body: 'Your sleep environment was well-optimized. Keep it up.',
      confidence: 1.0,
      relatedEventIds: [],
    });
  }

  return insights;
}

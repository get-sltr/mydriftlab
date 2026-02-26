/**
 * Free tier content access rules.
 *
 * Free users get one item per category — enough to experience the app,
 * not enough to skip Pro. Everything else is locked.
 */

/** Content IDs available to free-tier users */
export const FREE_CONTENT_IDS = new Set([
  'story-101', // The Rain House
  'sound-001', // Gentle Rain
  'med-106',   // Arriving at Rest
]);

/** Check whether a content ID is available on the free tier */
export function isFreeContent(contentId: string): boolean {
  return FREE_CONTENT_IDS.has(contentId);
}

/** Check whether a user can access a given content item */
export function canAccess(contentId: string, tier: 'free' | 'pro'): boolean {
  if (tier === 'pro') return true;
  return isFreeContent(contentId);
}

/** Features gated behind Pro */
export const PRO_FEATURES = {
  morningReport: true,
  trends: true,
  labs: true,
} as const;

/** Check whether a user can access a Pro feature */
export function canAccessFeature(
  feature: keyof typeof PRO_FEATURES,
  tier: 'free' | 'pro',
): boolean {
  return tier === 'pro';
}

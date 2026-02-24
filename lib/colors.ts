/**
 * DriftLab Color Palette
 * Brand identity: deep night sky with lavender + dusty rose accents
 */

export const colors = {
  // Backgrounds
  deep: '#0B0E14',
  navy: '#121827',
  surface: '#1A2035',

  // Brand
  lavender: '#B8A0D2',
  lavenderLight: '#CDB8E6',
  dustyRose: '#D4858A',
  roseLight: '#E09DA2',

  // Text
  cream: '#F0EBE0',
  creamMuted: 'rgba(240,235,224,0.6)',
  creamDim: 'rgba(240,235,224,0.3)',

  // Semantic (event category colors)
  noise: '#D4604A',
  temperature: '#D4BA6A',
  light: '#7B8FD4',
  humidity: '#6B9FD4',
  partner: '#6BADA0',
  snoring: '#C47ED4',
  success: '#6BADA0',

  // Rest Score ranges
  scoreGreat: '#B8A0D2',    // 80-100, lavender
  scoreDecent: '#F0EBE0',   // 60-79, cream
  scoreRough: '#D4858A',    // 40-59, rose
  scoreBad: '#D4604A',      // 0-39, noise red

  // UI
  glassBorder: 'rgba(184,160,210,0.2)',
  glassBackground: 'rgba(26,32,53,0.6)',
  gradientStart: '#B8A0D2',
  gradientEnd: '#D4858A',
} as const;

export type ColorKey = keyof typeof colors;

/** Get Rest Score color based on score value */
export function getScoreColor(score: number): string {
  if (score >= 80) return colors.scoreGreat;
  if (score >= 60) return colors.scoreDecent;
  if (score >= 40) return colors.scoreRough;
  return colors.scoreBad;
}

/** Get Rest Score label based on score value */
export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Great night';
  if (score >= 60) return 'Decent';
  if (score >= 40) return 'Rough';
  return 'Bad night';
}

/** Get event category color */
export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    noise: colors.noise,
    climate: colors.temperature,
    temperature: colors.temperature,
    light: colors.light,
    humidity: colors.humidity,
    partner: colors.partner,
    snoring: colors.snoring,
  };
  return map[category] ?? colors.creamMuted;
}

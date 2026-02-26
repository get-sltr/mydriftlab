/**
 * MyDriftLAB Typography System
 * Headlines: Cormorant Garamond
 * Body: Outfit
 * Data/Mono: IBM Plex Mono
 * Wordmark: Libre Baskerville
 */

export const fonts = {
  headline: {
    light: 'CormorantGaramond_300Light',
    regular: 'CormorantGaramond_400Regular',
    medium: 'CormorantGaramond_500Medium',
    semiBold: 'CormorantGaramond_600SemiBold',
    bold: 'CormorantGaramond_700Bold',
  },
  body: {
    light: 'Outfit_300Light',
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
    extraBold: 'Outfit_800ExtraBold',
  },
  mono: {
    light: 'IBMPlexMono_300Light',
    regular: 'IBMPlexMono_400Regular',
    medium: 'IBMPlexMono_500Medium',
  },
  wordmark: {
    regular: 'LibreBaskerville_400Regular',
    bold: 'LibreBaskerville_700Bold',
    italic: 'LibreBaskerville_400Regular_Italic',
  },
} as const;

/** Common text style presets */
export const textStyles = {
  h1: {
    fontFamily: fonts.headline.light,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: fonts.headline.regular,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fonts.headline.medium,
    fontSize: 20,
    lineHeight: 28,
  },
  body: {
    fontFamily: fonts.body.light,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: fonts.body.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  data: {
    fontFamily: fonts.mono.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  dataLarge: {
    fontFamily: fonts.mono.medium,
    fontSize: 28,
    lineHeight: 34,
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

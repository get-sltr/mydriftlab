import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Filter, FeTurbulence, Rect } from 'react-native-svg';

/**
 * Film grain overlay using SVG noise
 * Fixed at 0.02 opacity per spec — subtle atmospheric texture
 */
export default function FilmGrain() {
  return (
    <View style={styles.container} pointerEvents="none" accessible={false} importantForAccessibility="no">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Filter id="grain">
            <FeTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </Filter>
        </Defs>
        <Rect
          width="100%"
          height="100%"
          filter="url(#grain)"
          opacity={0.02}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

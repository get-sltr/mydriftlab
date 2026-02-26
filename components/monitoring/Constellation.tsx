/**
 * Constellation — a few static dim dots connected by faint lines,
 * one dot gently pulses every few seconds.
 */

import { useEffect, useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
}

// Fixed constellation with gentle randomization per session
function generateStars(): Star[] {
  const cx = W / 2;
  const cy = H / 2;
  const spread = Math.min(W, H) * 0.3;
  return [
    { x: cx - spread * 0.4, y: cy - spread * 0.3 },
    { x: cx + spread * 0.2, y: cy - spread * 0.5 },
    { x: cx + spread * 0.5, y: cy - spread * 0.1 },
    { x: cx + spread * 0.1, y: cy + spread * 0.3 },
    { x: cx - spread * 0.3, y: cy + spread * 0.4 },
    { x: cx - spread * 0.5, y: cy + spread * 0.1 },
  ];
}

// Which stars to connect
const CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4],
];

export default function Constellation() {
  const stars = useMemo(generateStars, []);
  const pulseOpacity = useSharedValue(0.08);

  useEffect(() => {
    pulseOpacity.value = withRepeat(
      withDelay(
        2000,
        withSequence(
          withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
      ),
      -1,
      false,
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <>
      <Svg
        width={W}
        height={H}
        style={{ position: 'absolute', top: 0, left: 0 }}
        pointerEvents="none"
      >
        {/* Lines */}
        {CONNECTIONS.map(([a, b], i) => (
          <Line
            key={`l${i}`}
            x1={stars[a].x}
            y1={stars[a].y}
            x2={stars[b].x}
            y2={stars[b].y}
            stroke="rgba(240,235,224,0.04)"
            strokeWidth={1}
          />
        ))}
        {/* Static dots */}
        {stars.map((star, i) => (
          <Circle
            key={`s${i}`}
            cx={star.x}
            cy={star.y}
            r={i === 2 ? 0 : 2} // skip the pulsing star here
            fill="rgba(240,235,224,0.1)"
          />
        ))}
      </Svg>
      {/* Pulsing star (index 2) as Animated.View for reanimated */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: stars[2].x - 3,
            top: stars[2].y - 3,
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#F0EBE0',
          },
          pulseStyle,
        ]}
      />
    </>
  );
}

import { VisualEnvironment } from '../../lib/types';
import RainEnvironment from './RainEnvironment';
import OceanEnvironment from './OceanEnvironment';
import ForestEnvironment from './ForestEnvironment';
import CityNightEnvironment from './CityNightEnvironment';
import WhiteNoiseEnvironment from './WhiteNoiseEnvironment';
import SleepStoryEnvironment from './SleepStoryEnvironment';
import FloatingParticles from '../ui/FloatingParticles';

interface EnvironmentRendererProps {
  environment: VisualEnvironment;
}

/**
 * Maps a visual environment type to its animated component
 */
export default function EnvironmentRenderer({
  environment,
}: EnvironmentRendererProps) {
  switch (environment) {
    case 'rain':
      return <RainEnvironment />;
    case 'ocean':
      return <OceanEnvironment />;
    case 'forest':
      return <ForestEnvironment />;
    case 'city_night':
      return <CityNightEnvironment />;
    case 'white_noise':
      return <WhiteNoiseEnvironment />;
    case 'sleep_story':
      return <SleepStoryEnvironment />;
    case 'default':
    default:
      return <FloatingParticles count={20} colorScheme="default" />;
  }
}

/** Map content category string to VisualEnvironment type */
export function categoryToEnvironment(category: string): VisualEnvironment {
  const map: Record<string, VisualEnvironment> = {
    rain: 'rain',
    ocean: 'ocean',
    forest: 'forest',
    city_night: 'city_night',
    white_noise: 'white_noise',
    travel: 'sleep_story',
    nature: 'sleep_story',
    meditation: 'default',
    breathing: 'default',
  };
  return map[category] ?? 'default';
}

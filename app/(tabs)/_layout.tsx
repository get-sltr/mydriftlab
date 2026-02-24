import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

function DriftIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c.83 0 1.64-.11 2.41-.32a7 7 0 01-2.41-5.18c0-3.87 3.13-7 7-7 .34 0 .67.03 1 .08A8.96 8.96 0 0012 3z"
        fill={color}
        opacity={0.8}
      />
      <Circle cx="18" cy="6" r="1.5" fill={color} opacity={0.5} />
      <Circle cx="15" cy="4" r="0.8" fill={color} opacity={0.3} />
    </Svg>
  );
}

function RecordIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.5} opacity={0.6} />
      <Circle cx="12" cy="12" r="4" fill={color} opacity={0.8} />
    </Svg>
  );
}

function ReportIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </Svg>
  );
}

function TrendsIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 20h18M5 17V10M9 17V6M13 17V10M17 17V4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.8}
      />
    </Svg>
  );
}

function LabsIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 3h6M10 3v6l-5 8.5c-.5.8.1 1.8 1.1 1.8h11.8c1 0 1.6-1 1.1-1.8L14 9V3"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
      <Circle cx="10" cy="15" r="1" fill={color} opacity={0.5} />
      <Circle cx="14" cy="13" r="0.8" fill={color} opacity={0.4} />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.lavender,
        tabBarInactiveTintColor: colors.creamDim,
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="drift"
        options={{
          title: 'Drift',
          tabBarIcon: ({ color }) => <DriftIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color }) => <RecordIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <ReportIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color }) => <TrendsIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="labs"
        options={{
          title: 'Labs',
          tabBarIcon: ({ color }) => <LabsIcon color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.navy,
    borderTopColor: 'rgba(184,160,210,0.1)',
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 28,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

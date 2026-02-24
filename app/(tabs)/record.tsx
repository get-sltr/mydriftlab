import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function RecordScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Breathing orb placeholder */}
        <View style={styles.orb}>
          <Text style={styles.dbText}>32</Text>
          <Text style={styles.dbLabel}>dB</Text>
        </View>

        <Text style={styles.ambientMessage}>Everything is quiet</Text>

        {/* Bottom stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0:00</Text>
            <Text style={styles.statLabel}>Elapsed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>68°F</Text>
            <Text style={styles.statLabel}>Temp</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Recording indicator */}
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>Monitoring</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orb: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(184,160,210,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dbText: {
    fontFamily: fonts.headline.light,
    fontSize: 42,
    color: colors.cream,
  },
  dbLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamMuted,
    marginTop: -4,
  },
  ambientMessage: {
    fontFamily: fonts.body.light,
    fontSize: 14,
    color: colors.creamMuted,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
    position: 'absolute',
    bottom: 100,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.mono.regular,
    fontSize: 16,
    color: colors.cream,
  },
  statLabel: {
    fontFamily: fonts.mono.light,
    fontSize: 10,
    color: colors.creamDim,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: 60,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dustyRose,
  },
  recordingText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamMuted,
    letterSpacing: 0.5,
  },
});

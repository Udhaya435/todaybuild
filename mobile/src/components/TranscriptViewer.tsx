import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { WordTimestamp } from '../types';

interface TranscriptViewerProps {
  rawText: string;
  wordTimestamps?: WordTimestamp[];
  currentPlaybackSecond?: number;
  isLive?: boolean;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  rawText,
  wordTimestamps,
  currentPlaybackSecond = 0,
  isLive = false,
}) => {
  const hasTimestamps = wordTimestamps && wordTimestamps.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>TRANSCRIPTION</Text>
        {isLive && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE STREAM</Text>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        {hasTimestamps ? (
          <Text style={styles.paragraph}>
            {wordTimestamps!.map((item, idx) => {
              const isActive =
                currentPlaybackSecond >= item.start && currentPlaybackSecond <= item.end;
              const isPast = currentPlaybackSecond > item.end;

              return (
                <Text
                  key={idx}
                  style={[
                    styles.word,
                    isActive && styles.activeWord,
                    isPast && styles.pastWord,
                  ]}
                >
                  {item.word}{' '}
                </Text>
              );
            })}
          </Text>
        ) : (
          <Text style={styles.plainText}>{rawText}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DarkTheme.danger,
    marginRight: 6,
  },
  liveText: {
    color: DarkTheme.danger,
    fontSize: 10,
    fontWeight: '800',
  },
  textContainer: {
    lineHeight: 24,
  },
  paragraph: {
    lineHeight: 26,
  },
  word: {
    color: DarkTheme.secondaryText,
    fontSize: 15,
  },
  activeWord: {
    color: DarkTheme.primaryBlue,
    fontWeight: '800',
    backgroundColor: 'rgba(22, 139, 255, 0.18)',
    borderRadius: 4,
  },
  pastWord: {
    color: DarkTheme.text,
  },
  plainText: {
    color: DarkTheme.text,
    fontSize: 15,
    lineHeight: 24,
  },
});

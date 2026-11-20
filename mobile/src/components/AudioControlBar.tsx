import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkTheme } from '../theme/colors';

interface AudioControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  speed: number;
  onSpeedChange: (newSpeed: number) => void;
}

export const AudioControlBar: React.FC<AudioControlBarProps> = ({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  onSeek,
  speed,
  onSpeedChange,
}) => {
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const cycleSpeed = () => {
    if (speed === 1.0) onSpeedChange(1.5);
    else if (speed === 1.5) onSpeedChange(2.0);
    else onSpeedChange(1.0);
  };

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return (
    <View style={styles.container}>
      {/* Track progress bar */}
      <View style={styles.trackBackground}>
        <View style={[styles.trackFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>-{formatTime(Math.max(0, duration - currentTime))}</Text>
      </View>

      {/* Buttons row */}
      <View style={styles.controlsRow}>
        {/* Speed toggle */}
        <TouchableOpacity style={styles.speedButton} onPress={cycleSpeed}>
          <Text style={styles.speedText}>{speed}x</Text>
        </TouchableOpacity>

        {/* 15s Rewind */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onSeek(Math.max(0, currentTime - 15))}
        >
          <Text style={styles.skipText}>-15s</Text>
        </TouchableOpacity>

        {/* Main Play/Pause Button */}
        <TouchableOpacity style={styles.playButton} onPress={onPlayPause}>
          <Text style={styles.playIcon}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>

        {/* 15s Forward */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => onSeek(Math.min(duration, currentTime + 15))}
        >
          <Text style={styles.skipText}>+15s</Text>
        </TouchableOpacity>

        {/* Spacer for symmetry */}
        <View style={{ width: 44 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DarkTheme.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  trackBackground: {
    height: 6,
    backgroundColor: DarkTheme.waveformInactive,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trackFill: {
    height: '100%',
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeText: {
    color: DarkTheme.mutedText,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  speedButton: {
    backgroundColor: DarkTheme.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speedText: {
    color: DarkTheme.primaryBlue,
    fontWeight: '700',
    fontSize: 13,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    fontWeight: '600',
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  playIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    marginLeft: 2,
  },
});

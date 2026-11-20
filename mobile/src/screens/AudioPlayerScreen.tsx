import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { AudioControlBar } from '../components/AudioControlBar';

export const AudioPlayerScreen = ({ route, navigation }: any) => {
  const callerName = route.params?.callerName || 'Sarah Jenkins';
  const callerNumber = route.params?.callerNumber || '+1 415-555-0132';
  const duration = route.params?.duration || 42;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1 * speed;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed, duration]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Audio Playback</Text>
        <TouchableOpacity onPress={() => alert('Voicemail link copied')}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Main Player Display */}
      <View style={styles.mainContent}>
        <View style={styles.discContainer}>
          <Text style={styles.discIcon}>🎙️</Text>
        </View>

        <Text style={styles.callerName}>{callerName}</Text>
        <Text style={styles.callerNumber}>{callerNumber}</Text>

        {/* Dynamic Waveform */}
        <View style={styles.waveformWrapper}>
          <WaveformVisualizer isPlaying={isPlaying} height={60} barCount={32} />
        </View>
      </View>

      {/* Control Bar */}
      <View style={styles.controlsWrapper}>
        <AudioControlBar
          isPlaying={isPlaying}
          onPlayPause={() => setIsPlaying(!isPlaying)}
          currentTime={currentTime}
          duration={duration}
          onSeek={(sec) => setCurrentTime(sec)}
          speed={speed}
          onSpeedChange={(s) => setSpeed(s)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeButton: {
    color: DarkTheme.secondaryText,
    fontSize: 15,
  },
  title: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  shareButton: {
    color: DarkTheme.primaryBlue,
    fontSize: 15,
    fontWeight: '700',
  },
  mainContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  discContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DarkTheme.card,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  discIcon: {
    fontSize: 54,
  },
  callerName: {
    color: DarkTheme.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  callerNumber: {
    color: DarkTheme.secondaryText,
    fontSize: 15,
    marginBottom: 30,
  },
  waveformWrapper: {
    width: '100%',
    paddingHorizontal: 16,
  },
  controlsWrapper: {
    paddingBottom: 20,
  },
});

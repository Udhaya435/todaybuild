import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';

const slides = [
  {
    icon: '⚡',
    title: 'Live Voicemail on Android',
    desc: 'See speech transcription in real-time as callers speak. Decide whether to answer or let them leave a message.',
  },
  {
    icon: '🧠',
    title: 'Instant AI Summaries',
    desc: 'Never waste time listening to long messages. Nova AI identifies the caller’s purpose, extracts dates, and suggests smart replies.',
  },
  {
    icon: '🌐',
    title: 'Multilingual & Carrier Forwarding',
    desc: 'Supports Tamil, English, and Tanglish. Seamlessly routes unanswered calls using standard carrier call forwarding codes.',
  },
];

export const OnboardingScreen = ({ navigation }: any) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.navigate('PermissionSetup');
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('PermissionSetup')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.slideIcon}>{slide.icon}</Text>
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideDesc}>{slide.desc}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topBar: {
    alignItems: 'flex-end',
    paddingVertical: 16,
  },
  skipText: {
    color: DarkTheme.secondaryText,
    fontSize: 15,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: DarkTheme.card,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  slideIcon: {
    fontSize: 48,
  },
  slideTitle: {
    color: DarkTheme.text,
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  slideDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 32,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: DarkTheme.primaryBlue,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: DarkTheme.cardElevated,
  },
  button: {
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

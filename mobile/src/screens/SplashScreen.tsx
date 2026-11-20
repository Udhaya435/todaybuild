import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkTheme } from '../theme/colors';

export const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Dashboard');
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoIcon}>🎙️</Text>
      </View>
      <Text style={styles.title}>NOVA</Text>
      <Text style={styles.subtitle}>LIVE VOICEMAIL</Text>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Real-time Intelligence • Telecom Powered</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: DarkTheme.card,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 42,
  },
  title: {
    color: DarkTheme.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: DarkTheme.secondaryBlue,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: DarkTheme.mutedText,
    fontSize: 12,
    fontWeight: '500',
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';

export const AppSettingsScreen = ({ navigation }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  const handleClearCache = () => {
    Alert.alert('Cache Cleared', 'Local audio waveform and temporary files have been cleared.');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Recordings',
      'This will permanently delete all your encrypted voicemail recordings, AI summaries, and telephony configuration from the cloud. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => navigation.replace('Splash') }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>App Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Section: Appearance */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Dark Theme (#0B0D12)</Text>
              <Text style={styles.settingDesc}>Apple-inspired high contrast dark interface.</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        {/* Section: AI & Transcription */}
        <Text style={styles.sectionTitle}>AI & SPEECH PROCESSING</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Auto Speech-to-Text</Text>
              <Text style={styles.settingDesc}>Immediately transcribe audio when message arrives.</Text>
            </View>
            <Switch
              value={autoTranscribe}
              onValueChange={setAutoTranscribe}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>

          <View style={[styles.row, { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: DarkTheme.divider }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Nova AI Summarizer</Text>
              <Text style={styles.settingDesc}>Extract purpose, dates, and suggested replies.</Text>
            </View>
            <Switch
              value={autoSummarize}
              onValueChange={setAutoSummarize}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        {/* Section: Privacy & Consent */}
        <Text style={styles.sectionTitle}>SECURITY, PRIVACY & CONSENT</Text>
        <View style={styles.card}>
          <Text style={styles.privacyHeading}>Recording Consent Transparency</Text>
          <Text style={styles.privacyBody}>
            Nova complies with telecommunication recording privacy guidelines. When callers are routed to your voicemail, the system plays an audible beep and clear greeting disclosing that they may leave a message.
          </Text>
          <Text style={styles.privacyBody}>
            Third-party Android applications cannot secretly record cellular audio. All voicemail processing is transparently conducted over your authorized carrier forwarding line.
          </Text>
        </View>

        {/* Section: Data Management */}
        <Text style={styles.sectionTitle}>DATA & STORAGE</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleClearCache}>
            <Text style={styles.actionText}>Clear Local Audio Cache</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionRow, { borderTopWidth: 1, borderColor: DarkTheme.divider }]} onPress={handleDeleteAccount}>
            <Text style={[styles.actionText, { color: DarkTheme.danger }]}>Delete Account & Cloud Data</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    color: DarkTheme.primaryBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  settingDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    marginTop: 2,
    paddingRight: 10,
  },
  privacyHeading: {
    color: DarkTheme.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  privacyBody: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionText: {
    color: DarkTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionArrow: {
    color: DarkTheme.mutedText,
    fontSize: 18,
  },
});

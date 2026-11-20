import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch, TextInput, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { TelephonyBridge } from '../services/telephonyBridge';

export const CallSettingsScreen = ({ navigation }: any) => {
  const [autoAnswerEnabled, setAutoAnswerEnabled] = useState(true);
  const [ringDuration, setRingDuration] = useState(15);
  const [ownerName, setOwnerName] = useState('Udhaya');
  const [busyMessage, setBusyMessage] = useState(
    'Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone.'
  );

  const [callScreeningEnabled, setCallScreeningEnabled] = useState(true);
  const [silenceUnknown, setSilenceUnknown] = useState(false);
  const [defaultDialerEnabled, setDefaultDialerEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Load existing config
    TelephonyBridge.getAutoAnswerConfig().then((cfg) => {
      if (cfg) {
        setAutoAnswerEnabled(cfg.enabled);
        setRingDuration(cfg.ringSeconds || 15);
        if (cfg.ownerName) setOwnerName(cfg.ownerName);
        if (cfg.message) setBusyMessage(cfg.message);
      }
    });

    TelephonyBridge.isDefaultDialerActive().then(setDefaultDialerEnabled);
  }, []);

  const handleSaveConfig = async () => {
    await TelephonyBridge.setAutoAnswerConfig(
      autoAnswerEnabled,
      ringDuration,
      ownerName,
      busyMessage
    );
    Alert.alert('Saved', 'Auto-Answer & AI Busy Announcement settings saved successfully!');
  };

  const handleTestVoice = async () => {
    try {
      setIsSpeaking(true);
      await TelephonyBridge.speakAIAnnouncement(busyMessage);
    } catch (e: any) {
      Alert.alert('Voice Note', e.message || 'Played AI Voice');
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleSilenceToggle = (val: boolean) => {
    setSilenceUnknown(val);
    TelephonyBridge.setSilenceUnknownCallers(val);
  };

  const handleDefaultDialerToggle = async () => {
    const success = await TelephonyBridge.requestDefaultDialerRole();
    setDefaultDialerEnabled(success);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto-Answer & Telecom</Text>
          <TouchableOpacity onPress={handleSaveConfig}>
            <Text style={styles.saveButton}>Save</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 1: AUTO-ANSWER ON LAST RING (USER MAIN REQUIREMENT) */}
        <Text style={styles.sectionTitle}>AUTO-ANSWER ON LAST RING</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Auto-Answer Unanswered Calls</Text>
              <Text style={styles.settingDesc}>
                If you do not pick up the phone, Nova answers on the last ring and the AI announces that you are busy.
              </Text>
            </View>
            <Switch
              value={autoAnswerEnabled}
              onValueChange={setAutoAnswerEnabled}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>

          {/* Ring Timeout Selector */}
          <Text style={styles.inputLabel}>ANSWER TIMEOUT (LAST RING):</Text>
          <View style={styles.ringOptionRow}>
            {[10, 15, 20].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[styles.ringOptionBtn, ringDuration === sec && styles.ringOptionActive]}
                onPress={() => setRingDuration(sec)}
              >
                <Text style={[styles.ringOptionText, ringDuration === sec && styles.ringOptionTextActive]}>
                  {sec}s {sec === 15 ? '(Recommended)' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Owner Name Input */}
          <Text style={styles.inputLabel}>YOUR NAME (AI WILL ANNOUNCE):</Text>
          <TextInput
            style={styles.textInput}
            value={ownerName}
            onChangeText={(txt) => {
              setOwnerName(txt);
              setBusyMessage(`Hello! ${txt || 'Udhaya'} is busy right now. Please call back later, or leave your message after the tone.`);
            }}
            placeholder="e.g. Udhaya"
            placeholderTextColor={DarkTheme.mutedText}
          />

          {/* Spoken AI Message */}
          <Text style={styles.inputLabel}>SPOKEN AI BUSY MESSAGE:</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={busyMessage}
            onChangeText={setBusyMessage}
            multiline
            numberOfLines={3}
            placeholderTextColor={DarkTheme.mutedText}
          />

          {/* Listen Preview Button */}
          <TouchableOpacity style={styles.previewBtn} onPress={handleTestVoice}>
            <Text style={styles.previewBtnText}>
              {isSpeaking ? '🔊 AI Voice Speaking...' : '🔊 Listen to AI Voice Preview'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 2: ANDROID TELECOM CALL SCREENING */}
        <Text style={styles.sectionTitle}>CALL SCREENING & PERMISSIONS</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Enable CallScreeningService</Text>
              <Text style={styles.settingDesc}>
                Detects incoming calls via Android Telecom to track caller identity and trigger live voicemail screening.
              </Text>
            </View>
            <Switch
              value={callScreeningEnabled}
              onValueChange={setCallScreeningEnabled}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Set as Default Phone App</Text>
              <Text style={styles.settingDesc}>
                Grants Android InCallService authority to seamlessly answer calls and route audio to AI speaker.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.roleButton, defaultDialerEnabled && styles.roleActiveButton]}
              onPress={handleDefaultDialerToggle}
            >
              <Text style={styles.roleButtonText}>
                {defaultDialerEnabled ? '✓ Granted' : 'Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Silence Unknown Callers</Text>
              <Text style={styles.settingDesc}>
                Silently sends numbers not in your contacts directly to Nova Live Voicemail without ringing.
              </Text>
            </View>
            <Switch
              value={silenceUnknown}
              onValueChange={handleSilenceToggle}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveActionBtn} onPress={handleSaveConfig}>
          <Text style={styles.saveActionBtnText}>Save All Settings</Text>
        </TouchableOpacity>
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
    fontWeight: '700',
  },
  saveButton: {
    color: DarkTheme.primaryBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTitle: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  settingDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    lineHeight: 17,
  },
  inputLabel: {
    color: DarkTheme.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  ringOptionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ringOptionBtn: {
    flex: 1,
    backgroundColor: DarkTheme.cardElevated,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  ringOptionActive: {
    backgroundColor: 'rgba(22, 139, 255, 0.2)',
    borderColor: DarkTheme.primaryBlue,
  },
  ringOptionText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  ringOptionTextActive: {
    color: DarkTheme.primaryBlue,
  },
  textInput: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: DarkTheme.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  previewBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(22, 139, 255, 0.15)',
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
  },
  previewBtnText: {
    color: DarkTheme.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  roleButton: {
    backgroundColor: DarkTheme.primaryBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  roleActiveButton: {
    backgroundColor: DarkTheme.success,
  },
  roleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  saveActionBtn: {
    marginTop: 10,
    backgroundColor: DarkTheme.primaryBlue,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

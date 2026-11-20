import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { TelephonyBridge } from '../services/telephonyBridge';
import { ApiService } from '../services/api';

export const ForwardingConfigScreen = ({ navigation }: any) => {
  const [voicemailNumber, setVoicemailNumber] = useState('+1 202-555-0199');
  const [carrier, setCarrier] = useState('airtel'); // airtel, jio, vi, att, verizon, tmobile
  const [ringSeconds, setRingSeconds] = useState(20);
  const [instructions, setInstructions] = useState<any>(null);

  useEffect(() => {
    loadInstructions();
  }, [voicemailNumber, ringSeconds]);

  const loadInstructions = async () => {
    try {
      const data = await ApiService.getForwardingInstructions(voicemailNumber, ringSeconds);
      setInstructions(data);
    } catch (e) {
      // Default instructions
      setInstructions({
        carrierCodes: {
          noAnswer: `*61*${voicemailNumber}**${ringSeconds}#`,
          busy: `*67*${voicemailNumber}#`,
          unreachable: `*62*${voicemailNumber}#`,
          allConditional: `**004*${voicemailNumber}*11*${ringSeconds}#`,
          disableAll: '##002#',
        }
      });
    }
  };

  const handleDialCode = async (type: string) => {
    const res = await TelephonyBridge.activateCarrierForwarding(type, voicemailNumber, ringSeconds);
    Alert.alert(
      'Dialer Launched',
      `Launching phone dialer with MMI code:\n\n${res.mmiCode}\n\nPress Call in your phone app to complete carrier activation.`
    );
  };

  const handleDisableAll = async () => {
    const res = await TelephonyBridge.disableCarrierForwarding();
    Alert.alert(
      'Restore Carrier Voicemail',
      `Launching phone dialer with restore code: ##002#\n\nThis disables Nova forwarding and restores standard carrier voicemail.`
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
          <Text style={styles.headerTitle}>Carrier Call Forwarding</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Technical Explainer */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Android security restricts local microphone recording of cellular audio. Nova captures live voicemails through carrier call forwarding to your secure virtual voicemail number.
          </Text>
        </View>

        {/* Assigned Voicemail Number */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>YOUR ASSIGNED VOICEMAIL NUMBER</Text>
          <TextInput
            style={styles.numberInput}
            value={voicemailNumber}
            onChangeText={setVoicemailNumber}
            keyboardType="phone-pad"
          />
          <Text style={styles.helperText}>
            Calls you decline or don't answer will be forwarded to this destination.
          </Text>
        </View>

        {/* Carrier Quick Activation Cards */}
        <Text style={styles.sectionTitle}>ONE-TAP CARRIER ACTIVATION</Text>

        {/* 1. Forward When Unanswered (*61*) */}
        <View style={styles.mmiCard}>
          <View style={styles.mmiHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mmiTitle}>Forward When Unanswered</Text>
              <Text style={styles.mmiCode}>Code: *61*{voicemailNumber}**{ringSeconds}#</Text>
            </View>
            <TouchableOpacity style={styles.dialBtn} onPress={() => handleDialCode('no_answer')}>
              <Text style={styles.dialBtnText}>Dial 📞</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mmiDesc}>
            If you don't pick up after {ringSeconds} seconds, the caller is sent to Nova Live Voicemail.
          </Text>
        </View>

        {/* 2. Forward When Busy or Declined (*67*) */}
        <View style={styles.mmiCard}>
          <View style={styles.mmiHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mmiTitle}>Forward When Busy / Declined</Text>
              <Text style={styles.mmiCode}>Code: *67*{voicemailNumber}#</Text>
            </View>
            <TouchableOpacity style={styles.dialBtn} onPress={() => handleDialCode('busy')}>
              <Text style={styles.dialBtnText}>Dial 📞</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mmiDesc}>
            When you tap "Decline" on an incoming call, the caller immediately enters Live Voicemail.
          </Text>
        </View>

        {/* 3. Forward When Unreachable (*62*) */}
        <View style={styles.mmiCard}>
          <View style={styles.mmiHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mmiTitle}>Forward When Switched Off</Text>
              <Text style={styles.mmiCode}>Code: *62*{voicemailNumber}#</Text>
            </View>
            <TouchableOpacity style={styles.dialBtn} onPress={() => handleDialCode('unreachable')}>
              <Text style={styles.dialBtnText}>Dial 📞</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mmiDesc}>
            Captures voicemails when your phone has no cellular reception or battery is dead.
          </Text>
        </View>

        {/* Disable Forwarding Instructions */}
        <View style={styles.disableCard}>
          <Text style={styles.disableTitle}>How to Restore Carrier Voicemail</Text>
          <Text style={styles.disableDesc}>
            To turn off Nova forwarding and revert back to your cellular carrier's default voicemail at any time, dial ##002# or tap below.
          </Text>
          <TouchableOpacity style={styles.disableBtn} onPress={handleDisableAll}>
            <Text style={styles.disableBtnText}>Dial ##002# (Disable Forwarding)</Text>
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
    marginBottom: 16,
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 139, 255, 0.1)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(22, 139, 255, 0.3)',
    marginBottom: 18,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoText: {
    color: DarkTheme.secondaryBlue,
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  card: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 20,
  },
  cardLabel: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  numberInput: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 12,
    padding: 14,
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  helperText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  mmiCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 14,
  },
  mmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mmiTitle: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  mmiCode: {
    color: DarkTheme.secondaryBlue,
    fontSize: 13,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  dialBtn: {
    backgroundColor: DarkTheme.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dialBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  mmiDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    lineHeight: 18,
  },
  disableCard: {
    backgroundColor: '#1E1619',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.3)',
    marginTop: 10,
  },
  disableTitle: {
    color: DarkTheme.danger,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  disableDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  disableBtn: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderWidth: 1,
    borderColor: DarkTheme.danger,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  disableBtnText: {
    color: DarkTheme.danger,
    fontSize: 13,
    fontWeight: '700',
  },
});

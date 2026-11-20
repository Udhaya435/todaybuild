import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Switch } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { TelephonyBridge } from '../services/telephonyBridge';

export const PermissionSetupScreen = ({ navigation }: any) => {
  const [callScreeningGranted, setCallScreeningGranted] = useState(false);
  const [contactsGranted, setContactsGranted] = useState(false);
  const [microphoneGranted, setMicrophoneGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(true);

  useEffect(() => {
    checkCurrentRoles();
  }, []);

  const checkCurrentRoles = async () => {
    const screening = await TelephonyBridge.isCallScreeningActive();
    setCallScreeningGranted(screening);
  };

  const handleRequestCallScreening = async () => {
    const success = await TelephonyBridge.requestCallScreeningRole();
    setCallScreeningGranted(success);
  };

  const handleComplete = () => {
    navigation.replace('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.headerTitle}>Permissions & Roles</Text>
        <Text style={styles.headerSubtitle}>
          Nova requires Android Telecom permissions to screen calls and display live transcripts.
        </Text>

        {/* Call Screening Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={styles.permIconBadge}>
              <Text style={styles.permIcon}>🛡️</Text>
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Call Screening Role</Text>
              <Text style={styles.permStatus}>
                {callScreeningGranted ? 'Granted' : 'Action Required'}
              </Text>
            </View>
          </View>
          <Text style={styles.permDesc}>
            Allows Nova to detect incoming calls, identify callers, and manage screening without interrupting your cellular audio security.
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, callScreeningGranted && styles.actionButtonGranted]}
            onPress={handleRequestCallScreening}
            disabled={callScreeningGranted}
          >
            <Text style={styles.actionButtonText}>
              {callScreeningGranted ? '✓ Role Enabled' : 'Enable Call Screening'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contacts Access Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={styles.permIconBadge}>
              <Text style={styles.permIcon}>👥</Text>
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Contacts Access</Text>
              <Text style={styles.permStatus}>{contactsGranted ? 'Granted' : 'Optional'}</Text>
            </View>
            <Switch
              value={contactsGranted}
              onValueChange={setContactsGranted}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
          <Text style={styles.permDesc}>
            Matches unknown numbers to your existing address book to display real names and profile photos.
          </Text>
        </View>

        {/* Microphone Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={styles.permIconBadge}>
              <Text style={styles.permIcon}>🎙️</Text>
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Microphone Access</Text>
              <Text style={styles.permStatus}>{microphoneGranted ? 'Granted' : 'Optional'}</Text>
            </View>
            <Switch
              value={microphoneGranted}
              onValueChange={setMicrophoneGranted}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
          <Text style={styles.permDesc}>
            Needed only when recording your own customized spoken voicemail greetings.
          </Text>
        </View>

        {/* Notifications Card */}
        <View style={styles.permissionCard}>
          <View style={styles.permHeader}>
            <View style={styles.permIconBadge}>
              <Text style={styles.permIcon}>🔔</Text>
            </View>
            <View style={styles.permTextContainer}>
              <Text style={styles.permTitle}>Push Notifications</Text>
              <Text style={styles.permStatus}>Enabled</Text>
            </View>
            <Switch
              value={notificationsGranted}
              onValueChange={setNotificationsGranted}
              trackColor={{ false: DarkTheme.cardElevated, true: DarkTheme.primaryBlue }}
            />
          </View>
          <Text style={styles.permDesc}>
            Instant alert when a live transcription begins or a summary is ready.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
          <Text style={styles.continueButtonText}>Finish Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  scroll: {
    padding: 24,
    paddingBottom: 100,
  },
  headerTitle: {
    color: DarkTheme.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: DarkTheme.secondaryText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  permissionCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  permHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  permIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DarkTheme.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permIcon: {
    fontSize: 20,
  },
  permTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  permTitle: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  permStatus: {
    color: DarkTheme.secondaryBlue,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  permDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  actionButton: {
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonGranted: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    borderWidth: 1,
    borderColor: DarkTheme.success,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DarkTheme.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: DarkTheme.divider,
  },
  continueButton: {
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';

export const ProfileScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AppSettings')}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* User Badge */}
        <View style={styles.profileBadge}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AJ</Text>
          </View>
          <Text style={styles.userName}>Arun Johnson</Text>
          <Text style={styles.userPhone}>+1 (415) 555-0199</Text>
          <View style={styles.planPill}>
            <Text style={styles.planText}>NOVA PRO PLAN</Text>
          </View>
        </View>

        {/* Storage Quota */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>AUDIO STORAGE & QUOTA</Text>
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarFill, { width: '28%' }]} />
          </View>
          <Text style={styles.storageText}>1.4 GB used of 5.0 GB encrypted cloud storage</Text>
        </View>

        {/* Assigned Voicemail Line */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ASSIGNED TELEPHONY LINE</Text>
          <Text style={styles.valueText}>+1 (202) 555-0199</Text>
          <Text style={styles.descText}>
            Dedicated carrier forwarding destination for live transcription.
          </Text>
          <TouchableOpacity
            style={styles.actionLink}
            onPress={() => navigation.navigate('ForwardingConfig')}
          >
            <Text style={styles.actionLinkText}>Manage Carrier MMI Settings ➔</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('GreetingManagement')}
          >
            <Text style={styles.menuIcon}>🎙️</Text>
            <Text style={styles.menuText}>Voicemail Greetings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('CallSettings')}
          >
            <Text style={styles.menuIcon}>🛡️</Text>
            <Text style={styles.menuText}>Call Screening & Telecom</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AppSettings')}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>App Settings & Privacy</Text>
            <Text style={styles.menuArrow}>›</Text>
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
  settingsIcon: {
    fontSize: 20,
  },
  profileBadge: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: DarkTheme.card,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: DarkTheme.primaryBlue,
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: DarkTheme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  userPhone: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    marginTop: 4,
  },
  planPill: {
    backgroundColor: 'rgba(22, 139, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
  },
  planText: {
    color: DarkTheme.primaryBlue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 14,
  },
  cardLabel: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  valueText: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  descText: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    marginTop: 4,
  },
  actionLink: {
    marginTop: 10,
  },
  actionLinkText: {
    color: DarkTheme.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  storageBarBg: {
    height: 8,
    backgroundColor: DarkTheme.waveformInactive,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 10,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 4,
  },
  storageText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
  },
  menuCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginTop: 6,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: DarkTheme.divider,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuText: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  menuArrow: {
    color: DarkTheme.mutedText,
    fontSize: 18,
  },
});

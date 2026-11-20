import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { VoicemailCard } from '../components/VoicemailCard';
import { ApiService } from '../services/api';
import { VoicemailStore } from '../services/voicemailStore';
import { TelephonyBridge } from '../services/telephonyBridge';
import { Voicemail } from '../types';

export const DashboardScreen = ({ navigation }: any) => {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ unread: 2, total: 3, minutesSaved: 14 });
  const [isSpeaking, setIsSpeaking] = useState(false);

  const busyAnnouncementText = "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone.";

  const loadData = async () => {
    try {
      setRefreshing(true);
      const res = await ApiService.getVoicemails({ sort: 'desc' });
      if (res.voicemails && res.voicemails.length > 0) {
        setVoicemails(res.voicemails.slice(0, 3));
        const unreadCount = res.voicemails.filter((v) => !v.isRead).length;
        setStats({
          unread: unreadCount,
          total: res.total,
          minutesSaved: Math.round(res.total * 2.8),
        });
      }
    } catch (e) {
      console.log('[Dashboard] Fetch error, using cached display');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = VoicemailStore.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const handleTestAIVoice = async () => {
    try {
      setIsSpeaking(true);
      Alert.alert(
        'AI Voice Speaking',
        `Nova AI is announcing:\n\n"${busyAnnouncementText}"\n\n(Playing through your device speaker...)`
      );
      await TelephonyBridge.speakAIAnnouncement(busyAnnouncementText);
    } catch (e: any) {
      Alert.alert('TTS Note', e.message || 'Played AI Voice');
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={DarkTheme.primaryBlue} />}
      >
        {/* App Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>NOVA</Text>
            <Text style={styles.screenTitle}>Live Voicemail</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileInitial}>U</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN USER FEATURE: Auto-Answer on Last Ring Card */}
        <View style={styles.mainFeatureCard}>
          <View style={styles.statusHeader}>
            <View style={styles.activeTag}>
              <View style={styles.pulseDot} />
              <Text style={styles.activeTagText}>AUTO-ANSWER ACTIVE (15s LAST RING)</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('CallSettings')}>
              <Text style={styles.setupLink}>Settings ➔</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.mainFeatureTitle}>Udhaya's Busy Call Handler</Text>
          <Text style={styles.mainFeatureDesc}>
            If you don't pick up within 15 seconds (last ring), Nova automatically answers the call and the AI speaks in English:
          </Text>

          {/* AI Announcement Bubble */}
          <View style={styles.quoteBox}>
            <Text style={styles.quoteIcon}>🗣️</Text>
            <Text style={styles.quoteText}>
              "{busyAnnouncementText}"
            </Text>
          </View>

          {/* Dual Action Buttons */}
          <View style={styles.mainActionButtonsRow}>
            {/* 1. Test Voice Out Loud */}
            <TouchableOpacity
              style={styles.voiceTestBtn}
              onPress={handleTestAIVoice}
            >
              <Text style={styles.voiceTestBtnIcon}>🔊</Text>
              <Text style={styles.voiceTestBtnText}>
                {isSpeaking ? 'Speaking...' : 'Hear AI Voice'}
              </Text>
            </TouchableOpacity>

            {/* 2. Test Full Flow Simulation */}
            <TouchableOpacity
              style={styles.fullFlowBtn}
              onPress={() => navigation.navigate('LiveVoicemail', {
                callerName: 'Office / Client Call',
                callerNumber: '+91 98401 23456',
                autoAnswerDemo: true,
              })}
            >
              <Text style={styles.fullFlowBtnIcon}>⚡</Text>
              <Text style={styles.fullFlowBtnText}>Test Full Call Flow</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.unread}</Text>
            <Text style={styles.statLabel}>Unread Voicemails</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Protected</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.minutesSaved}m</Text>
            <Text style={styles.statLabel}>AI Time Saved</Text>
          </View>
        </View>

        {/* Quick Actions Carousel */}
        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionRow}>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('VoicemailInbox')}>
            <Text style={styles.actionIcon}>📬</Text>
            <Text style={styles.actionText}>Voicemail Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('GreetingManagement')}>
            <Text style={styles.actionIcon}>🎙️</Text>
            <Text style={styles.actionText}>Voice Greetings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('CallSettings')}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Auto-Answer Config</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionTile} onPress={() => navigation.navigate('ForwardingConfig')}>
            <Text style={styles.actionIcon}>📲</Text>
            <Text style={styles.actionText}>Carrier MMI Codes</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Recent Voicemails */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.sectionHeader}>SAVED VOICEMAILS & TRANSCRIPTS</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VoicemailInbox')}>
            <Text style={styles.seeAllText}>View All ➔</Text>
          </TouchableOpacity>
        </View>

        {voicemails.map((vm) => (
          <VoicemailCard
            key={vm.id}
            voicemail={vm}
            onPress={() => navigation.navigate('VoicemailDetail', { voicemailId: vm.id })}
          />
        ))}
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
  appName: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  screenTitle: {
    color: DarkTheme.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 2,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DarkTheme.cardElevated,
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: DarkTheme.primaryBlue,
    fontSize: 18,
    fontWeight: '700',
  },
  mainFeatureCard: {
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(22, 139, 255, 0.45)',
    marginBottom: 20,
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: DarkTheme.success,
    marginRight: 6,
  },
  activeTagText: {
    color: DarkTheme.success,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setupLink: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  mainFeatureTitle: {
    color: DarkTheme.text,
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  mainFeatureDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  quoteBox: {
    flexDirection: 'row',
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: DarkTheme.primaryBlue,
    marginBottom: 14,
    alignItems: 'center',
  },
  quoteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  quoteText: {
    flex: 1,
    color: DarkTheme.text,
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  mainActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceTestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22, 139, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
  },
  voiceTestBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  voiceTestBtnText: {
    color: DarkTheme.primaryBlue,
    fontSize: 13,
    fontWeight: '700',
  },
  fullFlowBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DarkTheme.primaryBlue,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fullFlowBtnIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  fullFlowBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    alignItems: 'center',
  },
  statNumber: {
    color: DarkTheme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: DarkTheme.secondaryText,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeader: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  actionRow: {
    marginBottom: 22,
  },
  actionTile: {
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    minWidth: 110,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  actionText: {
    color: DarkTheme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seeAllText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
});

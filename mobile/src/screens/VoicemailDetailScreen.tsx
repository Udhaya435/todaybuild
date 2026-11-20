import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { AudioControlBar } from '../components/AudioControlBar';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { ApiService } from '../services/api';
import { Voicemail } from '../types';

export const VoicemailDetailScreen = ({ route, navigation }: any) => {
  const { voicemailId } = route.params || { voicemailId: 'demo-vm-1' };

  const [voicemail, setVoicemail] = useState<Voicemail | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  useEffect(() => {
    loadVoicemail();
  }, [voicemailId]);

  const loadVoicemail = async () => {
    try {
      const data = await ApiService.getVoicemailById(voicemailId);
      setVoicemail(data);
    } catch (e) {
      // Fallback demo data
      setVoicemail({
        id: voicemailId,
        callerNumber: '+1 415-555-0132',
        callerName: 'Sarah Jenkins',
        durationSeconds: 24,
        status: 'COMPLETED',
        isRead: true,
        createdAt: new Date().toISOString(),
        transcript: {
          id: 'tr-1',
          rawText: 'Hi, this is Sarah. Please call me tomorrow morning regarding the project schedule and milestones. Thank you!',
          language: 'en',
          confidence: 0.98,
          wordTimestamps: [
            { word: "Hi,", start: 0.0, end: 0.4, confidence: 0.98 },
            { word: "this", start: 0.5, end: 0.7, confidence: 0.96 },
            { word: "is", start: 0.8, end: 0.9, confidence: 0.99 },
            { word: "Sarah.", start: 1.0, end: 1.5, confidence: 0.97 },
            { word: "Please", start: 1.8, end: 2.1, confidence: 0.95 },
            { word: "call", start: 2.2, end: 2.4, confidence: 0.98 },
            { word: "me", start: 2.5, end: 2.7, confidence: 0.99 },
            { word: "tomorrow", start: 2.8, end: 3.2, confidence: 0.97 },
            { word: "morning", start: 3.3, end: 3.8, confidence: 0.96 },
            { word: "regarding", start: 4.0, end: 4.5, confidence: 0.95 },
            { word: "the", start: 4.6, end: 4.7, confidence: 0.98 },
            { word: "project", start: 4.8, end: 5.2, confidence: 0.97 },
            { word: "schedule.", start: 5.3, end: 5.9, confidence: 0.96 }
          ]
        },
        summary: {
          id: 'sum-1',
          summaryText: 'Caller wants to discuss the project schedule tomorrow morning.',
          callerPurpose: 'Project schedule review',
          appointmentDates: ['Tomorrow morning'],
          callbackRequested: true,
          callbackNumber: '+1 415-555-0132',
          keyPoints: ['Review project milestones', 'Finalize timelines'],
          suggestedReplies: [
            {
              en: "Thank you for calling. I'll get back to you tomorrow morning.",
              ta: "Ungal azhaippukku nandri. Naan nalaikku kaalaiyil thodarbu kolgiren."
            },
            {
              en: "Got your message about the schedule. Let's sync at 10 AM.",
              ta: "Schedule pathi unga message vandhuchu, nalaikku 10 manikku sync panlaam."
            }
          ],
          sentiment: 'positive'
        }
      });
    }
  };

  // Playback timer ticker
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1 * playbackSpeed;
          if (voicemail && next >= voicemail.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, voicemail]);

  const handleDelete = () => {
    Alert.alert('Delete Voicemail', 'Are you sure you want to delete this voicemail permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await ApiService.deleteVoicemail(voicemailId);
          navigation.goBack();
        }
      }
    ]);
  };

  if (!voicemail) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Caller Header Card */}
        <View style={styles.callerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{voicemail.callerName?.[0] || '?'}</Text>
          </View>
          <Text style={styles.callerName}>{voicemail.callerName || voicemail.callerNumber}</Text>
          <Text style={styles.callerNumber}>{voicemail.callerNumber}</Text>
          <Text style={styles.callDate}>
            {new Date(voicemail.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </Text>

          {/* Call Back Button */}
          <TouchableOpacity
            style={styles.callBackButton}
            onPress={() => alert(`Calling ${voicemail.callerNumber}...`)}
          >
            <Text style={styles.callBackText}>📞 Call Back</Text>
          </TouchableOpacity>
        </View>

        {/* Audio Player Bar */}
        <View style={styles.playerContainer}>
          <AudioControlBar
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={voicemail.durationSeconds}
            onSeek={(sec) => setCurrentTime(sec)}
            speed={playbackSpeed}
            onSpeedChange={(s) => setPlaybackSpeed(s)}
          />
        </View>

        {/* AI Summary Card */}
        {voicemail.summary && (
          <TouchableOpacity
            style={styles.aiSummaryCard}
            onPress={() => navigation.navigate('AISummary', { voicemailId: voicemail.id })}
            activeOpacity={0.8}
          >
            <View style={styles.aiHeader}>
              <Text style={styles.aiSparkle}>✨</Text>
              <Text style={styles.aiTitle}>NOVA AI SUMMARY & PURPOSE</Text>
              <Text style={styles.expandArrow}>➔</Text>
            </View>
            <Text style={styles.aiSummaryText}>{voicemail.summary.summaryText}</Text>
            <View style={styles.purposeRow}>
              <Text style={styles.purposeLabel}>Caller Purpose:</Text>
              <Text style={styles.purposeValue}>{voicemail.summary.callerPurpose}</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Synced Transcript */}
        <TranscriptViewer
          rawText={voicemail.transcript?.rawText || 'No transcription available.'}
          wordTimestamps={voicemail.transcript?.wordTimestamps}
          currentPlaybackSecond={currentTime}
        />

        {/* Smart Suggested Replies in English & Tamil */}
        {voicemail.summary?.suggestedReplies && voicemail.summary.suggestedReplies.length > 0 && (
          <View style={styles.suggestedRepliesCard}>
            <Text style={styles.sectionTitle}>SMART REPLIES (ENGLISH & TAMIL)</Text>
            {voicemail.summary.suggestedReplies.map((reply, idx) => (
              <View key={idx} style={styles.replyBox}>
                <Text style={styles.replyEn}>🇬🇧 "{reply.en}"</Text>
                <Text style={styles.replyTa}>🇮🇳 "{reply.ta}"</Text>
                <TouchableOpacity
                  style={styles.sendReplyButton}
                  onPress={() => alert(`Reply drafted:\n"${reply.en}"`)}
                >
                  <Text style={styles.sendReplyText}>Send SMS Reply ➔</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  topBar: {
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
  deleteButton: {
    color: DarkTheme.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  callerCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: DarkTheme.card,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: DarkTheme.primaryBlue,
    fontSize: 26,
    fontWeight: '800',
  },
  callerName: {
    color: DarkTheme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  callerNumber: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    marginTop: 2,
  },
  callDate: {
    color: DarkTheme.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  callBackButton: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  callBackText: {
    color: DarkTheme.success,
    fontSize: 13,
    fontWeight: '700',
  },
  playerContainer: {
    marginBottom: 16,
  },
  aiSummaryCard: {
    backgroundColor: '#121D2C',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(22, 139, 255, 0.35)',
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSparkle: {
    fontSize: 14,
    marginRight: 6,
  },
  aiTitle: {
    color: DarkTheme.secondaryBlue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    flex: 1,
  },
  expandArrow: {
    color: DarkTheme.secondaryBlue,
    fontSize: 14,
    fontWeight: '800',
  },
  aiSummaryText: {
    color: DarkTheme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  purposeRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  purposeLabel: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  purposeValue: {
    color: DarkTheme.text,
    fontSize: 12,
    fontWeight: '700',
  },
  suggestedRepliesCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  sectionTitle: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  replyBox: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  replyEn: {
    color: DarkTheme.text,
    fontSize: 13,
    marginBottom: 4,
  },
  replyTa: {
    color: DarkTheme.secondaryBlue,
    fontSize: 12,
    marginBottom: 8,
  },
  sendReplyButton: {
    alignSelf: 'flex-end',
  },
  sendReplyText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
});

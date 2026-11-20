import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';

export const AISummaryScreen = ({ route, navigation }: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta'>('en');

  const summaryData = {
    callerName: 'Dr. Michael Chen',
    callerNumber: '+1 (650) 892-4410',
    summaryText: 'Caller wants to confirm your medical appointment tomorrow at 11:00 AM. Requested to call back before 5:00 PM if rescheduling is needed.',
    callerPurpose: 'Medical appointment confirmation and records reminder',
    appointmentDates: ['Tomorrow at 11:00 AM', 'Deadline: Today before 5:00 PM'],
    callbackRequested: true,
    callbackNumber: '+1 (650) 892-4410',
    sentiment: 'neutral',
    keyPoints: [
      'Appointment scheduled for tomorrow at 11:00 AM',
      'Must bring medical records and insurance card',
      'Call back before 5:00 PM today if rescheduling is required'
    ],
    suggestedReplies: [
      {
        en: 'I confirm my appointment for tomorrow at 11 AM with all required records.',
        ta: 'Nalaikku 11 manikku appointment confirm panren, thevaiyana documents kondu varen.'
      },
      {
        en: 'I need to reschedule. I will call your office shortly.',
        ta: 'Enakku vera date maathanum. Konjam nerathula unga office-ku call panren.'
      }
    ],
    translatedTamil: 'அழைப்பாளர் உங்கள் மருத்துவ சந்திப்பை நாளை காலை 11:00 மணிக்கு உறுதிப்படுத்த விரும்புகிறார். மறுஅட்டவணை தேவைப்பட்டால் இன்று மாலை 5:00 மணிக்குள் மீண்டும் அழைக்கக் கேட்டுக்கொண்டுள்ளார்.'
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Intelligence</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Factual Provenance Badge */}
        <View style={styles.provenanceBadge}>
          <Text style={styles.provenanceIcon}>🛡️</Text>
          <Text style={styles.provenanceText}>Verified Factual Summary • Zero Hallucination Guarantee</Text>
        </View>

        {/* Language Switcher */}
        <View style={styles.langToggleRow}>
          <TouchableOpacity
            style={[styles.langTab, selectedLanguage === 'en' && styles.langTabActive]}
            onPress={() => setSelectedLanguage('en')}
          >
            <Text style={[styles.langTabText, selectedLanguage === 'en' && styles.langTabTextActive]}>
              English (Original)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.langTab, selectedLanguage === 'ta' && styles.langTabActive]}
            onPress={() => setSelectedLanguage('ta')}
          >
            <Text style={[styles.langTabText, selectedLanguage === 'ta' && styles.langTabTextActive]}>
              தமிழ் (Tamil)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Summary Box */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>EXECUTIVE SUMMARY</Text>
          <Text style={styles.summaryText}>
            {selectedLanguage === 'en' ? summaryData.summaryText : summaryData.translatedTamil}
          </Text>
        </View>

        {/* Caller Purpose */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>CALLER PURPOSE</Text>
          <View style={styles.purposeBadge}>
            <Text style={styles.purposeText}>{summaryData.callerPurpose}</Text>
          </View>
        </View>

        {/* Extracted Appointments & Dates */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>EXTRACTED DATES & DEADLINES</Text>
          {summaryData.appointmentDates.map((date, i) => (
            <View key={i} style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateText}>{date}</Text>
            </View>
          ))}
        </View>

        {/* Key Points */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>KEY ACTION POINTS</Text>
          {summaryData.keyPoints.map((pt, i) => (
            <View key={i} style={styles.pointRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.pointText}>{pt}</Text>
            </View>
          ))}
        </View>

        {/* Suggested Replies */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>SUGGESTED REPLIES</Text>
          {summaryData.suggestedReplies.map((r, i) => (
            <View key={i} style={styles.replyBox}>
              <Text style={styles.replyLabel}>Option {i + 1}:</Text>
              <Text style={styles.replyEn}>"{r.en}"</Text>
              <Text style={styles.replyTa}>தமிழ்: "{r.ta}"</Text>
              <TouchableOpacity
                style={styles.copyReplyBtn}
                onPress={() => alert(`Reply copied:\n"${r.en}"`)}
              >
                <Text style={styles.copyReplyText}>Copy / Send SMS</Text>
              </TouchableOpacity>
            </View>
          ))}
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
  provenanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    marginBottom: 16,
  },
  provenanceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  provenanceText: {
    color: DarkTheme.success,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  langToggleRow: {
    flexDirection: 'row',
    backgroundColor: DarkTheme.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  langTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  langTabActive: {
    backgroundColor: DarkTheme.primaryBlue,
  },
  langTabText: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  langTabTextActive: {
    color: '#FFFFFF',
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
    marginBottom: 10,
  },
  summaryText: {
    color: DarkTheme.text,
    fontSize: 15,
    lineHeight: 23,
  },
  purposeBadge: {
    backgroundColor: 'rgba(22, 139, 255, 0.12)',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: DarkTheme.primaryBlue,
  },
  purposeText: {
    color: DarkTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateText: {
    color: DarkTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    color: DarkTheme.primaryBlue,
    fontSize: 18,
    marginRight: 8,
    lineHeight: 20,
  },
  pointText: {
    color: DarkTheme.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  replyBox: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  replyLabel: {
    color: DarkTheme.secondaryBlue,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  replyEn: {
    color: DarkTheme.text,
    fontSize: 14,
    marginBottom: 4,
  },
  replyTa: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  copyReplyBtn: {
    alignSelf: 'flex-end',
    backgroundColor: DarkTheme.primaryBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyReplyText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});

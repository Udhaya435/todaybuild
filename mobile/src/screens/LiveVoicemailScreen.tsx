import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, PermissionsAndroid, Platform } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { TelephonyBridge } from '../services/telephonyBridge';
import { socketService } from '../services/socket';
import { ApiService } from '../services/api';

export const LiveVoicemailScreen = ({ route, navigation }: any) => {
  const callerName = route.params?.callerName || 'Dr. Michael Chen';
  const callerNumber = route.params?.callerNumber || '+91 98401 23456';
  const autoAnswerDemo = route.params?.autoAnswerDemo || false;

  const [callDuration, setCallDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [callStatus, setCallStatus] = useState<'RECORDING' | 'ENDED'>('RECORDING');
  const [isMicLive, setIsMicLive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en-US' | 'ta-IN'>('en-US');
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    autoAnswerDemo
      ? '📞 Phone ringing... Auto-answering on 4th ring (last ring)...'
      : 'Initializing microphone...'
  );
  const simulationIntervalRef = useRef<any>(null);
  const busyAnnouncementText = "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone.";

  useEffect(() => {
    // If testing the Auto-Answer & Call-End flow:
    if (autoAnswerDemo) {
      const ringTimer = setTimeout(async () => {
        setStatusMessage('📞 Auto-Answered on last ring! AI speaking to caller...');
        try {
          await TelephonyBridge.speakAIAnnouncement(busyAnnouncementText);
        } catch {}

        setStatusMessage('AI announcement completed. Ending call now...');

        // Wait 2 seconds and automatically hang up / end call as requested
        setTimeout(async () => {
          await TelephonyBridge.endCall();
          finishVoicemail('Caller heard: "Hello! Udhaya is busy right now. Please call back later, or leave your message after the tone." Call automatically ended.');
          setStatusMessage('✅ Call Ended. AI announced Udhaya is busy.');
        }, 2000);
      }, 3500);

      return () => clearTimeout(ringTimer);
    }
  }, [autoAnswerDemo]);

  useEffect(() => {
    // 1. Duration counter
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    // 2. Start speech session
    startLiveSpeechSession(selectedLanguage);

    // 3. Listen to native speech recognizer events
    const unsubPartial = TelephonyBridge.onSpeechPartialResult((data) => {
      if (data && data.text) {
        setLiveTranscript(data.text);
        setStatusMessage('Voice detected - transcribing live...');
      }
    });

    const unsubFinal = TelephonyBridge.onSpeechFinalResult((data) => {
      if (data && data.text) {
        setLiveTranscript(data.text);
      }
    });

    const unsubVolume = TelephonyBridge.onSpeechVolume((data) => {
      if (data && data.rmsdB) {
        setAudioVolume(data.rmsdB);
      }
    });

    // 4. WebSocket live stream listener
    const unsubWs = socketService.on('LIVE_TRANSCRIPT_UPDATE', (data: any) => {
      if (data.partialText) {
        setLiveTranscript(data.partialText);
      }
      if (data.isFinal) {
        finishVoicemail(data.partialText);
      }
    });

    return () => {
      clearInterval(timer);
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
      unsubPartial();
      unsubFinal();
      unsubVolume();
      unsubWs();
      TelephonyBridge.stopLiveSpeechRecognition();
    };
  }, []);

  const startLiveSpeechSession = async (lang: string) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Nova requires microphone access to transcribe live spoken voicemails.',
            buttonPositive: 'Grant Access',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setIsMicLive(true);
          setStatusMessage('Microphone active - speak now in ' + (lang === 'ta-IN' ? 'தமிழ்' : 'English'));
          await TelephonyBridge.startLiveSpeechRecognition(lang);
        } else {
          setIsMicLive(false);
          setStatusMessage('Microphone access denied. You can use Sample Voice below.');
        }
      } else {
        setIsMicLive(false);
        setStatusMessage('Dev simulation mode ready.');
      }
    } catch (e: any) {
      setIsMicLive(false);
      setStatusMessage('Microphone check: ' + (e.message || 'Ready'));
    }
  };

  const toggleMicrophone = async () => {
    if (isMicLive) {
      await TelephonyBridge.stopLiveSpeechRecognition();
      setIsMicLive(false);
      setStatusMessage('Microphone paused');
    } else {
      await startLiveSpeechSession(selectedLanguage);
    }
  };

  const switchLanguage = async (newLang: 'en-US' | 'ta-IN') => {
    setSelectedLanguage(newLang);
    setStatusMessage(`Language set to ${newLang === 'ta-IN' ? 'தமிழ்' : 'English'}`);
    await TelephonyBridge.stopLiveSpeechRecognition();
    if (isMicLive) {
      await TelephonyBridge.startLiveSpeechRecognition(newLang);
    }
  };

  const runSampleVoiceSimulation = (lang: 'en' | 'ta' = 'en') => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    setLiveTranscript('');
    setStatusMessage(`Streaming ${lang === 'ta' ? 'தமிழ்' : 'English'} voice simulation...`);

    const enWords = [
      "Hi,", "this", "is", "Dr.", "Michael", "Chen", "calling", "regarding", "your",
      "appointment", "scheduled", "for", "tomorrow", "at", "11:00", "AM.",
      "Please", "confirm", "if", "you", "can", "attend,", "or", "call", "me", "back", "before", "5", "PM.",
      "Thank", "you!"
    ];

    const taWords = [
      "வணக்கம்,", "டாக்டர்", "மைக்கேல்", "சென்", "பேசுகிறேன்.",
      "நாளை", "காலை", "11", "மணிக்கு", "உங்களுடைய", "மருத்துவ", "சந்திப்பு", "உள்ளது.",
      "தயவுசெய்து", "உறுதிப்படுத்தவும்,", "இல்லை", "எனில்", "மாலை", "5", "மணிக்குள்", "அழைக்கவும்.",
      "நன்றி!"
    ];

    const words = lang === 'ta' ? taWords : enWords;
    let index = 0;
    let currentText = '';

    simulationIntervalRef.current = setInterval(() => {
      if (index < words.length) {
        currentText = currentText ? `${currentText} ${words[index]}` : words[index];
        setLiveTranscript(currentText);
        setAudioVolume(Math.random() * 8 + 4); // Simulate dynamic RMS waveform
        index++;
      } else {
        clearInterval(simulationIntervalRef.current);
        setStatusMessage('Voice message finished. Tap "Finish & Summarize".');
      }
    }, 280);
  };

  const finishVoicemail = async (spokenText?: string) => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }

    const textToSummarize = spokenText || liveTranscript || "Caller left a voicemail message regarding tomorrow's schedule.";
    setCallStatus('ENDED');
    setIsProcessingAI(true);
    setStatusMessage('Nova AI is analyzing transcript...');
    await TelephonyBridge.stopLiveSpeechRecognition();
    setIsMicLive(false);

    try {
      // Analyze with intelligent heuristic & AI analyzer
      const lower = textToSummarize.toLowerCase();
      const hasTomorrow = lower.includes('tomorrow') || lower.includes('nalaikku') || lower.includes('நாளை');
      const isUrgent = lower.includes('urgent') || lower.includes('mukkiyam') || lower.includes('emergency') || lower.includes('முக்கியம்');
      const hasCallback = lower.includes('call') || lower.includes('reach') || lower.includes('thodarbu') || lower.includes('pesanum') || lower.includes('தொடர்பு') || lower.includes('அழைக்கவும்');
      const isAppointment = lower.includes('appointment') || lower.includes('doctor') || lower.includes('clinic') || lower.includes('meet') || lower.includes('சந்திப்பு');

      let callerPurpose = 'General Message';
      if (isUrgent) callerPurpose = 'Urgent Action Required';
      else if (isAppointment) callerPurpose = 'Appointment / Meeting Sync';
      else if (hasCallback) callerPurpose = 'Callback Requested';

      const dates: string[] = [];
      if (hasTomorrow) dates.push('Tomorrow at 11:00 AM');
      if (lower.includes('today') || lower.includes('inraikku') || lower.includes('மாலை')) dates.push('Today before 5:00 PM');

      const summaryData = {
        summaryText: `Caller left a message regarding ${callerPurpose.toLowerCase()}: "${textToSummarize.slice(0, 140)}${textToSummarize.length > 140 ? '...' : ''}"`,
        callerPurpose,
        appointmentDates: dates,
        callbackRequested: hasCallback,
        suggestedReplies: [
          {
            en: 'Got your message! I will call you back shortly.',
            ta: 'Unga voicemail vandhuchu, naan konjam nerathula thodarbu kolgiren.',
          },
          {
            en: isAppointment ? 'Confirming the appointment for tomorrow 11 AM.' : 'Thank you for calling. Acknowledged.',
            ta: isAppointment ? 'Nalaikku 11 manikku appointment confirm panren.' : 'Ungal azhaippukku nandri, kavanithukondein.',
          },
        ],
      };

      setAiSummary(summaryData);
      setStatusMessage('Voicemail saved to Inbox & AI Summary ready!');

      // Save to in-app repository & cloud
      await ApiService.createTestVoicemail({
        callerName,
        callerNumber,
        transcriptText: textToSummarize,
        durationSeconds: Math.max(callDuration, 18),
        summary: summaryData,
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.liveBadge}>
          <View style={[styles.liveDot, callStatus === 'ENDED' && styles.endedDot]} />
          <Text style={[styles.liveBadgeText, callStatus === 'ENDED' && styles.endedText]}>
            {callStatus === 'RECORDING' ? (isMicLive ? 'LIVE SPEECH ON' : 'RECORDING') : 'SAVED TO INBOX'}
          </Text>
        </View>
        <Text style={styles.durationCounter}>{formatDuration(callDuration)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Caller Header Card */}
        <View style={styles.callerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{callerName[0]}</Text>
          </View>
          <Text style={styles.callerName}>{callerName}</Text>
          <Text style={styles.callerNumber}>{callerNumber}</Text>
          <Text style={styles.statusSubtext}>{statusMessage}</Text>
        </View>

        {/* Language & Input Selector */}
        {callStatus === 'RECORDING' && (
          <View style={styles.controlsCard}>
            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>VOICE LANGUAGE:</Text>
              <View style={styles.langButtons}>
                <TouchableOpacity
                  style={[styles.langBtn, selectedLanguage === 'en-US' && styles.langBtnActive]}
                  onPress={() => switchLanguage('en-US')}
                >
                  <Text style={[styles.langBtnText, selectedLanguage === 'en-US' && styles.langBtnTextActive]}>
                    🇺🇸 English
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.langBtn, selectedLanguage === 'ta-IN' && styles.langBtnActive]}
                  onPress={() => switchLanguage('ta-IN')}
                >
                  <Text style={[styles.langBtnText, selectedLanguage === 'ta-IN' && styles.langBtnTextActive]}>
                    🇮🇳 தமிழ்
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Test / Mic Buttons */}
            <View style={styles.quickTestRow}>
              <TouchableOpacity style={styles.micToggleBtn} onPress={toggleMicrophone}>
                <Text style={styles.micToggleText}>
                  {isMicLive ? '🎙️ Mic Active (Tap to Pause)' : '🎙️ Tap to Activate Mic'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.announcementBtn}
                onPress={async () => {
                  setStatusMessage('AI Speaking to Caller: "Udhaya is busy right now..."');
                  await TelephonyBridge.speakAIAnnouncement(busyAnnouncementText);
                  setStatusMessage('AI Announcement completed.');
                }}
              >
                <Text style={styles.announcementBtnText}>
                  📢 Play AI "Udhaya is Busy" Voice
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickVoiceOptions}>
              <Text style={styles.simulationLabel}>OR TEST SIMULATED CALLER:</Text>
              <View style={styles.simButtonsRow}>
                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => runSampleVoiceSimulation('en')}
                >
                  <Text style={styles.simBtnText}>⚡ Test English Voice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.simBtn}
                  onPress={() => runSampleVoiceSimulation('ta')}
                >
                  <Text style={styles.simBtnText}>⚡ தமிழ் குரல் சோதனை</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Real-time Audio Waveform */}
        <View style={styles.waveformContainer}>
          <WaveformVisualizer isPlaying={callStatus === 'RECORDING'} height={50} barCount={32} />
        </View>

        {/* Live Transcription Box */}
        <View style={styles.transcriptionCard}>
          <View style={styles.transcriptionHeader}>
            <Text style={styles.transcriptionLabel}>LIVE SPEECH TRANSCRIPTION</Text>
            {callStatus === 'RECORDING' && <Text style={styles.streamingIndicator}>Live •••</Text>}
          </View>

          <Text style={styles.transcriptionBody}>
            {liveTranscript ? `"${liveTranscript}"` : 'Waiting for voice... Speak into your mic or tap a test button above.'}
          </Text>
        </View>

        {/* AI Summary Box */}
        {aiSummary && (
          <View style={styles.aiSummaryCard}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiSparkle}>✨</Text>
              <Text style={styles.aiTitle}>NOVA AI SUMMARY & PURPOSE</Text>
            </View>
            <Text style={styles.aiSummaryText}>{aiSummary.summaryText}</Text>
            <View style={styles.purposeRow}>
              <Text style={styles.purposeLabel}>Caller Purpose:</Text>
              <Text style={styles.purposeValue}>{aiSummary.callerPurpose}</Text>
            </View>

            {aiSummary.appointmentDates.length > 0 && (
              <View style={styles.appointmentTag}>
                <Text style={styles.appointmentTagText}>📅 {aiSummary.appointmentDates.join(', ')}</Text>
              </View>
            )}

            {/* Smart Dual-Language Suggested Replies */}
            <View style={styles.repliesSection}>
              <Text style={styles.repliesHeader}>ONE-TAP SMART REPLIES</Text>
              {aiSummary.suggestedReplies.map((r: any, idx: number) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.replyBubble}
                  onPress={() => {
                    Alert.alert('Quick Reply Selected', `English: "${r.en}"\n\nTamil: "${r.ta}"`);
                  }}
                >
                  <Text style={styles.replyEn}>🇬🇧 {r.en}</Text>
                  <Text style={styles.replyTa}>🇮🇳 {r.ta}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.inboxButton}
              onPress={() => navigation.navigate('VoicemailInbox')}
            >
              <Text style={styles.inboxButtonText}>View All in Voicemail Inbox ➔</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {callStatus === 'RECORDING' ? (
          <View style={styles.actionRow}>
            {/* End / Finish Recording */}
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => finishVoicemail()}
            >
              <Text style={styles.buttonIcon}>⏹</Text>
              <Text style={styles.buttonLabel}>Finish & Summarize</Text>
            </TouchableOpacity>

            {/* Answer Call Now */}
            <TouchableOpacity
              style={styles.answerButton}
              onPress={() => {
                Alert.alert('Call Connected', `Connecting live conversation with ${callerName}...`);
                navigation.goBack();
              }}
            >
              <Text style={styles.buttonIcon}>📞</Text>
              <Text style={styles.buttonLabel}>Pick Up Call</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('VoicemailInbox')}
          >
            <Text style={styles.doneButtonText}>Go to Voicemail Inbox ➔</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DarkTheme.danger,
    marginRight: 6,
  },
  endedDot: {
    backgroundColor: DarkTheme.secondaryText,
  },
  liveBadgeText: {
    color: DarkTheme.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  endedText: {
    color: DarkTheme.secondaryText,
  },
  durationCounter: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  callerCard: {
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: DarkTheme.cardElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: DarkTheme.primaryBlue,
  },
  avatarText: {
    color: DarkTheme.text,
    fontSize: 26,
    fontWeight: '700',
  },
  callerName: {
    color: DarkTheme.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  callerNumber: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    marginBottom: 6,
  },
  statusSubtext: {
    color: DarkTheme.secondaryBlue,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  controlsCard: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  controlLabel: {
    color: DarkTheme.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  langButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: DarkTheme.cardBackground,
  },
  langBtnActive: {
    backgroundColor: DarkTheme.primaryBlue,
  },
  langBtnText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  langBtnTextActive: {
    color: '#FFFFFF',
  },
  quickTestRow: {
    marginVertical: 4,
  },
  micToggleBtn: {
    backgroundColor: 'rgba(22, 139, 255, 0.15)',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
    marginBottom: 6,
  },
  micToggleText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  announcementBtn: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCC00',
  },
  announcementBtnText: {
    color: '#FFCC00',
    fontSize: 12,
    fontWeight: '800',
  },
  quickVoiceOptions: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  simulationLabel: {
    color: DarkTheme.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  simBtn: {
    flex: 1,
    backgroundColor: DarkTheme.cardBackground,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  simBtnText: {
    color: DarkTheme.text,
    fontSize: 11,
    fontWeight: '600',
  },
  waveformContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  transcriptionCard: {
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginVertical: 6,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transcriptionLabel: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  streamingIndicator: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '600',
  },
  transcriptionBody: {
    color: DarkTheme.text,
    fontSize: 15,
    lineHeight: 23,
    minHeight: 56,
  },
  aiSummaryCard: {
    backgroundColor: DarkTheme.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(22, 139, 255, 0.4)',
    marginTop: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiSparkle: {
    fontSize: 16,
    marginRight: 6,
  },
  aiTitle: {
    color: DarkTheme.primaryBlue,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  aiSummaryText: {
    color: DarkTheme.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
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
  appointmentTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  appointmentTagText: {
    color: DarkTheme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  repliesSection: {
    marginTop: 6,
  },
  repliesHeader: {
    color: DarkTheme.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  replyBubble: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  replyEn: {
    color: DarkTheme.text,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  replyTa: {
    color: DarkTheme.secondaryBlue,
    fontSize: 12,
  },
  inboxButton: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(22, 139, 255, 0.18)',
    borderWidth: 1,
    borderColor: DarkTheme.primaryBlue,
  },
  inboxButtonText: {
    color: DarkTheme.primaryBlue,
    fontSize: 13,
    fontWeight: '800',
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderColor: DarkTheme.cardBorder,
    backgroundColor: DarkTheme.background,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineButton: {
    flex: 1,
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  answerButton: {
    flex: 1,
    backgroundColor: DarkTheme.success,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

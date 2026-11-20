import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { ApiService } from '../services/api';
import { VoicemailGreeting } from '../types';

export const GreetingManagementScreen = ({ navigation }: any) => {
  const [greetings, setGreetings] = useState<VoicemailGreeting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newText, setNewText] = useState('');
  const [newLanguage, setNewLanguage] = useState<'en' | 'ta' | 'ta-Latn'>('en');
  const [voiceId, setVoiceId] = useState('nova');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadGreetings();
  }, []);

  const loadGreetings = async () => {
    try {
      const data = await ApiService.getGreetings();
      if (data && data.length > 0) {
        setGreetings(data);
      } else {
        // Sample default
        setGreetings([
          {
            id: 'g-default',
            title: 'Standard Greeting (English)',
            greetingType: 'DEFAULT',
            transcriptText: 'Hello! I am currently unavailable. Please leave your name and message after the tone. I will get back to you soon.',
            language: 'en',
            isDefault: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'g-tamil',
            title: 'வணக்கம் Greeting (Tamil)',
            greetingType: 'AI_GENERATED',
            transcriptText: 'வணக்கம்! நான் தற்போது அழைப்பை ஏற்க இயலவில்லை. பீப் ஒலிக்குப் பிறகு உங்கள் பெயர் மற்றும் செய்தியை விட்டுச்செல்லுங்கள்.',
            language: 'ta',
            voiceId: 'nova',
            isDefault: false,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    } catch (e) {
      console.log('Failed to fetch greetings');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await ApiService.updateGreeting(id, { isDefault: true });
      setGreetings((prev) =>
        prev.map((g) => ({ ...g, isDefault: g.id === id }))
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to set default greeting');
    }
  };

  const handleCreateAIGreeting = async () => {
    if (!newTitle || !newText) {
      Alert.alert('Required', 'Please enter a title and greeting text');
      return;
    }

    try {
      setIsGenerating(true);
      const greeting = await ApiService.createGreeting({
        title: newTitle,
        greetingType: 'AI_GENERATED',
        transcriptText: newText,
        language: newLanguage,
        voiceId,
        isDefault: false,
      });

      setGreetings((prev) => [greeting, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewText('');
      Alert.alert('Success', 'AI Voicemail greeting generated and ready!');
    } catch (e) {
      Alert.alert('Error', 'Failed to generate AI greeting');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Voicemail Greetings</Text>
          <TouchableOpacity onPress={() => setIsModalOpen(true)}>
            <Text style={styles.addButton}>+ New</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Callers hear this message when routed to your live voicemail.
        </Text>

        {/* Greetings List */}
        {greetings.map((g) => (
          <View key={g.id} style={[styles.greetingCard, g.isDefault && styles.defaultCard]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.greetingTitle}>{g.title}</Text>
                  {g.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>ACTIVE DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.langTag}>
                  Language: {g.language === 'ta' ? 'தமிழ் (Tamil)' : g.language === 'ta-Latn' ? 'Tanglish' : 'English'} • Type: {g.greetingType}
                </Text>
              </View>
            </View>

            <Text style={styles.greetingTranscript}>
              "{g.transcriptText}"
            </Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => alert(`Previewing audio for: ${g.title}`)}
              >
                <Text style={styles.playText}>▶ Preview Audio</Text>
              </TouchableOpacity>

              {!g.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultButton}
                  onPress={() => handleSetDefault(g.id)}
                >
                  <Text style={styles.setDefaultText}>Set as Active</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal to create AI Voice Greeting */}
      <Modal visible={isModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create AI Voice Greeting</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>GREETING TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Business Hours / After Hours"
              placeholderTextColor={DarkTheme.mutedText}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>LANGUAGE</Text>
            <View style={styles.langPickerRow}>
              {(['en', 'ta', 'ta-Latn'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.langPickBtn, newLanguage === l && styles.langPickBtnActive]}
                  onPress={() => setNewLanguage(l)}
                >
                  <Text style={[styles.langPickText, newLanguage === l && styles.langPickTextActive]}>
                    {l === 'en' ? 'English' : l === 'ta' ? 'தமிழ்' : 'Tanglish'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>SPOKEN GREETING SCRIPT</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter what Nova AI should say to callers..."
              placeholderTextColor={DarkTheme.mutedText}
              multiline
              numberOfLines={4}
              value={newText}
              onChangeText={setNewText}
            />

            <TouchableOpacity
              style={[styles.generateBtn, isGenerating && styles.generateBtnDisabled]}
              onPress={handleCreateAIGreeting}
              disabled={isGenerating}
            >
              <Text style={styles.generateBtnText}>
                {isGenerating ? 'Generating Neural Audio...' : '✨ Generate AI Voice Greeting'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
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
  addButton: {
    color: DarkTheme.primaryBlue,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  greetingCard: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
    marginBottom: 16,
  },
  defaultCard: {
    borderColor: DarkTheme.primaryBlue,
    backgroundColor: '#121A28',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  greetingTitle: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: DarkTheme.primaryBlue,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  langTag: {
    color: DarkTheme.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  greetingTranscript: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: DarkTheme.divider,
    paddingTop: 12,
  },
  playButton: {
    backgroundColor: DarkTheme.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  playText: {
    color: DarkTheme.text,
    fontSize: 12,
    fontWeight: '600',
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  setDefaultText: {
    color: DarkTheme.primaryBlue,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DarkTheme.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalClose: {
    color: DarkTheme.secondaryText,
    fontSize: 18,
    padding: 4,
  },
  inputLabel: {
    color: DarkTheme.mutedText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: DarkTheme.cardElevated,
    borderRadius: 14,
    padding: 14,
    color: DarkTheme.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  langPickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  langPickBtn: {
    flex: 1,
    backgroundColor: DarkTheme.cardElevated,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  langPickBtnActive: {
    backgroundColor: DarkTheme.primaryBlue,
    borderColor: DarkTheme.primaryBlue,
  },
  langPickText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  langPickTextActive: {
    color: '#FFFFFF',
  },
  generateBtn: {
    backgroundColor: DarkTheme.primaryBlue,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: DarkTheme.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateBtnDisabled: {
    opacity: 0.6,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

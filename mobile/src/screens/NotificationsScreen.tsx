import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';

export const NotificationsScreen = ({ navigation }: any) => {
  const notifications = [
    {
      id: '1',
      title: 'New Voicemail Received',
      body: 'Sarah Jenkins left a message: "Confirming product sync tomorrow at 10 AM..."',
      time: '12m ago',
      type: 'VOICEMAIL'
    },
    {
      id: '2',
      title: 'Live Voicemail Call Screened',
      body: 'Dr. Michael Chen completed speech transcription and AI summary.',
      time: '1h ago',
      type: 'SCREENED'
    },
    {
      id: '3',
      title: 'Carrier Forwarding Active',
      body: 'Conditional forwarding successfully verified with carrier.',
      time: 'Yesterday',
      type: 'SYSTEM'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.notifCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>{item.type === 'VOICEMAIL' ? '🎙️' : item.type === 'SCREENED' ? '🛡️' : '⚙️'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  list: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DarkTheme.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: DarkTheme.text,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  time: {
    color: DarkTheme.mutedText,
    fontSize: 11,
  },
  body: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
});

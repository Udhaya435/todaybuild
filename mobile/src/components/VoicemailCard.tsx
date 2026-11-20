import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { Voicemail } from '../types';

interface VoicemailCardProps {
  voicemail: Voicemail;
  onPress: () => void;
  onPlayQuick?: () => void;
  onDelete?: () => void;
}

export const VoicemailCard: React.FC<VoicemailCardProps> = ({
  voicemail,
  onPress,
  onPlayQuick,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <TouchableOpacity
      style={[styles.card, !voicemail.isRead && styles.unreadCard]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        {/* Caller Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(voicemail.callerName)}</Text>
        </View>

        {/* Caller info */}
        <View style={styles.callerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.callerName} numberOfLines={1}>
              {voicemail.callerName || voicemail.callerNumber}
            </Text>
            {!voicemail.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.callerNumber}>{voicemail.callerNumber}</Text>
        </View>

        {/* Date & Duration */}
        <View style={styles.metaInfo}>
          <Text style={styles.dateText}>{formatDate(voicemail.createdAt)}</Text>
          <Text style={styles.durationText}>{formatDuration(voicemail.durationSeconds)}</Text>
        </View>
      </View>

      {/* Transcript or AI Summary Preview */}
      <View style={styles.contentSection}>
        {voicemail.summary ? (
          <View style={styles.aiSummaryBadge}>
            <Text style={styles.aiSummaryLabel}>AI SUMMARY</Text>
            <Text style={styles.aiSummaryText} numberOfLines={2}>
              {voicemail.summary.summaryText}
            </Text>
          </View>
        ) : (
          <Text style={styles.transcriptPreview} numberOfLines={2}>
            {voicemail.transcript?.rawText || 'Transcribing voicemail...'}
          </Text>
        )}
      </View>

      {/* Bottom tag row: Purpose or Callback */}
      {voicemail.summary?.callbackRequested && (
        <View style={styles.callbackBadge}>
          <Text style={styles.callbackBadgeText}>📞 Callback requested</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkTheme.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  unreadCard: {
    borderColor: 'rgba(22, 139, 255, 0.3)',
    backgroundColor: '#121824',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DarkTheme.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  avatarText: {
    color: DarkTheme.primaryBlue,
    fontWeight: '700',
    fontSize: 16,
  },
  callerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callerName: {
    color: DarkTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DarkTheme.primaryBlue,
    marginLeft: 8,
  },
  callerNumber: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    marginTop: 2,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    color: DarkTheme.mutedText,
    fontSize: 12,
  },
  durationText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  contentSection: {
    marginTop: 12,
  },
  aiSummaryBadge: {
    backgroundColor: 'rgba(22, 139, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: DarkTheme.primaryBlue,
  },
  aiSummaryLabel: {
    color: DarkTheme.secondaryBlue,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  aiSummaryText: {
    color: DarkTheme.text,
    fontSize: 13,
    lineHeight: 18,
  },
  transcriptPreview: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },
  callbackBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 179, 0, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  callbackBadgeText: {
    color: DarkTheme.warning,
    fontSize: 11,
    fontWeight: '600',
  },
});

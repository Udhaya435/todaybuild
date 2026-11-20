import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { DarkTheme } from '../theme/colors';
import { VoicemailCard } from '../components/VoicemailCard';
import { ApiService } from '../services/api';
import { VoicemailStore } from '../services/voicemailStore';
import { Voicemail } from '../types';

export const VoicemailInboxScreen = ({ navigation }: any) => {
  const [voicemails, setVoicemails] = useState<Voicemail[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterCallbacks, setFilterCallbacks] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(false);

  const fetchVoicemails = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getVoicemails({
        unreadOnly: filterUnread,
        search: searchQuery,
        sort: sortOrder,
      });
      setVoicemails(res.voicemails || []);
    } catch (e) {
      setVoicemails(VoicemailStore.getAllVoicemails());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoicemails();
    // Subscribe to store updates (e.g. newly saved voicemails from LiveVoicemail)
    const unsub = VoicemailStore.subscribe(() => {
      fetchVoicemails();
    });
    return unsub;
  }, [filterUnread, sortOrder]);

  const handleSearchSubmit = () => {
    fetchVoicemails();
  };

  const filteredList = voicemails.filter((vm) => {
    if (filterCallbacks && !vm.summary?.callbackRequested) {
      return false;
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Voicemail Inbox</Text>
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Text style={styles.sortButtonText}>
            {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by caller, transcript or AI..."
          placeholderTextColor={DarkTheme.mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); fetchVoicemails(); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.chip, !filterUnread && !filterCallbacks && styles.chipActive]}
          onPress={() => { setFilterUnread(false); setFilterCallbacks(false); }}
        >
          <Text style={[styles.chipText, !filterUnread && !filterCallbacks && styles.chipTextActive]}>
            All ({voicemails.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterUnread && styles.chipActive]}
          onPress={() => setFilterUnread(!filterUnread)}
        >
          <Text style={[styles.chipText, filterUnread && styles.chipTextActive]}>
            Unread
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, filterCallbacks && styles.chipActive]}
          onPress={() => setFilterCallbacks(!filterCallbacks)}
        >
          <Text style={[styles.chipText, filterCallbacks && styles.chipTextActive]}>
            📞 Callbacks
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={fetchVoicemails}
        renderItem={({ item }) => (
          <VoicemailCard
            voicemail={item}
            onPress={() => navigation.navigate('VoicemailDetail', { voicemailId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No Voicemails Found</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? 'Try adjusting your search criteria.' : 'When callers leave a message, transcripts and AI summaries appear here.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionButton}
              onPress={() => navigation.navigate('LiveVoicemail', {
                callerName: 'Dr. Michael Chen',
                callerNumber: '+91 98401 23456',
              })}
            >
              <Text style={styles.emptyActionText}>⚡ Record New Live Voicemail</Text>
            </TouchableOpacity>
          </View>
        }
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
    borderBottomWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 6,
  },
  backButtonText: {
    color: DarkTheme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    color: DarkTheme.text,
    fontSize: 22,
    fontWeight: '700',
  },
  sortButton: {
    backgroundColor: DarkTheme.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  sortButtonText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.cardBackground,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: DarkTheme.text,
    fontSize: 14,
  },
  clearIcon: {
    color: DarkTheme.mutedText,
    fontSize: 14,
    padding: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: DarkTheme.cardElevated,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  chipActive: {
    backgroundColor: DarkTheme.primaryBlue,
    borderColor: DarkTheme.primaryBlue,
  },
  chipText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: DarkTheme.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    color: DarkTheme.secondaryText,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 30,
    marginBottom: 16,
  },
  emptyActionButton: {
    backgroundColor: DarkTheme.primaryBlue,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

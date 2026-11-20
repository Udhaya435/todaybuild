import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { DarkTheme } from '../theme/colors';

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  isVip: boolean;
}

export const ContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: '1', name: 'Sarah Jenkins', phone: '+1 415-555-0132', isVip: true },
    { id: '2', name: 'Dr. Michael Chen', phone: '+1 650-892-4410', isVip: true },
    { id: '3', name: 'Alex Rivera', phone: '+1 408-555-0199', isVip: false },
    { id: '4', name: 'David Kumar', phone: '+91 98401 23456', isVip: false },
  ]);

  const [search, setSearch] = useState('');

  const toggleVip = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isVip: !c.isVip } : c))
    );
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VIP & Contacts</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={DarkTheme.mutedText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity
              style={[styles.vipBadge, item.isVip && styles.vipBadgeActive]}
              onPress={() => toggleVip(item.id)}
            >
              <Text style={[styles.vipText, item.isVip && styles.vipTextActive]}>
                {item.isVip ? '★ VIP' : '☆ Add VIP'}
              </Text>
            </TouchableOpacity>
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
  searchContainer: {
    backgroundColor: DarkTheme.card,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  searchInput: {
    color: DarkTheme.text,
    paddingVertical: 12,
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: DarkTheme.cardBorder,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DarkTheme.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: DarkTheme.primaryBlue,
    fontWeight: '700',
    fontSize: 16,
  },
  contactName: {
    color: DarkTheme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  contactPhone: {
    color: DarkTheme.secondaryText,
    fontSize: 13,
    marginTop: 2,
  },
  vipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: DarkTheme.cardElevated,
  },
  vipBadgeActive: {
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    borderWidth: 1,
    borderColor: DarkTheme.warning,
  },
  vipText: {
    color: DarkTheme.secondaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  vipTextActive: {
    color: DarkTheme.warning,
  },
});

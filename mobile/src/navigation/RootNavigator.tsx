import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, BackHandler, Animated } from 'react-native';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PermissionSetupScreen } from '../screens/PermissionSetupScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VoicemailInboxScreen } from '../screens/VoicemailInboxScreen';
import { LiveVoicemailScreen } from '../screens/LiveVoicemailScreen';
import { VoicemailDetailScreen } from '../screens/VoicemailDetailScreen';
import { AudioPlayerScreen } from '../screens/AudioPlayerScreen';
import { AISummaryScreen } from '../screens/AISummaryScreen';
import { GreetingManagementScreen } from '../screens/GreetingManagementScreen';
import { CallSettingsScreen } from '../screens/CallSettingsScreen';
import { ForwardingConfigScreen } from '../screens/ForwardingConfigScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AppSettingsScreen } from '../screens/AppSettingsScreen';

interface ScreenEntry {
  name: string;
  params?: any;
}

let globalNavRef: { navigate: (screen: string, params?: any) => void } | null = null;

export const navigateGlobal = (screenName: string, params: any = {}) => {
  if (globalNavRef) {
    globalNavRef.navigate(screenName, params);
  }
};

const SCREENS: Record<string, React.ComponentType<any>> = {
  Splash: SplashScreen,
  Onboarding: OnboardingScreen,
  PermissionSetup: PermissionSetupScreen,
  Dashboard: DashboardScreen,
  VoicemailInbox: VoicemailInboxScreen,
  LiveVoicemail: LiveVoicemailScreen,
  VoicemailDetail: VoicemailDetailScreen,
  AudioPlayer: AudioPlayerScreen,
  AISummary: AISummaryScreen,
  GreetingManagement: GreetingManagementScreen,
  CallSettings: CallSettingsScreen,
  ForwardingConfig: ForwardingConfigScreen,
  Contacts: ContactsScreen,
  Notifications: NotificationsScreen,
  Profile: ProfileScreen,
  AppSettings: AppSettingsScreen,
};

export const RootNavigator: React.FC = () => {
  const [history, setHistory] = useState<ScreenEntry[]>([{ name: 'Splash', params: {} }]);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentEntry = history[history.length - 1] || { name: 'Dashboard', params: {} };

  // Android Hardware Back button handling
  useEffect(() => {
    const onBackPress = () => {
      if (history.length > 1) {
        goBack();
        return true;
      }
      return false; // Exit app if at root
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [history]);

  const animateTransition = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.85, duration: 80, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    callback();
  };

  const navigate = (screenName: string, params: any = {}) => {
    animateTransition(() => {
      setHistory((prev) => [...prev, { name: screenName, params }]);
    });
  };

  useEffect(() => {
    globalNavRef = { navigate };
    return () => {
      globalNavRef = null;
    };
  }, []);

  const replace = (screenName: string, params: any = {}) => {
    animateTransition(() => {
      setHistory((prev) => [...prev.slice(0, prev.length - 1), { name: screenName, params }]);
    });
  };

  const goBack = () => {
    if (history.length > 1) {
      animateTransition(() => {
        setHistory((prev) => prev.slice(0, prev.length - 1));
      });
    }
  };

  const navigation = {
    navigate,
    replace,
    goBack,
  };

  const route = {
    name: currentEntry.name,
    params: currentEntry.params || {},
  };

  const ScreenComponent = SCREENS[currentEntry.name] || DashboardScreen;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScreenComponent navigation={navigation} route={route} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
});

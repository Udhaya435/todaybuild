import React, { useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { RootNavigator, navigateGlobal } from './src/navigation/RootNavigator';
import { TelephonyBridge } from './src/services/telephonyBridge';
import { socketService } from './src/services/socket';

export default function App() {
  useEffect(() => {
    // 1. Connect WebSocket to backend for live transcription streams
    try {
      socketService.connect('demo-user-1');
    } catch (e) {
      console.log('[App] Socket connect optional in demo');
    }

    // 2. Check if opened via incoming call intent/notification
    try {
      TelephonyBridge.getInitialCallDetails().then((details) => {
        if (details.screen === 'LiveVoicemail' && details.callerNumber) {
          navigateGlobal('LiveVoicemail', {
            callerNumber: details.callerNumber,
            callerName: details.callerName || 'Incoming Caller',
          });
        }
      });
    } catch (e) {
      console.log('[App] getInitialCallDetails error:', e);
    }

    // 3. Listen to native Android CallScreening / InCallService incoming events
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = TelephonyBridge.onIncomingCall((event) => {
        console.log('[App] Incoming call event from Android Telecom:', event);
        navigateGlobal('LiveVoicemail', {
          callerNumber: event.phoneNumber,
          callerName: event.displayName || 'Incoming Caller',
        });
      });
    } catch (e) {
      console.log('[App] Telecom bridge listener error:', e);
    }

    return () => {
      unsubscribe();
      try {
        socketService.disconnect();
      } catch (e) {}
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0D12" />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D12',
  },
});

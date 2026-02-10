import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigatorNew from './src/navigation/AppNavigatorNew';
import 'react-native-get-random-values';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppNavigatorNew />
    </SafeAreaProvider>
  );
}

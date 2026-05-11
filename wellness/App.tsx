import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  NavigationProp,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import type { RootStackParamList } from './screens/navigation-types';
import { initAuditLogger } from './modules/audit-logger';

// Screens
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import PrivacyConsentScreen from './screens/PrivacyConsentScreen';
import WizardScreen from './screens/WizardScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import ResultScreen from './screens/ResultScreen';
import ExpertReferralScreen from './screens/ExpertReferralScreen';
import FrequencyProgramScreen from './screens/FrequencyProgramScreen';
import PlayerScreen from './screens/PlayerScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4A90D9',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    border: '#E2E8F0',
    notification: '#EF4444',
  },
};

/**
 * AppNavigator — Main navigation stack for wellness app.
 * Handles conditional flow: Splash → Onboarding → PrivacyConsent → Wizard/Home
 */
function AppNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // Initialize audit logger
        await initAuditLogger();

        // Check if user already registered
        const savedUserId = await AsyncStorage.getItem('userId');
        if (savedUserId) {
          setIsRegistered(true);
        }
      } catch (error) {
        console.error('Bootstrap error:', error);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4A90D9" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#F8FAFC' },
        }}
        initialRouteName={isRegistered ? 'Home' : 'Splash'}
      >
        {/* Onboarding flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="PrivacyConsent" component={PrivacyConsentScreen} />

        {/* Main questionnaire flow */}
        <Stack.Screen name="Wizard" component={WizardScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />

        {/* Expert referral — non-dismissible */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ExpertReferral" component={ExpertReferralScreen} />
        </Stack.Group>

        {/* Results and program */}
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="FrequencyProgram" component={FrequencyProgramScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />

        {/* Home and settings */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

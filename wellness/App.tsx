import React, { useEffect, useState } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
 * AppNavigator — Root navigation container.
 * Bootstrap sırasında audit logger başlatılır; routing SplashScreen'e bırakılır.
 */
function AppNavigator() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initAuditLogger()
      .catch(() => undefined)
      .finally(() => setIsReady(true));
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
        screenOptions={{ headerShown: false }}
        initialRouteName="Splash"
      >
        {/* Onboarding flow — SplashScreen yönlendirmeyi kendisi belirler */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="PrivacyConsent" component={PrivacyConsentScreen} />

        {/* Questionnaire flow */}
        <Stack.Screen name="Wizard" component={WizardScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />

        {/* Expert referral — modal, non-dismissible */}
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ExpertReferral" component={ExpertReferralScreen} />
        </Stack.Group>

        {/* Results and program */}
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="FrequencyProgram" component={FrequencyProgramScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />

        {/* Main app */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

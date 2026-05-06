import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { loadAppData } from '../store/storage';
import { COLORS } from '../constants/theme';

import OnboardingScreen from '../screens/OnboardingScreen';
import PasswordScreen from '../screens/PasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import PostScreen from '../screens/PostScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import ExploreScreen from '../screens/ExploreScreen';
import AboutTaScreen from '../screens/AboutTaScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const data = await loadAppData();
      if (data.isOnboarded) {
        // Skip password screen if password lock is disabled
        if (data.settings?.passwordEnabled === false) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Password');
        }
      } else {
        setInitialRoute('Onboarding');
      }
    }
    init();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          cardStyle: {
            backgroundColor: COLORS.background,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Password"
          component={PasswordScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Post"
          component={PostScreen}
          options={({ route }: any) => ({
            title: route.params?.post ? '编辑记录' : route.params?.date ? '添加记录' : '记录',
            headerBackTitle: '返回',
          })}
        />
        <Stack.Screen
          name="DayDetail"
          component={DayDetailScreen}
          options={({ route }: any) => ({
            title: route.params?.date
              ? formatDateTitle(route.params.date)
              : '日记详情',
            headerBackTitle: '返回',
          })}
        />
        <Stack.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            title: '探索',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="AboutTa"
          component={AboutTaScreen}
          options={{
            title: '关于 ta',
            headerBackTitle: '返回',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '设置',
            headerBackTitle: '返回',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function formatDateTitle(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${y}年${parseInt(m)}月${parseInt(d)}日`;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View, StyleSheet} from 'react-native';

import {HomeScreen} from '../screens/HomeScreen';
import {WorkoutSessionScreen} from '../screens/WorkoutSessionScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {MarketplaceScreen} from '../screens/MarketplaceScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import {RestTimerBanner} from '../components/RestTimerBanner';
import {useTimer} from '../context/TimerContext';
import type {Routine} from '../types/models';

// ─── Stack params ─────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  RoutineList: undefined;
  WorkoutSession: {routine: Routine};
};

// ─── Tab icon helper ─────────────────────────────────────────────────────────

function TabIcon({emoji, label, focused}: {emoji: string; label: string; focused: boolean}): React.JSX.Element {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

// ─── Home stack (Routine List → Workout Session) ──────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function HomeStackNavigator(): React.JSX.Element {
  const timer = useTimer();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#111111'},
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {fontWeight: '700'},
        contentStyle: {backgroundColor: '#000000'},
      }}>
      <HomeStack.Screen
        name="RoutineList"
        component={HomeScreen}
        options={{
          title: 'GymTracker',
          headerRight: () => (timer.isRunning ? <RestTimerBanner /> : null),
        }}
      />
      <HomeStack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
        options={({route}) => ({
          title: route.params.routine.name,
          headerRight: () => (timer.isRunning ? <RestTimerBanner /> : null),
        })}
      />
    </HomeStack.Navigator>
  );
}

// ─── Bottom Tab navigator ─────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

export function AppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🏋️" label="Workout" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="📅" label="History" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="🛒" label="Market" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <TabIcon emoji="⚙️" label="Settings" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111111',
    borderTopColor: '#222222',
    height: 60,
    paddingBottom: 4,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  tabLabelFocused: {
    color: '#F97316',
  },
});

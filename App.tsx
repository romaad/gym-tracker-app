import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppNavigator} from './src/navigation/AppNavigator';
import {TimerProvider} from './src/context/TimerContext';
import {WorkoutProvider} from './src/context/WorkoutContext';
import {notificationService} from './src/services/notificationService';

// Bootstrap notification permissions on app start
notificationService.bootstrap();

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <TimerProvider>
        <WorkoutProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </WorkoutProvider>
      </TimerProvider>
    </SafeAreaProvider>
  );
}

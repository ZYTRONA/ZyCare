import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store';

// New Screens
import LoginScreenNew from '../screens/auth/LoginScreenNew';
import PatientHome from '../screens/main/PatientHome';
import AIChat from '../screens/main/AIChat';
import DoctorDashboard from '../screens/main/DoctorDashboard';
import VideoCall from '../screens/main/VideoCall';

const Stack = createNativeStackNavigator();

export default function AppNavigatorNew() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreenNew} />
        ) : (
          <>
            {user?.role === 'doctor' ? (
              <>
                <Stack.Screen name="DoctorDashboard" component={DoctorDashboard} />
                <Stack.Screen name="VideoCall" component={VideoCall} />
              </>
            ) : (
              <>
                <Stack.Screen name="PatientHome" component={PatientHome} />
                <Stack.Screen name="AIChat" component={AIChat} />
                <Stack.Screen name="VideoCall" component={VideoCall} />
                <Stack.Screen name="DoctorQueue" component={DoctorDashboard} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

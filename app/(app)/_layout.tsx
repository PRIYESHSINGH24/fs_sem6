import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { withLayoutContext } from 'expo-router';

type StackParamList = {
  '(drawer)': undefined;
};

const NativeStack = createNativeStackNavigator<StackParamList>();
const ExpoRouterStack = withLayoutContext(NativeStack.Navigator);

export default function AppStackLayout() {
  return (
    <ExpoRouterStack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <ExpoRouterStack.Screen name="(drawer)" options={{ headerShown: false }} />
      <ExpoRouterStack.Screen
        name="post/[id]"
        options={{
          headerShown: true,
          title: 'Post Details',
          animation: 'slide_from_right',
        }}
      />
    </ExpoRouterStack>
  );
}

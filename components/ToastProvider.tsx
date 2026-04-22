import React from 'react';
import Toast from 'react-native-toast-message';

export function AppToast() {
  return <Toast />;
}

export function showToast(type: 'success' | 'error' | 'info', title: string, message?: string) {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'bottom',
    visibilityTime: 2800,
  });
}

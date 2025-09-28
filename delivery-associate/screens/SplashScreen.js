// SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import routes from '../constants/routes';
import { useAuth } from '../context/AuthContext';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      navigation.replace(user ? routes.MAIN : routes.LOGIN);
    }
  }, [loading, user]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <Text className="text-2xl font-bold text-green-600 mb-4">FarmFerry</Text>
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
}

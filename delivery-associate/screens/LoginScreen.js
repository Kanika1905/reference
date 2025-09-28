// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, Pressable, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, StatusBar } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import validatePhone from '../utils/validatePhone';
import routes from '../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import EnhancedHeader from '../components/EnhancedHeader';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, authLoading, error } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  // For static country code selector
  // const countryCode = '+91';
  // const flag = '🇮🇳';

  const handleLogin = async () => {
    if (!validatePhone(phone)) return alert('Invalid phone number');
    try {
      await login(phone, password);
      navigation.replace(routes.MAIN);
    } catch (e) {
      // Error is handled in context
    }
  };

  const handleSendOtp = async () => {
    setOtpMessage('');
    if (!validatePhone(phone)) {
      setOtpMessage('Please enter a valid phone number.');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/v1/auth/send-delivery-associate-otp', { phone });
      setOtpMessage('OTP sent successfully!');
      setTimeout(() => {
        navigation.navigate(routes.OTP, { phone });
      }, 700);
    } catch (err) {
      setOtpMessage(err?.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-b from-green-100 to-white justify-center">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      {/* <EnhancedHeader title="Login" showBackButton={false} /> */}
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-center items-center px-6"
        >
          {/* Illustration */}
          <View
            className="w-40 h-40 rounded-full items-center justify-center mb-6 mt-9 bg-green-200 border border-white/70 shadow-2xl relative overflow-hidden"
          >
            {/* Glassy highlight overlay */}
            <View
              className="absolute top-0 left-0 w-full h-full rounded-full bg-white/15 z-10"
            />
            <Image
              source={{ uri: 'https://i.pinimg.com/736x/b0/44/d7/b044d7324244e3c8e374474032544f8d.jpg' }}
              className="w-32 h-32 rounded-full mt-1 mb-1 z-20 shadow-md"
              resizeMode="contain"
            />
          </View>
          {/* App Title */}
          <Text className="text-2xl font-extrabold text-green-700 mb-1 text-center">VendorNest</Text>
          <Text className="text-2xl font-extrabold text-green-700 mb-7 text-center"> Delivery Associate</Text>
          {/* Card Container */}
          <View className="w-full bg-white rounded-2xl shadow-lg p-6 items-center" style={{ elevation: 6 }}>
            {error && <Text className="text-red-500 text-center mb-2">{error}</Text>}
            {/* Email/Phone Input with Icon */}
            <View className="flex-row items-center w-full bg-gray-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              <MaterialIcons name="person-outline" size={22} color="#22c55e" style={{ marginRight: 8 }} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                keyboardType="number"
                className="flex-1 text-base text-gray-800"
                style={{ outlineStyle: 'none' }}
                autoCapitalize="none"
              />
            </View>
            {/* Password Input with Icon */}
            <View className="flex-row items-center w-full bg-gray-50 border border-green-200 rounded-lg px-3 py-2 mb-4">
              <Ionicons name="lock-closed-outline" size={22} color="#22c55e" style={{ marginRight: 8 }} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                className="flex-1 text-base text-gray-800"
                style={{ outlineStyle: 'none' }}
                autoCapitalize="none"
              />
            </View>
            <Button
              title={authLoading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={authLoading}
              className="mt-2 bg-green-500 active:bg-green-600 shadow-md w-full rounded-lg py-3"
              textClassName="text-lg font-bold"
            />
            <Pressable onPress={handleSendOtp} className="mt-4 w-full">
              <Text className="text-center text-green-600 font-semibold">
                {otpLoading ? 'Sending OTP...' : 'Reset password'}
              </Text>
            </Pressable>
            {otpMessage ? (
              <Text className="text-center mt-2 text-sm text-green-700">{otpMessage}</Text>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </View>
  );
}
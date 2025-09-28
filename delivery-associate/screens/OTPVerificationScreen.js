import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StatusBar, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EnhancedHeader from '../components/EnhancedHeader';
import { advancedDeliveryAPI } from '../services/api';

export default function OTPVerificationScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const { orderId, customerPhone, customerName } = route.params || {};

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const handleSendOTP = async () => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID not available');
      return;
    }

    setIsSendingOTP(true);
    try {
      console.log('🔍 Debug - Order ID:', orderId);
      console.log('🔍 Debug - Customer Phone:', customerPhone);
      console.log('🔍 Debug - Customer Name:', customerName);

      if (otpSent) {
        // If OTP was already sent, use resend endpoint
        console.log('🔍 Debug - Using resend endpoint');
        const response = await advancedDeliveryAPI.resendDeliveryOTP(orderId);
        console.log('🔍 Debug - Resend response:', response);
      } else {
        // First time sending OTP, use generate endpoint
        console.log('🔍 Debug - Using generate endpoint');
        const response = await advancedDeliveryAPI.generateDeliveryOTP(orderId);
        console.log('🔍 Debug - Generate response:', response);
      }
      setOtpSent(true);
      setCountdown(300); // 5 minutes countdown
      Alert.alert('Success', otpSent ? 'OTP resent successfully to customer' : 'OTP sent successfully to customer');
    } catch (error) {
      console.error('❌ Error sending OTP:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });

      let errorMessage = 'Failed to send OTP. Please try again.';
      if (error.response?.status === 404) {
        errorMessage = 'Order not found or not assigned to you.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to send OTP for this order.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Order must be out for delivery to send OTP.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  // const handleVerifyOTP = async () => {
  //   if (!otp || otp.length !== 6) {
  //     Alert.alert('Error', 'Please enter a valid 6-digit OTP');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     // Verify OTP with backend
  //     await advancedDeliveryAPI.verifyDeliveryOTP(orderId, otp);

  //     Alert.alert(
  //       'Success', 
  //       'Order delivered successfully!',
  //       [
  //         {
  //           text: 'OK',
  //           onPress: () => nav.navigate('Orders')
  //         }
  //       ]
  //     );
  //   } catch (error) {
  //     console.error('Error verifying OTP:', error);
  //     Alert.alert('Error', 'Invalid OTP. Please check and try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  // Update the handleVerifyOTP function in OTPVerificationScreen.js
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Use the new endpoint that sends notifications
      const response = await advancedDeliveryAPI.verifyDeliveryOTPWithNotifications(orderId, otp);

      Alert.alert(
        'Success',
        'Order delivered successfully! Notifications sent to customer and yourself.',
        [
          {
            text: 'OK',
            onPress: () => nav.navigate('Orders')
          }
        ]
      );
    } catch (error) {
      console.error('Error verifying OTP:', error);

      let errorMessage = 'Invalid OTP. Please check and try again.';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.response?.status === 404) {
        errorMessage = 'Order not found.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Verify OTP" onBackPress={() => nav.goBack()} />

      <View className="flex-1 p-6">
        {/* Customer Info Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <MaterialCommunityIcons name="account" size={24} color="#8b5cf6" />
            <Text className="ml-3 text-lg font-bold text-gray-800">Customer Details</Text>
          </View>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="phone" size={20} color="#3b82f6" />
              <Text className="ml-3 text-gray-600">Phone:</Text>
              <Text className="ml-2 font-semibold text-gray-800">
                {formatPhoneNumber(customerPhone)}
              </Text>
            </View>

            {customerName && (
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="account-circle" size={20} color="#10b981" />
                <Text className="ml-3 text-gray-600">Name:</Text>
                <Text className="ml-2 font-semibold text-gray-800">{customerName}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Send OTP Section */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Send OTP to Customer</Text>

          <TouchableOpacity
            className={`rounded-xl py-4 flex-row items-center justify-center ${isSendingOTP || countdown > 0 ? 'bg-gray-300' : 'bg-blue-500'
              }`}
            onPress={handleSendOTP}
            disabled={isSendingOTP || countdown > 0}
          >
            {isSendingOTP ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialCommunityIcons name="message-text" size={20} color="white" />
            )}
            <Text className="ml-2 text-white font-semibold">
              {isSendingOTP ? 'Sending...' : countdown > 0 ? `Resend in ${formatCountdown(countdown)}` : (otpSent ? 'Resend OTP' : 'Send OTP')}
            </Text>
          </TouchableOpacity>

          {otpSent && (
            <View className="mt-4 p-3 bg-green-50 rounded-xl">
              <Text className="text-green-700 text-center">
                OTP sent successfully! Ask customer for the OTP.
              </Text>
              {countdown > 0 && (
                <Text className="text-green-600 text-center mt-2">
                  Resend available in: {formatCountdown(countdown)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* OTP Verification Section */}
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Enter Customer OTP</Text>

          <View className="mb-6">
            <Text className="text-gray-600 mb-2">Enter the 6-digit OTP provided by customer:</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-semibold text-center"
              placeholder="000000"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
              style={{ letterSpacing: 8 }}
            />
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 flex-row items-center justify-center ${isLoading || !otp || otp.length !== 6 ? 'bg-gray-300' : 'bg-emerald-500'
              }`}
            onPress={handleVerifyOTP}
            disabled={isLoading || !otp || otp.length !== 6}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialCommunityIcons name="check-circle" size={20} color="white" />
            )}
            <Text className="ml-2 text-white font-semibold">
              {isLoading ? 'Verifying...' : 'Verify & Mark Delivered'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View className="mt-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-blue-800 font-semibold mb-2">Instructions:</Text>
          <Text className="text-blue-700 text-sm">
            1. Click "Send OTP" to send verification code to customer{'\n'}
            2. Ask customer for the OTP they received{'\n'}
            3. Enter the OTP in the field above{'\n'}
            4. Click "Verify & Mark Delivered" to complete delivery
          </Text>
        </View>
      </View>
    </ScrollView>
  );
} 
import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StatusBar, ActivityIndicator, TextInput, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import jsQR from 'jsqr';
import api from '../utils/api';
import EnhancedHeader from '../components/EnhancedHeader';

export default function ProofUploadScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  // Handle QR code scan via image picker
  const handleScanQr = async () => {
    setError(null);
    setScanned(false);
    setQrData(null);
    setOtpSent(false);
    setOtp('');
    setImageUri(null);
    // Ask for camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera permission is required.');
      return;
    }
    // Launch camera
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      // Decode QR code from image
      try {
        const base64 = result.assets[0].base64;
        // Convert base64 to Uint8ClampedArray
        const raw = atob(base64);
        const rawLength = raw.length;
        const array = new Uint8ClampedArray(new ArrayBuffer(rawLength));
        for (let i = 0; i < rawLength; i++) {
          array[i] = raw.charCodeAt(i);
        }
        // jsQR expects a Uint8ClampedArray of pixel data, but we only have the base64 JPEG.
        // In Expo Go, we can't use canvas, so we need to use a helper API or a cloud function to decode the QR.
        // For now, show an error and explain to the user.
        setError('QR code decoding from image is not supported in Expo Go. Please use a custom dev client or ask the backend to support QR code data entry.');
        return;
        // If you have a backend endpoint to decode QR from base64, you could POST it there and get the QR data.
        // Example:
        // const { data } = await api.post('/decode-qr', { base64 });
        // setQrData(data.qrData);
        // setScanned(true);
      } catch (e) {
        setError('Failed to decode QR code from image.');
      }
    }
  };

  // Handle OTP request and verification as before
  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError(null);
    try {
      await api.post(`/advanced-delivery/qr/delivery/${orderId}`);
      setOtpSent(true);
      Alert.alert('OTP Sent', 'An OTP has been sent to the customer.');
    } catch (e) {
      setError('Failed to send OTP.');
    }
    setSendingOtp(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      await api.post(`/advanced-delivery/verify/delivery/${orderId}`, {
        otp,
        qrCodeData: qrData,
      });
      Alert.alert('Success', 'OTP verified and delivery proof submitted!');
      nav.goBack();
    } catch (e) {
      setError('OTP verification failed.');
    }
    setVerifying(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Delivery Proof (OTP)" onBackPress={() => nav.goBack()} />
      <View className="flex-1 p-6 items-center justify-center">
        {!scanned && (
          <>
            <Pressable onPress={handleScanQr} className="bg-emerald-500 rounded-lg px-6 py-3 mb-4">
              <Text className="text-white font-semibold">Scan QR Code</Text>
            </Pressable>
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 220, height: 220, borderRadius: 16, marginBottom: 16 }} />}
            {error && <Text className="text-red-500 mt-4">{error}</Text>}
          </>
        )}
        {imageUri && !error && !otpSent && (
          <Pressable onPress={handleSendOtp} className="bg-emerald-600 rounded-lg py-3 w-full mt-2" disabled={sendingOtp}>
            {sendingOtp ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Send OTP to Customer</Text>}
          </Pressable>
        )}
        {otpSent && (
          <>
            <Text className="mb-2 text-lg font-semibold text-emerald-700">Enter OTP from Customer</Text>
            <TextInput
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              className="bg-white border border-emerald-300 rounded-lg px-4 py-3 text-lg text-center tracking-widest mb-4"
              style={{ width: 180, letterSpacing: 8 }}
            />
            {error && <Text className="text-red-500 mb-2">{error}</Text>}
            <Pressable onPress={handleVerifyOtp} className="bg-emerald-600 rounded-lg py-3 w-full mt-2" disabled={verifying}>
              {verifying ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-semibold">Submit OTP</Text>}
            </Pressable>
            <Pressable onPress={() => { setScanned(false); setQrData(null); setOtpSent(false); setOtp(''); setImageUri(null); }} className="mt-4 px-6 py-2 bg-gray-200 rounded-lg">
              <Text className="text-emerald-700 font-semibold">Scan Again</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
} 
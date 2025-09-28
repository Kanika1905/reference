// OTPScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import OTPInput from '../components/OTPInput';
import Button from '../components/Button';
import routes from '../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import EnhancedHeader from '../components/EnhancedHeader';

export default function OTPScreen() {
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendActive, setResendActive] = useState(false);
  const navigation = useNavigation();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timer > 0) {
      intervalRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setResendActive(true);
    }
    return () => clearTimeout(intervalRef.current);
  }, [timer]);

  const handleVerify = () => {
    if (code.length === 6) {
      navigation.replace(routes.DASHBOARD);
    } else {
      alert('Enter valid OTP');
    }
  };

  const handleResend = () => {
    setTimer(30);
    setResendActive(false);
    // TODO: Trigger resend OTP API here
  };

  return (
    <LinearGradient
      colors={['#10b981', '#34d399', '#6ee7b7']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="OTP Verification" onBackPress={() => navigation.goBack()} />
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={require('../assets/icon.png')}
          style={{ width: 90, height: 90, marginBottom: 24, marginTop: 10 }}
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-center text-white mb-2">Enter OTP</Text>
        <Text className="text-base text-center text-emerald-100 mb-6">We have sent a 6-digit code to your registered mobile number.</Text>
        <View className="w-full items-center mb-4">
          <OTPInput value={code} onChange={setCode} inputClassName="bg-white text-emerald-600 border-emerald-300" />
        </View>
        <Button title="Verify" onPress={handleVerify} className="mt-2 w-full" />
        <View className="flex-row justify-center items-center mt-6">
          {resendActive ? (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-white underline font-semibold">Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-white">Resend in <Text className="font-bold">{timer}s</Text></Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EnhancedHeader from '../components/EnhancedHeader';

export default function ChangePasswordScreen({ navigation }) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword, user?.token);
      setSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Use navigation from prop or hook
  const nav = navigation || useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Change Password" onBackPress={() => nav.goBack()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center px-6 py-8">
            <View className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mt-8">
              <Text className="text-lg font-semibold text-emerald-800 mb-6 text-center">Update your password</Text>
              {/* Current Password */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Current Password</Text>
                <View className="flex-row items-center border border-emerald-200 rounded-lg px-3 bg-emerald-50">
                  <TextInput
                    className="flex-1 py-3 text-base text-gray-800"
                    placeholder="Enter current password"
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    <Ionicons name={showCurrent ? 'eye-off' : 'eye'} size={20} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* New Password */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2">New Password</Text>
                <View className="flex-row items-center border border-emerald-200 rounded-lg px-3 bg-emerald-50">
                  <TextInput
                    className="flex-1 py-3 text-base text-gray-800"
                    placeholder="Enter new password"
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    <Ionicons name={showNew ? 'eye-off' : 'eye'} size={20} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="text-gray-700 mb-2">Confirm New Password</Text>
                <View className="flex-row items-center border border-emerald-200 rounded-lg px-3 bg-emerald-50">
                  <TextInput
                    className="flex-1 py-3 text-base text-gray-800"
                    placeholder="Confirm new password"
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#10b981" />
                  </TouchableOpacity>
                </View>
              </View>
              {/* Error/Success Messages */}
              {error ? (
                <Text className="text-red-500 text-center mb-2">{error}</Text>
              ) : null}
              {success ? (
                <Text className="text-green-600 text-center mb-2">{success}</Text>
              ) : null}
              {/* Change Password Button */}
              <TouchableOpacity
                className={`bg-emerald-500 rounded-lg py-3 mt-2 shadow-md active:bg-emerald-600 ${loading ? 'opacity-50' : ''}`}
                activeOpacity={0.85}
                onPress={handleChangePassword}
                disabled={loading}
              >
                <Text className="text-white text-center text-base font-bold">
                  {loading ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 
// SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, TextInput, Modal, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import routes from '../constants/routes';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import EnhancedHeader from '../components/EnhancedHeader';

// TODO: Fetch settings options from backend API if available
// const settingsOptions = [...];
const settingsOptions = [
  {
    key: 'changePassword',
    label: 'Change Password',
    icon: '\ud83d\udd12', // lock emoji
    onPress: (navigation) => navigation?.navigate?.(routes.CHANGE_PASSWORD),
  },
  {
    key: 'help',
    label: 'Help & Support',
    icon: '\u2753',
    onPress: (navigation) => navigation?.navigate?.(routes.HELP),
  },
  // {
  //   key: 'proofUpload',
  //   label: 'Upload Proof',
  //   icon: '\uD83D\uDCF7', // camera emoji
  //   onPress: (navigation, showOrderIdModal) => showOrderIdModal('ProofUpload'),
  // },
];

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const nav = useNavigation();
  const [orderIdModalVisible, setOrderIdModalVisible] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderAction, setOrderAction] = useState('');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const showOrderIdModal = (action) => {
    setOrderAction(action);
    setOrderIdModalVisible(true);
  };

  const handleOrderIdSubmit = () => {
    setOrderIdModalVisible(false);
    if (orderId.trim()) {
      if (orderAction === 'Feedback') {
        nav.navigate('Feedback', { orderId });
      } else if (orderAction === 'ProofUpload') {
        nav.navigate('ProofUpload', { orderId });
      }
    }
    setOrderId('');
    setOrderAction('');
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Settings" onBackPress={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* User Info Card */}
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-green-100 items-center justify-center mb-2">
            <Text className="text-2xl font-bold text-green-600">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-lg font-semibold mb-1">{user?.name || 'User'}</Text>
          <Text className="text-gray-500 mb-1">{user?.phone || ''}</Text>
        </View>

        {/* Settings Options */}
        <View className="mb-6 bg-white rounded-xl shadow p-2 border border-gray-100">
          {settingsOptions.map((option) => (
            <View key={option.key} className="flex-row items-center justify-between px-2 py-3">
              <Pressable
                className="flex-row items-center flex-1"
                onPress={() => option.onPress(navigation, showOrderIdModal)}
              >
                <Text className="text-xl mr-4">{option.icon}</Text>
                <Text className="text-base font-medium text-gray-800">{option.label}</Text>
                <View className="flex-1 items-end pr-2">
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          className="bg-red-500 active:bg-red-600 p-3 rounded-lg items-center justify-center"
        >
          <Text className="text-base font-semibold text-white">Logout</Text>
        </Pressable>

        {/* Order ID Modal for Feedback/ProofUpload */}
        <Modal
          visible={orderIdModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setOrderIdModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, width: '80%' }}>
              <Text className="text-lg font-semibold mb-2">Enter Order ID</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2 mb-4"
                placeholder="Order ID"
                value={orderId}
                onChangeText={setOrderId}
                autoFocus
              />
              <View className="flex-row justify-end space-x-2">
                <Pressable onPress={() => setOrderIdModalVisible(false)} className="px-4 py-2 bg-gray-200 rounded-lg">
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleOrderIdSubmit} className="px-4 py-2 bg-emerald-600 rounded-lg">
                  <Text className="text-white">Go</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

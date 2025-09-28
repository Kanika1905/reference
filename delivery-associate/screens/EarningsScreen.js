// EarningsScreen.js
import React, { useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Modal, TextInput, ActivityIndicator, Alert, RefreshControl, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import formatDate from '../utils/formatDate';
import { useEarnings } from '../context/EarningsContext';
import { useState } from 'react';
import EnhancedHeader from '../components/EnhancedHeader';

export default function EarningsScreen() {
  const { earnings, allTimeEarnings, payoutRequests, loading, error, fetchEarnings, fetchAllTimeEarnings, fetchPayoutRequests, requestPayout } = useEarnings();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const nav = useNavigation();

  useEffect(() => {
    fetchEarnings();
    fetchAllTimeEarnings();
    fetchPayoutRequests();
  }, []);

  // Set default amount to weekly earnings when modal opens
  const openModal = () => {
    setAmount(earnings?.totalEarnings?.toFixed(2) || '');
    setSuccess(false);
    setModalVisible(true);
  };

  const handleRequestPayout = async () => {
    setPayoutLoading(true);
    setSuccess(false);
    try {
      await requestPayout(amount);
      setSuccess(true);
      setModalVisible(false);
      Alert.alert('Success', 'Payout request submitted!');
      fetchEarnings();
      fetchAllTimeEarnings();
      fetchPayoutRequests();
    } catch (e) {
      Alert.alert('Error', error || 'Failed to request payout');
    } finally {
      setPayoutLoading(false);
    }
  };

  const onRefresh = async () => {
    await fetchEarnings();
    await fetchAllTimeEarnings();
    await fetchPayoutRequests();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Earnings" onBackPress={() => nav.goBack()} />
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >
        <Card className="bg-green-100 border-l-4 border-green-500 mb-3">
          <Text className="text-lg font-bold text-green-700 mb-1">Total Earnings (All Time)</Text>
          <Text className="text-2xl font-extrabold text-green-700">
            ₹{allTimeEarnings?.toFixed(2) ?? '0.00'}
          </Text>
        </Card>
        <Card className="mb-3">
          <Text className="text-base font-semibold mb-2 text-green-700">Earnings This Week</Text>
          <Text className="text-xl font-bold text-green-600 mb-2">
            ₹{earnings?.totalEarnings?.toFixed(2) ?? '0.00'}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">Breakdown by day:</Text>
          <FlatList
            data={earnings?.earningsByDay || []}
            keyExtractor={item => item.date}
            renderItem={({ item }) => (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-700">{formatDate(item.date)}</Text>
                <Text className="text-green-700 font-semibold">₹{item.amount.toFixed(2)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center">No earnings data.</Text>}
            scrollEnabled={false}
          />
        </Card>
        <Card className="mb-3">
          <Text className="text-base font-semibold mb-2 text-green-700">Payout Requests</Text>
          <FlatList
            data={[...(payoutRequests || [])].reverse()}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => (
              <View className="flex-row justify-between py-1 items-center">
                <View>
                  <Text className="font-semibold text-gray-800">₹{item.amount.toFixed(2)}</Text>
                  <Text className="text-xs text-gray-500">{formatDate(item.requestedAt)}</Text>
                </View>
                <Text className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  item.status === 'approved' ? 'bg-green-100 text-green-700' :
                  item.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center">No payout requests yet.</Text>}
            scrollEnabled={false}
          />
        </Card>
        <Button title="Request Payout" onPress={openModal} className="mt-2" />
        {error ? <Text className="text-red-500 mt-2 text-center">{error}</Text> : null}
      </ScrollView>
      {/* Payout Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-40">
          <View className="bg-white p-6 rounded-lg w-80">
            <Text className="text-lg font-bold mb-2">Request Payout</Text>
            <Text className="mb-2 text-gray-600">Enter amount to payout:</Text>
            <TextInput
              className="border border-gray-300 rounded px-3 py-2 mb-3"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={!payoutLoading}
            />
            {payoutLoading ? (
              <ActivityIndicator color="#22c55e" />
            ) : (
              <Button title="Submit Request" onPress={handleRequestPayout} />
            )}
            <Button title="Cancel" onPress={() => setModalVisible(false)} className="mt-2 bg-red-500" textClassName="text-white" />
            {success ? <Text className="text-green-600 mt-2">Request submitted!</Text> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

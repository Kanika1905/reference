import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StatusBar } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import EnhancedHeader from '../components/EnhancedHeader';

export default function FeedbackScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      await api.post(`/delivery-associates/orders/${orderId}/feedback`, { feedback });
      Alert.alert('Feedback', 'Thank you for your feedback!');
      setFeedback('');
      nav.goBack();
    } catch {
      Alert.alert('Error', 'Failed to submit feedback.');
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Order Feedback" onBackPress={() => nav.goBack()} />
      <View className="flex-1 p-6">
        <Text className="text-lg font-semibold text-gray-700 mb-2">How was your delivery experience?</Text>
        <TextInput
          className="bg-white rounded-lg p-3 mb-4 border border-gray-200"
          placeholder="Write your feedback..."
          value={feedback}
          onChangeText={setFeedback}
          multiline
        />
        <Pressable onPress={handleSubmit} className="bg-emerald-600 rounded-lg py-3" disabled={loading}>
          <Text className="text-white text-center font-semibold">Submit Feedback</Text>
        </Pressable>
      </View>
    </View>
  );
} 
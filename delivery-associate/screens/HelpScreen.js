import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import EnhancedHeader from '../components/EnhancedHeader';
import api from '../utils/api';

// TODO: Fetch help topics from backend API instead of using static array
// const helpTopics = [...];
// Example: useEffect(() => { fetchHelpTopics().then(setHelpTopics) }, [])

export default function HelpScreen() {
  const nav = useNavigation();
  const [helpTopics, setHelpTopics] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHelpTopics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/help'); // Adjust endpoint if needed
        setHelpTopics(data.data.topics || []);
      } catch (e) {
        setError('Failed to load help topics.');
        setHelpTopics([]);
      }
      setLoading(false);
    };
    fetchHelpTopics();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <EnhancedHeader title="Help & Support" onBackPress={() => nav.goBack()} />
        <Text className="text-gray-600 mt-4">Loading help topics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#10b981" />
        <EnhancedHeader title="Help & Support" onBackPress={() => nav.goBack()} />
        <Text className="text-red-500 mt-4">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Help & Support" onBackPress={() => nav.goBack()} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-lg font-semibold text-gray-700 mb-4">How can we help you?</Text>
        {helpTopics.map((topic, idx) => (
          <View key={idx} className="mb-3 bg-white rounded-lg shadow p-4">
            <Pressable onPress={() => setExpandedIndex(expandedIndex === idx ? null : idx)}>
              <Text className="text-base font-medium text-green-700">{topic.question}</Text>
            </Pressable>
            {expandedIndex === idx && (
              <Text className="text-gray-600 mt-2">{topic.answer}</Text>
            )}
          </View>
        ))}
        <Text className="text-gray-400 mt-6 text-center">For urgent issues, contact <Text className="text-green-700">support@example.com</Text>.</Text>
      </ScrollView>
    </View>
  );
} 
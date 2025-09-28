// Tabs.js
import React from 'react';
import { View, Pressable, Text } from 'react-native';

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <View className="flex-row mb-4 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`flex-1 pb-2 ${isActive ? 'border-b-2 border-green-500' : ''}`}
          >
            <Text className={`text-center ${isActive ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>{
              tab.title
            }</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

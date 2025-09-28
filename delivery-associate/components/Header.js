// Header.js
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function Header({ title, left, right }) {
  return (
    <View className="bg-green-600 rounded-b-md shadow-sm px-6 pt-12 pb-5 flex-row items-center justify-between mb-3">
      <View className="flex-row items-center" style={{ alignItems: 'center' }}>
        {left}
        {title === 'Dashboard' && (
          <Image source={require('../assets/Icon.jpeg')} style={{ width: 28, height: 28, borderRadius: 6, marginRight: 10, backgroundColor: '#fff' }} />
        )}
        <Text className="text-white text-2xl font-bold tracking-wide" style={{ marginLeft: left ? 0 : 0 }}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

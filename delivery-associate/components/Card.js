// Card.js
import React from 'react';
import { View } from 'react-native';

export default function Card({ children, className = '' }) {
  return (
    <View className={`bg-white rounded-lg shadow-md p-4 mb-3 ${className}`}>{children}</View>
  );
}

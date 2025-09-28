// Button.js
import React from 'react';
import { Pressable, Text } from 'react-native';

export default function Button({ title, onPress, className = '', style = {}, textClassName = '', textStyle = {} }) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-green-500 active:bg-green-600 px-4 py-3 rounded-lg ${className}`}
      style={style}
    >
      <Text className={`text-white text-center font-semibold ${textClassName}`} style={textStyle}>{title}</Text>
    </Pressable>
  );
}

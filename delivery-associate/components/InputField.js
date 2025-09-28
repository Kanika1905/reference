// InputField.js
import React from 'react';
import { TextInput } from 'react-native';

export default function InputField({ value, onChangeText, placeholder, secure = false, className = '' }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secure}
      className={`border border-gray-300 rounded-lg px-4 py-3 mb-3 ${className}`}
    />
  );
}

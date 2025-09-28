// OTPInput.js
import React, { useRef } from 'react';
import { View, TextInput } from 'react-native';

export default function OTPInput({ value = '', onChange }) {
  const inputs = Array(6)
    .fill(0)
    .map(() => useRef());

  const handleChange = (text, idx) => {
    const newValue = value.split('');
    newValue[idx] = text;
    onChange(newValue.join('').slice(0, 6));
    if (text && idx < 5) {
      inputs[idx + 1].current.focus();
    }
  };

  return (
    <View className="flex-row justify-between mb-4">
      {Array(6)
        .fill(0)
        .map((_, idx) => (
          <TextInput
            key={idx}
            ref={inputs[idx]}
            className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg"
            keyboardType="number-pad"
            maxLength={1}
            value={value[idx] || ''}
            onChangeText={(t) => handleChange(t, idx)}
          />
        ))}
    </View>
  );
}

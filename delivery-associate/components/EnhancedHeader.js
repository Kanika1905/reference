import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Animated, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Slightly reduced header height
export default function EnhancedHeader({ title, onBackPress, showBackButton = true }) {
  const [headerAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: headerAnimation,
        transform: [{
          translateY: headerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-40, 0], // slightly less slide
          })
        }]
      }}
    >
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: (StatusBar.currentHeight || 44), // slightly increased
          paddingBottom: 15, // slightly increased
          paddingHorizontal: 20,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 12,
        }}
      >
        <View className="flex-row items-center justify-between">
          {showBackButton && (
            <Pressable
              onPress={onBackPress}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4 mt-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
          )}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-white mb-1 mt-4">{title}</Text>
            {/* Removed 'Secure document verification' subtitle */}
          </View>
          {/* Removed verification icon */}
        </View>
      </LinearGradient>
    </Animated.View>
  );
} 
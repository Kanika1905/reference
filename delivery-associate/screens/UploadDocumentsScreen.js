import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Pressable, ScrollView, Animated, Dimensions, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DocumentUpload from '../components/DocumentUpload';
import EnhancedHeader from '../components/EnhancedHeader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Information Card Component
function InfoCard({ icon, title, description, color = '#10b981' }) {
  const [cardAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(cardAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: cardAnimation,
        transform: [{
          translateY: cardAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          })
        }]
      }}
      className="bg-white rounded-2xl p-5 mb-4 shadow-lg border border-emerald-50"
    >
      <View className="flex-row items-start">
        <View 
          className="rounded-full p-3 mr-4"
          style={{ backgroundColor: `${color}20` }}
        >
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-bold text-slate-800 mb-2">{title}</Text>
          <Text className="text-slate-600 leading-6">{description}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

// Progress Indicator Component
function ProgressIndicator({ currentStep = 1, totalSteps = 3 }) {
  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-emerald-50">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-bold text-slate-800">Verification Progress</Text>
        <Text className="text-emerald-600 font-semibold">{currentStep}/{totalSteps}</Text>
      </View>
      
      <View className="flex-row items-center">
        {Array.from({ length: totalSteps }, (_, index) => (
          <React.Fragment key={index}>
            <View
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStep
                  ? 'bg-emerald-500'
                  : index === currentStep
                  ? 'bg-emerald-200 border-2 border-emerald-500'
                  : 'bg-slate-200'
              }`}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="white" />
              ) : (
                <Text className={`font-bold ${
                  index === currentStep ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {index + 1}
                </Text>
              )}
            </View>
            
            {index < totalSteps - 1 && (
              <View
                className={`flex-1 h-1 mx-2 ${
                  index < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      
      <View className="mt-4">
        <Text className="text-slate-600 text-sm">
          {currentStep === 1 && "Upload your identification documents"}
          {currentStep === 2 && "Documents under review"}
          {currentStep === 3 && "Verification complete"}
        </Text>
      </View>
    </View>
  );
}

// Security Badge Component
function SecurityBadge() {
  return (
    <View className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 mb-6">
      <View className="flex-row items-center">
        <View className="bg-white/20 rounded-full p-3 mr-4">
          <Ionicons name="lock-closed" size={24} color="white" />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg mb-1">Secure Upload</Text>
          <Text className="text-emerald-100 text-sm leading-5">
            Your documents are encrypted and stored securely. We follow industry-standard security protocols.
          </Text>
        </View>
      </View>
    </View>
  );
}

// Enhanced Main Component
export default function UploadDocumentsScreen() {
  const navigation = useNavigation();
  const [contentAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(contentAnimation, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      
      {/* Enhanced Header */}
      <EnhancedHeader
        title="Upload Documents"
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      {/* Main Content */}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Animated.View
          style={{
            opacity: contentAnimation,
            transform: [{
              translateY: contentAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              })
            }]
          }}
          className="px-5 py-6"
        >
          {/* Progress Indicator */}
          {/* <ProgressIndicator currentStep={1} totalSteps={3} /> */}

          {/* Security Badge */}
          {/* <SecurityBadge /> */}

          {/* Information Cards */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-slate-800 mb-4">Required Documents</Text>
            
            <InfoCard
              icon="card-outline"
              title="Identity Proof"
              description="Upload a clear photo of your government-issued ID card, passport, or driver's license."
              color="#10b981"
            />
            
            <InfoCard
              icon="location-outline"
              title="Address Proof"
              description="Provide a recent utility bill, bank statement, or rental agreement as address verification."
              color="#0891b2"
            />
            
            <InfoCard
              icon="car-outline"
              title="Vehicle Documents"
              description="Upload your vehicle registration, insurance, and driver's license for delivery verification."
              color="#7c3aed"
            />
          </View>


          {/* Document Upload Component */}
          <View className="bg-white rounded-2xl shadow-lg border border-emerald-50 overflow-hidden">
            <LinearGradient
              colors={['#f0fdf4', '#dcfce7']}
              style={{ padding: 20, paddingBottom: 0 }}
            >
              <View className="flex-row items-center mb-4">
                <View className="bg-emerald-500 rounded-full p-3 mr-4">
                  <Ionicons name="cloud-upload" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-bold text-slate-800">Upload Center</Text>
                  <Text className="text-slate-600">Drag and drop or browse files</Text>
                </View>
              </View>
            </LinearGradient>
            
            <View className="p-6 pt-0">
              <DocumentUpload />
            </View>
          </View>

          {/* Support Contact */}
          <View className="bg-slate-50 rounded-2xl p-6 mt-6 border border-slate-200">
            <View className="flex-row items-center mb-3">
              <View className="bg-slate-200 rounded-full p-3 mr-4">
                <Ionicons name="help-circle" size={24} color="#64748b" />
              </View>
              <Text className="text-lg font-bold text-slate-800">Need Help?</Text>
            </View>
            
            <Text className="text-slate-600 mb-4 leading-6">
              Having trouble uploading documents? Our support team is here to help you through the verification process.
            </Text>
            
            <Pressable
              className="bg-emerald-500 rounded-xl py-3 px-6 flex-row items-center justify-center"
              onPress={() => {/* Handle support contact */}}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              <Text className="text-white font-bold ml-2">Contact Support</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Modal, Pressable, Animated, TouchableWithoutFeedback, Image, TextInput, RefreshControl, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import DocumentUpload from '../components/DocumentUpload';
import { BlurView } from 'expo-blur';
import api from '../utils/api';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import EnhancedHeader from '../components/EnhancedHeader';

// Local Button component
function Button({ title, onPress, className = '', style = {}, textClassName = '', textStyle = {} }) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-3 rounded-lg bg-green-500 active:bg-green-600 ${className}`}
      style={style}
    >
      <Text className={`text-white text-center font-semibold ${textClassName}`} style={textStyle}>{title}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', vehicle: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [buttonScale] = useState(new Animated.Value(1));
  const [refreshing, setRefreshing] = useState(false);
  const nav = useNavigation();

  // Helper for avatar gradient background
  const avatarColors = [
    '#34d399', // emerald-400
    '#059669', // emerald-600
  ];

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    nav.navigate('UploadDocuments');
  };

  const fetchProfile = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/delivery-associates/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const profileData = res.data.data.deliveryAssociate;
      setProfile(profileData);
      setEditForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        vehicle: profileData.vehicle?.type || '',
      });
    } catch (e) {
      setError('Failed to load profile');
      setProfile(null);
    }
    setLoading(false);
  }, [user?.token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  // Edit profile submit handler
  const handleEditProfile = async () => {
    setEditLoading(true);
    setEditError(null);
    try {
      await api.put('/delivery-associates/profile', editForm, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await fetchProfile();
      setShowEdit(false);
    } catch (e) {
      setEditError('Failed to update profile');
    }
    setEditLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          nav.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      },
    ]);
  };

  if (!user || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-lg text-emerald-700">Loading profile...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-lg text-red-500">{error}</Text>
      </View>
    );
  }
  if (!profile) return null;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      {/* <EnhancedHeader title="Profile" onBackPress={() => nav.goBack()} /> */}
      <ScrollView
        className="flex-1 bg-emerald-50"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
      >
        {/* Header with gradient background */}
        <View className="bg-gradient-to-b from-emerald-500 to-emerald-600 pt-12 pb-8 px-6 rounded-b-3xl shadow-lg">
          <View className="items-center relative">
            {/* Edit Profile Button */}
            <Pressable
              onPress={() => setShowEdit(true)}
              className="absolute right-0 top-0 p-2 bg-white rounded-full shadow"
              style={{ zIndex: 10 }}
            >
              <Text className="text-emerald-600 text-lg font-bold">✎</Text>
            </Pressable>
            {/* Avatar with gradient or image */}
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: 16,
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* If profile.image exists, show image, else show initial with gradient */}
              {profile.profileImage?.url ? (
                <Image source={{ uri: profile.profileImage.url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#d1fae5',
                  background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                }}>
                  <Text className="text-emerald-600 text-4xl font-extrabold">
                    {profile.name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <Text className="text-2xl font-bold text-green-700 tracking-wide">{profile.name}</Text>
            <View className={`mt-2 px-3 py-1 rounded-full ${profile.isVerified ? 'bg-emerald-200' : 'bg-amber-200'}`}
              style={{ minWidth: 120, alignItems: 'center' }}>
              <Text className={`text-xs font-semibold ${profile.isVerified ? 'text-emerald-800' : 'text-amber-800'}`}
                style={{ letterSpacing: 1 }}>
                {profile.isVerified ? '✓ Verified' : 'Pending Verification'}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View className="px-6 py-6 -mt-6">
          {/* Profile Details Card */}
          <Card className="mb-6 bg-white rounded-xl shadow-lg border border-emerald-100 min-h-[220px]">
            <View className="p-5">
              {/* Header with decorative element */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  {/* <View className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <Text className="text-emerald-600 text-lg">👤</Text>
                  </View> */}
                  <Text className="text-xl font-bold text-emerald-800">Profile Details</Text>
                </View>
                <View className="bg-emerald-50 p-2 rounded-full">
                  <Text className="text-emerald-500">📝</Text>
                </View>
              </View>

              {/* Decorative divider */}
              <View className="border-b border-emerald-50 mb-4" />

              {/* Content with increased spacing */}
              <View className="space-y-5">
                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <View className="bg-emerald-50 p-2 rounded-lg mr-3">
                      <Text className="text-emerald-500">👤</Text>
                    </View>
                    <Text className="text-emerald-600 font-medium">Full Name</Text>
                  </View>
                  <Text className="text-gray-800 font-medium text-base">{profile.name}</Text>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <View className="bg-emerald-50 p-2 rounded-lg mr-3">
                      <Text className="text-emerald-500">📱</Text>
                    </View>
                    <Text className="text-emerald-600 font-medium">Phone</Text>
                  </View>
                  <Text className="text-gray-800 font-medium text-base">{profile.phone}</Text>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <View className="bg-emerald-50 p-2 rounded-lg mr-3">
                      <Text className="text-emerald-500">✉️</Text>
                    </View>
                    <Text className="text-emerald-600 font-medium">Email</Text>
                  </View>
                  <Text className="text-gray-800 font-medium text-base">{profile.email}</Text>
                </View>

                <View className="flex-row justify-between items-center py-1">
                  <View className="flex-row items-center">
                    <View className="bg-emerald-50 p-2 rounded-lg mr-3">
                      <Text className="text-emerald-500">🚗</Text>
                    </View>
                    <Text className="text-emerald-600 font-medium">Vehicle</Text>
                  </View>
                  <Text className="text-gray-800 font-medium text-base">{profile.vehicle?.type || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Verification Status */}
          <View style={{
            backgroundColor: profile.isVerified ? '#d1fae5' : '#fef3c7',
            borderRadius: 18,
            borderWidth: 1,
            borderColor: profile.isVerified ? '#a7f3d0' : '#fde68a',
            marginBottom: 32,
            padding: 12,
            shadowColor: profile.isVerified ? '#059669' : '#f59e42',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 6,
            elevation: 3,
          }}>
            <View className="flex-row items-start">
              <View style={{
                backgroundColor: profile.isVerified ? '#a7f3d0' : '#fde68a',
                padding: 10,
                borderRadius: 999,
                marginRight: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 20 }}>
                  {profile.isVerified ? '✅' : '⚠️'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold mb-1 ${profile.isVerified ? 'text-emerald-800' : 'text-amber-800'}`}
                  style={{ letterSpacing: 0.5 }}>
                  {profile.isVerified ? 'Account Verified' : 'Verification Required'}
                </Text>
                <Text className={`text-sm ${profile.isVerified ? 'text-emerald-700' : 'text-amber-700'}`}
                  style={{ lineHeight: 20 }}>
                  {profile.isVerified
                    ? 'Your account has been successfully verified.'
                    : 'Please upload required documents to complete your verification process.'}
                </Text>
              </View>
            </View>
          </View>

          {/* Upload Button with animation */}
          <TouchableWithoutFeedback
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.View style={{
              transform: [{ scale: buttonScale }],
              marginBottom: 8,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
              elevation: 6,
            }}>
              <Button
                title={profile.isVerified ? "Update Documents" : "Upload Verification Documents"}
                onPress={() => nav.navigate('UploadDocuments')}
                className={`py-4 rounded-xl ${profile.isVerified ? 'bg-emerald-100 border border-emerald-300' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'}`}
                textClassName={`text-center font-bold ${profile.isVerified ? 'text-emerald-700' : 'text-white'}`}
              />
            </Animated.View>
          </TouchableWithoutFeedback>
          {/* Logout Button with animation and same style as Upload Button */}
          <TouchableWithoutFeedback
            onPressIn={handleButtonPressIn}
            onPressOut={() => {
              handleButtonPressOut();
              handleLogout();
            }}
          >
            <Animated.View style={{
              transform: [{ scale: buttonScale }],
              marginBottom: 8,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
              elevation: 6,
            }}>
              <Button
                title={
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-center font-bold text-white">Logout</Text>
                  </View>
                }
                onPress={handleLogout}
                className="py-4 rounded-xl bg-red-500 active:bg-red-600"
                textClassName=""
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
        {/* Logout Button */}
        {/* The original Logout button is removed as per the edit hint to use the new Button component and animation */}
      </ScrollView>

      {/* Completely Redesigned Document Upload Modal */}
      {/* Edit Profile Modal */}
      <Modal
        visible={showEdit}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEdit(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(16, 185, 129, 0.13)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '92%', maxWidth: 350, backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#047857' }}>Edit Profile</Text>
            </View>
            {/* Add horizontal scroll to the edit profile modal content */}
            <ScrollView horizontal={true} contentContainerStyle={{ flexGrow: 1 }}>
              {/* Form Fields */}
              <View style={{ width: 300 }}>
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: '#334155', fontWeight: '600', marginBottom: 4 }}>Full Name</Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={v => setEditForm(f => ({ ...f, name: v }))}
                    placeholder="Full Name"
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, color: '#222' }}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View style={{ marginBottom: 14 }}>
                  <Text style={{ color: '#334155', fontWeight: '600', marginBottom: 4 }}>Phone</Text>
                  <TextInput
                    value={editForm.phone}
                    onChangeText={v => setEditForm(f => ({ ...f, phone: v }))}
                    placeholder="Phone"
                    keyboardType="phone-pad"
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, color: '#222' }}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
                <View className="mb-4">
                  <Text className="text-gray-700 mb-2">Vehicle Type</Text>
                  <View className="border border-emerald-200 rounded-lg bg-emerald-50" style={{ minHeight: 70, justifyContent: 'center' }}>
                    <Picker
                      selectedValue={editForm.vehicle}
                      onValueChange={v => setEditForm(f => ({ ...f, vehicle: v }))}
                      style={{ height: 49 }}
                    >
                      <Picker.Item label="Select vehicle type" value="" />
                      <Picker.Item label="Bicycle" value="bicycle" />
                      <Picker.Item label="Motorcycle" value="motorcycle" />
                      <Picker.Item label="Car" value="car" />
                      <Picker.Item label="Van" value="van" />
                      <Picker.Item label="Truck" value="truck" />
                      <Picker.Item label="Other" value="other" />
                    </Picker>
                  </View>
                </View>
                {editError && <Text style={{ color: '#ef4444', marginBottom: 10, textAlign: 'center' }}>{editError}</Text>}
                {/* Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowEdit(false)}
                    className="bg-red-500"
                    textClassName="text-white"
                    style={{ marginRight: 10, borderRadius: 8, minWidth: 90 }}
                    textStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Button
                    title={editLoading ? 'Saving...' : 'Save'}
                    onPress={handleEditProfile}
                    disabled={editLoading}
                    className="bg-emerald-500"
                    textClassName="text-white"
                    style={{ borderRadius: 8, minWidth: 90, opacity: editLoading ? 0.7 : 1 }}
                    textStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
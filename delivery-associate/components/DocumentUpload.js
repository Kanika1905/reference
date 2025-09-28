import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import CONFIG from '../constants/config';

const DOCUMENT_TYPES = [
  { key: 'id_proof', label: 'ID Proof' },
  { key: 'driving_license', label: 'Driving License' },
  { key: 'vehicle_registration', label: 'Vehicle Registration' },
];

export default function DocumentUpload({ onClose }) {
  const { user } = useAuth();
  const [type, setType] = useState(DOCUMENT_TYPES[0].key);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const uploadDocument = async () => {
    if (!image) return Alert.alert('Select a document image');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('documentType', type);
      formData.append('document', {
        uri: image.uri,
        name: 'document.jpg',
        type: 'image/jpeg',
      });
      const res = await fetch(`${CONFIG.API_BASE_URL}/delivery-associates/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
        body: formData,
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error('Upload failed', res.status, errText);
        throw new Error(errText || `Upload failed (${res.status})`);
      }
      Alert.alert('Success', 'Document uploaded!');
      setImage(null);
      if (onClose) onClose();
    } catch (e) {
      console.error('Document upload error:', e);
      Alert.alert('Error', e.message || 'Upload failed');
    }
    setUploading(false);
  };

  return (
    <View>
      <Text className="text-xl font-bold mb-4">Upload Document</Text>
      <Text className="mb-2">Select Document Type:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
        {DOCUMENT_TYPES.map((dt) => (
          <Pressable
            key={dt.key}
            onPress={() => setType(dt.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 10,
              borderRadius: 999,
              backgroundColor: type === dt.key ? '#10b981' : '#f1f5f9',
              borderWidth: type === dt.key ? 0 : 1,
              borderColor: type === dt.key ? '#10b981' : '#e5e7eb',
              shadowColor: type === dt.key ? '#10b981' : 'transparent',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: type === dt.key ? 0.12 : 0,
              shadowRadius: 4,
              elevation: type === dt.key ? 2 : 0,
            }}
          >
            <Text style={{ color: type === dt.key ? '#fff' : '#334155', fontWeight: '600', fontSize: 15 }}>{dt.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Button 
        title={image ? 'Change Image' : 'Pick Image'} 
        onPress={pickImage} 
        style={{
          borderRadius: 14,
          backgroundColor: '#059669',
          shadowColor: '#059669',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.13,
          shadowRadius: 6,
          elevation: 2,
          marginBottom: 14,
        }}
        textClassName="font-bold text-base text-white"
      />
      {image && (
        <Image source={{ uri: image.uri }} style={{ width: 120, height: 120, marginVertical: 12, borderRadius: 12, alignSelf: 'center', borderWidth: 1, borderColor: '#e5e7eb' }} />
      )}
      <Button 
        title={uploading ? 'Uploading...' : 'Upload'} 
        onPress={uploadDocument} 
        disabled={uploading} 
        style={{
          borderRadius: 14,
          backgroundColor: uploading ? '#a7f3d0' : '#10b981',
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.13,
          shadowRadius: 6,
          elevation: 2,
          marginBottom: 14,
        }}
        textClassName={`font-bold text-base ${uploading ? 'text-emerald-800' : 'text-white'}`}
      />
      {uploading && <ActivityIndicator className="mt-2" />}
    </View>
  );
} 
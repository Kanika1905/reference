// import React, { useEffect, useState } from 'react';
// import { View, Text, Pressable, TouchableOpacity, FlatList, RefreshControl, StatusBar } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import api from '../utils/api';
// import { useAuth } from '../context/AuthContext';
// import EnhancedHeader from '../components/EnhancedHeader';

// export default function NotificationsScreen() {
//   const nav = useNavigation();
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchNotifications = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/notifications', {
//         headers: { Authorization: `Bearer ${user?.token}` },
//       });
//       setNotifications(res.data.data.notifications || []);
//     } catch {
//       setNotifications([]);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchNotifications();
//     setRefreshing(false);
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       <StatusBar barStyle="light-content" backgroundColor="#10b981" />
//       <EnhancedHeader title="Notifications" onBackPress={() => nav.goBack()} />
//       <FlatList
//         data={notifications}
//         keyExtractor={item => item._id}
//         renderItem={({ item }) => (
//           <View className="bg-white rounded-lg shadow p-4 m-3">
//             <Text className="font-semibold text-green-700 mb-1">{item.title}</Text>
//             <Text className="text-gray-700 mb-1">{item.message}</Text>
//             <Text className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</Text>
//           </View>
//         )}
//         ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No notifications yet.</Text>}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//         contentContainerStyle={{ paddingBottom: 24 }}
//       />
//     </View>
//   );
// } 


// NotificationsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, StatusBar, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import EnhancedHeader from '../components/EnhancedHeader';

export default function NotificationsScreen() {
  const nav = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      // The backend returns { notifications: [...] } directly
      const notificationsData = res.data.notifications || [];
      
      console.log('Notifications:', notificationsData);
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="mt-2 text-gray-600">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="Notifications" onBackPress={() => nav.goBack()} />
      
      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => markAsRead(item._id)}
            className={`bg-white rounded-lg p-4 m-3 border-l-4 ${!item.isRead ? 'border-green-500' : 'border-gray-300'}`}
          >
            <View className="flex-row justify-between items-start">
              <Text className="font-semibold text-green-700 mb-1 flex-1">
                {item.title || 'New Notification'}
              </Text>
              {!item.isRead && (
                <View className="bg-green-500 rounded-full w-3 h-3 ml-2 mt-1" />
              )}
            </View>
            
            <Text className="text-gray-700 mb-2">
              {item.message || 'You have a new notification'}
            </Text>
            
            {/* Display the notification body if available */}
            {item.body && (
              <View className="bg-gray-50 p-3 rounded-md mb-2">
                <Text className="text-sm text-gray-600">
                  {item.body}
                </Text>
              </View>
            )}
            
            <Text className="text-xs text-gray-400">
              {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Ionicons name="notifications-off-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-400 mt-2">No notifications yet</Text>
          </View>
        }
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#10b981']}
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
// DashboardScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, ActivityIndicator, Image, Switch, Alert, TouchableOpacity, Linking, Platform, TextInput, StatusBar, AppState } from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Button from '../components/Button';
import Tabs from '../components/Tabs';
import useOrders from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import formatDate from '../utils/formatDate';
import * as Location from 'expo-location';
import routes from '../constants/routes';
import EnhancedHeader from '../components/EnhancedHeader';
import Icon1 from '../assets/Icon2.jpeg';
import { LinearGradient } from 'expo-linear-gradient';

const TABS = [
  // { key: 'overview', title: 'Overview' },
  // { key: 'earnings', title: 'Earnings' },
  // { key: 'orders', title: 'Orders' },
];

const ICONS = {
  earnings: '💸',
  completed: '✅',
  failed: '❌',
  order: '📦',
};

const DEFAULT_AVATAR = require('../assets/Icon.jpeg');

export default function DashboardScreen({ navigation }) {
  const nav = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || {};
  const { user, loading: userLoading } = useAuth();
  const { orders, loading: ordersLoading, fetchOrders } = useOrders();
  const [activeTab, setActiveTab] = useState('overview');
  const [earnings, setEarnings] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [online, setOnline] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [currentDeliveries, setCurrentDeliveries] = useState([]);
  const [currentDeliveriesLoading, setCurrentDeliveriesLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, completedToday: 0, earningsToday: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);

  const [appState, setAppState] = useState(AppState.currentState);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(new Date());

  // Fetch profile info
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setProfileLoading(true);
    try {
      const { data } = await api.get('/delivery-associates/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProfile(data.data.deliveryAssociate);
      setOnline(data.data.deliveryAssociate.isOnline);
    } catch (e) {
      setProfile(null);
    }
    setProfileLoading(false);
  }, [user]);

  // Toggle online/offline status
  // const toggleOnline = async () => {
  //   if (!user) return;
  //   setStatusUpdating(true);
  //   try {
  //     const { data } = await api.put('/delivery-associates/status', { isOnline: !online }, {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });
  //     setOnline(data.data.isOnline);
  //     Alert.alert('Status Updated', `You are now ${data.data.isOnline ? 'Online' : 'Offline'}`);
  //   } catch (e) {
  //     Alert.alert('Error', 'Failed to update status');
  //   }
  //   setStatusUpdating(false);
  // };

  // Fetch earnings
  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    setEarningsLoading(true);
    try {
      const { data } = await api.get('/delivery-associates/earnings?period=weekly', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEarnings(data.data);
    } catch (e) {
      setEarnings(null);
    }
    setEarningsLoading(false);
  }, [user]);

  // Fetch current deliveries (assigned, picked_up - excluding out_for_delivery and delivered)
  const fetchCurrentDeliveries = useCallback(async () => {
    if (!user) return;
    setCurrentDeliveriesLoading(true);
    try {
      const { data } = await api.get('/delivery-associates/orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      // Filter to show only assigned and picked_up orders - out_for_delivery orders go to My Orders tab
      const activeDeliveries = data.data.orders.filter(order => {
        const status = order.deliveryAssociate?.status || order.status;
        return status === 'assigned' || status === 'packaging';
      });

      // Sort by creation date (newest first)
      const sortedDeliveries = activeDeliveries.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.assignedAt || 0);
        const dateB = new Date(b.createdAt || b.assignedAt || 0);
        return dateB - dateA; // Descending order (newest first)
      });

      setCurrentDeliveries(sortedDeliveries);
    } catch (e) {
      setCurrentDeliveries([]);
    }
    setCurrentDeliveriesLoading(false);
  }, [user]);

  // Fetch stats (pending, completed today, earnings today)
  // const fetchStats = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     // All assigned orders
  //     const assignedRes = await api.get('/delivery-associates/orders', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });
  //     // Completed today & earnings today
  //     const earningsRes = await api.get('/delivery-associates/earnings?period=daily', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });

  //     // Count only pending orders (assigned status)
  //     const pendingCount = assignedRes.data.data.orders.filter(order => {
  //       const status = order.deliveryAssociate?.status || order.status;
  //       return status === 'assigned';
  //     }).length;

  //     setStats({
  //       pending: pendingCount,
  //       completedToday: earningsRes.data.data.completedOrders,
  //       earningsToday: earningsRes.data.data.totalEarnings,
  //     });
  //   } catch (e) {
  //     setStats({ pending: 0, completedToday: 0, earningsToday: 0 });
  //   }
  // }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      // Get today's date in the format YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // Fetch all orders to filter for today's delivered orders
      const ordersRes = await api.get('/delivery-associates/orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      const allOrders = ordersRes.data.data.orders || [];

      // Filter orders delivered today
      const deliveredToday = allOrders.filter(order => {
        const status = order.status || order.deliveryAssociate?.status;
        const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt).toISOString().split('T')[0] : null;
        return status === 'delivered' && deliveredDate === today;
      });

      // Calculate total earnings from today's delivered orders
      const earningsToday = deliveredToday.reduce((total, order) => {
        return total + (order.deliveryCharge || 0);
      }, 0);

      // Count pending orders (assigned status)
      const pendingOrders = allOrders.filter(order => {
        const status = order.deliveryAssociate?.status || order.status;
        return status === 'assigned' || status === 'packaging';
      });

      setStats({
        pending: pendingOrders.length,
        completedToday: deliveredToday.length,
        earningsToday: earningsToday,
      });
    } catch (e) {
      console.error('Error fetching stats:', e);
      setStats({ pending: 0, completedToday: 0, earningsToday: 0 });
    }
  }, [user]);


  // Fetch notification count (unread)
  // const fetchNotificationCount = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     const { data } = await api.get('/notifications', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });
  //     const unread = (data.data.notifications || []).filter(n => !n.isRead).length;
  //     setLastNotificationCount(notificationCount);
  //     setNotificationCount(unread);
  //   } catch (e) {
  //     // handle error
  //   }
  // }, [user, notificationCount]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground, refresh notifications
        fetchNotificationCount();
        fetchCurrentDeliveries();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);
  // const fetchNotificationCount = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     const { data } = await api.get('/notifications', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });

  //     // The backend returns { notifications: [...] } directly
  //     const notifications = data.notifications || [];
  //     const unread = notifications.filter(n => !n.isRead).length;

  //     console.log('Unread notifications count:', unread);

  //     setLastNotificationCount(notificationCount);
  //     setNotificationCount(unread);
  //   } catch (e) {
  //     console.error('Error fetching notifications:', e);
  //     setNotificationCount(0);
  //   }
  // }, [user, notificationCount]);


  // Refresh all

  // const fetchNotificationCount = useCallback(async () => {
  //   if (!user) return;
  //   try {
  //     const { data } = await api.get('/notifications', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //     });

  //     // The backend returns { notifications: [...] } directly
  //     const notifications = data.notifications || [];
  //     const unread = notifications.filter(n => !n.isRead).length;

  //     console.log('Unread notifications count:', unread);

  //     // Check for new order notifications
  //     const newOrderNotifications = notifications.filter(n =>
  //       !n.isRead &&
  //       n.type === 'order_available' &&
  //       new Date(n.createdAt) > lastNotificationCheck
  //     );

  //     if (newOrderNotifications.length > 0) {
  //       // Show popup for new orders
  //       Alert.alert(
  //         '📦 New Order Available!',
  //         `You have ${newOrderNotifications.length} new order(s) available for delivery.`,
  //         [
  //           {
  //             text: 'View Orders',
  //             onPress: () => {
  //               // Optionally navigate to orders screen or refresh
  //               fetchCurrentDeliveries();
  //             }
  //           },
  //           {
  //             text: 'Dismiss',
  //             style: 'cancel'
  //           }
  //         ],
  //         { cancelable: true }
  //       );

  //       // Update last check time
  //       setLastNotificationCheck(new Date());
  //     }

  //     setLastNotificationCount(notificationCount);
  //     setNotificationCount(unread);
  //   } catch (e) {
  //     console.error('Error fetching notifications:', e);
  //     setNotificationCount(0);
  //   }
  // }, [user, notificationCount, lastNotificationCheck, fetchCurrentDeliveries]);



  const fetchNotificationCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications', {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Handle different response structures
      const notifications = data.notifications || data.data?.notifications || [];
      const unread = notifications.filter(n => !n.isRead).length;

      console.log('Notifications API response:', data);
      console.log('Unread count:', unread);

      // Check for new order notifications
      const newOrderNotifications = notifications.filter(n =>
        !n.isRead &&
        n.type === 'order_available' &&
        new Date(n.createdAt) > lastNotificationCheck
      );

      if (newOrderNotifications.length > 0) {
        Alert.alert(
          '📦 New Order Available!',
          `You have ${newOrderNotifications.length} new order(s) available for delivery.`,
          [
            {
              text: 'View Orders',
              onPress: () => fetchCurrentDeliveries()
            },
            { text: 'Dismiss', style: 'cancel' }
          ],
          { cancelable: true }
        );
        setLastNotificationCheck(new Date());
      }

      setNotificationCount(unread);
    } catch (e) {
      console.error('Error fetching notifications:', e);
      setNotificationCount(0);
    }
  }, [user, lastNotificationCheck, fetchCurrentDeliveries]);

  // Single interval for notification checking
  useEffect(() => {
    const interval = setInterval(fetchNotificationCount, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);



  // Modify the interval to check for new notifications more frequently
  // useEffect(() => {
  //   const interval = setInterval(fetchNotificationCount, 10000); // Check every 10 seconds
  //   return () => clearInterval(interval);
  // }, [fetchNotificationCount]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchProfile(),
      fetchEarnings(),
      fetchOrders && fetchOrders(),
      fetchCurrentDeliveries(),
      fetchStats(),
      fetchNotificationCount(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProfile();
    fetchEarnings();
    fetchCurrentDeliveries();
    fetchStats();
    fetchNotificationCount();
  }, [fetchProfile, fetchEarnings, fetchCurrentDeliveries, fetchStats, fetchNotificationCount]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchEarnings();
      fetchCurrentDeliveries();
      fetchStats();
      fetchNotificationCount();
    }, [fetchProfile, fetchEarnings, fetchCurrentDeliveries, fetchStats, fetchNotificationCount])
  );

  useEffect(() => {
    const interval = setInterval(fetchNotificationCount, 30000); // every 30s
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  useEffect(() => {
    if (notificationCount > lastNotificationCount) {
      Alert.alert('New Notification', 'You have a new notification!');
    }
  }, [notificationCount, lastNotificationCount]);

  // Greeting and profile section
  // const renderProfileSection = () => (
  //   <Card className="flex-row items-center mb-4 bg-green-50">
  //     <Image
  //       source={profile?.profileImage?.url ? { uri: profile.profileImage.url } : DEFAULT_AVATAR}
  //       style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16, borderWidth: 2, borderColor: '#22c55e' }}
  //     />
  //     <View className="flex-1">
  //       <Text className="text-lg font-bold text-green-700 mb-1">Hello, {profile?.name || '...'}</Text>
  //       <View className="flex-row items-center mb-1">
  //         <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: online ? '#22c55e' : '#d1d5db', marginRight: 6 }} />
  //         <Text className={`text-xs font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>{online ? 'Online' : 'Active'}</Text>
  //       </View>
  //       <TouchableOpacity onPress={() => navigation?.navigate?.('Profile') || {}}>
  //         <Text className="text-xs text-blue-600 underline">View Profile</Text>
  //       </TouchableOpacity>
  //     </View>
  //     <View className="flex-row items-center ml-2">
  //       <View style={{ position: 'relative' }}>
  //         <TouchableOpacity onPress={() => navigation.navigate(routes.NOTIFICATIONS)} activeOpacity={0.7}>
  //           <Ionicons name="notifications-outline" size={24} color="red" />
  //           {notificationCount > 0 && (
  //             <View style={{
  //               position: 'absolute',
  //               top: -4,
  //               right: -4,
  //               backgroundColor: 'red',
  //               borderRadius: 8,
  //               width: 16,
  //               height: 16,
  //               justifyContent: 'center',
  //               alignItems: 'center',
  //             }}>
  //               <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notificationCount}</Text>
  //             </View>
  //           )}
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   </Card>
  // );

  const renderProfileSection = () => (
    <Card className="flex-row items-center mb-4 bg-green-50">
      <Image
        source={profile?.profileImage?.url ? { uri: profile.profileImage.url } : DEFAULT_AVATAR}
        style={{ width: 56, height: 56, borderRadius: 28, marginRight: 16, borderWidth: 2, borderColor: '#22c55e' }}
      />
      <View className="flex-1">
        <Text className="text-lg font-bold text-green-700 mb-1">Hello, {profile?.name || '...'}</Text>
        <View className="flex-row items-center mb-1">
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: online ? '#22c55e' : '#d1d5db', marginRight: 6 }} />
          <Text className={`text-xs font-semibold ${online ? 'text-green-600' : 'text-gray-400'}`}>{online ? 'Online' : 'Active'}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation?.navigate?.('Profile') || {}}>
          <Text className="text-xs text-blue-600 underline">View Profile</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row items-center ml-2">
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => navigation.navigate(routes.NOTIFICATIONS)} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="red" />
            {notificationCount > 0 && (
              <View style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'red',
                borderRadius: 8,
                width: 16,
                height: 16,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );


  // Stats card with icon
  const StatCard = ({ icon, label, value, color }) => (
    <Card className="flex-1 items-center justify-center mx-1 bg-white">
      <Text style={{ fontSize: 28 }}>{icon}</Text>
      <Text className={`text-xs mt-1 mb-0.5 ${color}`}>{label}</Text>
      <Text className={`text-xl font-bold ${color}`}>{value}</Text>
    </Card>
  );

  // Status badge
  const StatusBadge = ({ status }) => {
    let color = 'bg-gray-300', text = 'text-gray-700', label = status;
    if (status === 'delivered') { color = 'bg-green-200'; text = 'text-green-700'; label = 'Delivered'; }
    else if (status === 'packaging') { color = 'bg-blue-200'; text = 'text-blue-700'; label = 'Packaging'; }
    else if (status === 'out_for_delivery') { color = 'bg-yellow-200'; text = 'text-yellow-700'; label = 'Out For Delivery'; }
    else if (status === 'failed') { color = 'bg-red-200'; text = 'text-red-700'; label = 'Failed'; }
    return (
      <Text
        style={{
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 12,
          fontSize: 10,
          fontWeight: '600',
          alignSelf: 'flex-start',
          backgroundColor: color === 'bg-green-200' ? '#dcfce7' :
            color === 'bg-blue-200' ? '#dbeafe' :
              color === 'bg-yellow-200' ? '#fef3c7' :
                color === 'bg-red-200' ? '#fee2e2' : '#e5e7eb',
          color: text === 'text-green-700' ? '#15803d' :
            text === 'text-blue-700' ? '#1d4ed8' :
              text === 'text-yellow-700' ? '#a16207' :
                text === 'text-red-700' ? '#b91c1c' : '#374151',
        }}
      >
        {label}
      </Text>
    );
  };

  // Skeleton loader
  const Skeleton = ({ height = 20, width = '100%', style = {} }) => (
    <View style={{ backgroundColor: '#e5e7eb', borderRadius: 6, height, width, ...style, marginBottom: 8 }} />
  );

  // Quick action handlers
  const handleStartDelivery = async (orderId) => {
    if (!user) return;
    try {
      // Update delivery associate status to out_for_delivery (this will also update order status to out_for_delivery)
      await api.put(`/delivery-associates/orders/${orderId}/status`, {
        status: 'out_for_delivery'
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      Alert.alert('Started', 'Delivery started!');
      fetchCurrentDeliveries();
      fetchStats();
      fetchOrders && fetchOrders();
    } catch (e) {
      console.error('Start delivery error:', e);
      Alert.alert('Error', 'Could not start delivery.');
    }
  };
  // Improved View Route handler
  const handleViewRoute = (addressObj) => {
    if (!addressObj) {
      Alert.alert('No Address', 'No address available for this delivery.');
      return;
    }
    // Prefer coordinates if available
    if (addressObj.latitude && addressObj.longitude) {
      const lat = addressObj.latitude;
      const lng = addressObj.longitude;
      const label = encodeURIComponent(
        [addressObj.addressLine1, addressObj.city, addressObj.state].filter(Boolean).join(', ')
      );
      const url = Platform.select({
        ios: `maps:0,0?q=${lat},${lng}(${label})`,
        android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      });
      Linking.openURL(url);
      return;
    }
    // Otherwise, build full address string
    const parts = [
      addressObj.addressLine1,
      addressObj.addressLine2,
      addressObj.city,
      addressObj.state,
      addressObj.postalCode
    ].filter(Boolean);
    const fullAddress = parts.join(', ');
    if (!fullAddress) {
      Alert.alert('No Address', 'No address available for this delivery.');
      return;
    }
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(fullAddress)}`,
      android: `geo:0,0?q=${encodeURIComponent(fullAddress)}`,
    });
    Linking.openURL(url);
  };

  const handleCallCustomer = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  //     const query = searchQuery.toLowerCase();
  //     return (
  //       order._id.toLowerCase().includes(query) ||
  //       (order.customer?.firstName?.toLowerCase().includes(query) || "") ||
  //       (order.customer?.lastName?.toLowerCase().includes(query) || "") ||
  //       (order.customer?.phone?.toLowerCase().includes(query) || "") ||
  //       (order.customer?.address?.addressLine1?.toLowerCase().includes(query) || "")
  //     );
  //   });

  //   return (
  //     <View style={{ 
  //       backgroundColor: '#ffffff', 
  //       margin: 16, 
  //       borderRadius: 16, 
  //       shadowColor: '#000',
  //       shadowOffset: { width: 0, height: 2 },
  //       shadowOpacity: 0.1,
  //       shadowRadius: 8,
  //       elevation: 4,
  //       overflow: 'hidden'
  //     }}>
  //       {/* Header with gradient */}
  //       <LinearGradient
  //         colors={['#e2e8f0', '#f8fafc']}
  //         start={{ x: 0, y: 0 }}
  //         end={{ x: 1, y: 0 }}
  //         style={{
  //           paddingHorizontal: 20,
  //           paddingVertical: 16,
  //           flexDirection: 'row',
  //           alignItems: 'center',
  //           justifyContent: 'space-between'
  //         }}
  //       >
  //         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //           {/* <View style={{
  //             backgroundColor: '#FFFFFF',
  //             borderRadius: 8,
  //             padding: 8,
  //             marginRight: 10
  //           }}>
  //             <Ionicons name="bicycle" size={20} color='#059669' />
  //           </View> */}
  //           <Text style={{ 
  //             fontSize: 18, 
  //             fontWeight: '900', 
  //             color: '#047857',
  //             letterSpacing: 0.5
  //           }}>
  //             Current Deliveries
  //           </Text>
  //           <View style={{
  //             backgroundColor: '#059669',
  //             borderRadius: 12,
  //             paddingHorizontal: 8,
  //             paddingVertical: 4,
  //             marginLeft: 100
  //           }}>
  //             <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
  //               {filteredDeliveries.length}
  //             </Text>
  //           </View>
  //         </View>
  //       </LinearGradient>

  //       {/* Search Bar */}
  //       <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
  //         <View style={{
  //           flexDirection: 'row',
  //           alignItems: 'center',
  //           backgroundColor: '#f8fafc',
  //           borderRadius: 12,
  //           borderWidth: 1,
  //           borderColor: '#e2e8f0',
  //           paddingHorizontal: 12,
  //           height: 42
  //         }}>
  //           <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
  //           <TextInput
  //             placeholder="Search orders, customers..."
  //             value={searchQuery}
  //             onChangeText={setSearchQuery}
  //             style={{
  //               flex: 1,
  //               fontSize: 14,
  //               color: '#1e293b',
  //               fontWeight: '500'
  //             }}
  //             placeholderTextColor="#64748b"
  //           />
  //           {searchQuery.length > 0 && (
  //             <TouchableOpacity onPress={() => setSearchQuery('')}>
  //               <Ionicons name="close-circle" size={18} color="#64748b" />
  //             </TouchableOpacity>
  //           )}
  //         </View>
  //       </View>

  //       {/* Content */}
  //       <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 }}>
  //         {currentDeliveriesLoading ? (
  //           <View style={{ paddingVertical: 20 }}>
  //             <ActivityIndicator size="large" color="#10b981" />
  //             <Text style={{ textAlign: 'center', marginTop: 8, color: '#64748b' }}>
  //               Loading deliveries...
  //             </Text>
  //           </View>
  //         ) : filteredDeliveries.length === 0 ? (
  //           <View style={{ alignItems: 'center', paddingVertical: 32 }}>
  //             <View style={{
  //               backgroundColor: '#f1f5f9',
  //               borderRadius: 50,
  //               padding: 20,
  //               marginBottom: 16
  //             }}>
  //               <Ionicons name="cube-outline" size={32} color="#64748b" />
  //             </View>
  //             <Text style={{ fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
  //               No deliveries found
  //             </Text>
  //             <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
  //               {searchQuery ? 'Try adjusting your search' : 'All caught up! No active deliveries at the moment.'}
  //             </Text>
  //           </View>
  //         ) : (
  //           filteredDeliveries.map((order, index) => (
  //             <View key={order._id} style={{
  //               backgroundColor: '#fafafa',
  //               borderRadius: 12,
  //               padding: 16,
  //               marginBottom: index === filteredDeliveries.length - 1 ? 0 : 12,
  //               borderWidth: 1,
  //               borderColor: '#e2e8f0'
  //             }}>
  //               {/* Order Header */}
  //               <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
  //                 <View style={{
  //                   backgroundColor: '#10b981',
  //                   borderRadius: 8,
  //                   padding: 8,
  //                   marginRight: 12
  //                 }}>
  //                   <Text style={{ fontSize: 16 }}>📦</Text>
  //                 </View>
  //                 <View style={{ flex: 1 }}>
  //                   <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 }}>
  //                     Order #{order._id.slice(-6)}
  //                   </Text>
  //                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  //                     <StatusBadge status={order.deliveryAssociate?.status || order.status} />
  //                   </View>
  //                 </View>
  //               </View>

  //               {/* Customer Info */}
  //               <View style={{ marginBottom: 12 }}>
  //                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
  //                   <Ionicons name="person" size={14} color="#64748b" style={{ marginRight: 6 }} />
  //                   <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
  //                     {order.customer?.firstName} {order.customer?.lastName}
  //                   </Text>
  //                 </View>
  //                 <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
  //                   <Ionicons name="call" size={14} color="#64748b" style={{ marginRight: 6 }} />
  //                   <Text style={{ fontSize: 14, color: '#64748b' }}>
  //                     {order.customer?.phone}
  //                   </Text>
  //                 </View>
  //                 <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
  //                   <Ionicons name="location" size={14} color="#64748b" style={{ marginRight: 6, marginTop: 2 }} />
  //                   <Text style={{ fontSize: 14, color: '#64748b', flex: 1, lineHeight: 18 }}>
  //                     {order.customer?.address?.addressLine1}
  //                   </Text>
  //                 </View>
  //               </View>

  //               {/* Action Buttons */}
  //               <View style={{ flexDirection: 'row', gap: 8 }}>
  //                 {order.deliveryAssociate?.status === 'assigned' && (
  //                   <TouchableOpacity
  //                     onPress={() => handleStartDelivery(order._id)}
  //                     style={{
  //                       backgroundColor: '#10b981',
  //                       paddingHorizontal: 16,
  //                       paddingVertical: 10,
  //                       borderRadius: 8,
  //                       flexDirection: 'row',
  //                       alignItems: 'center',
  //                       justifyContent: 'center',
  //                       flex: 1
  //                     }}
  //                   >
  //                     <Ionicons name="play" size={14} color="#ffffff" style={{ marginRight: 6 }} />
  //                     <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
  //                       Start
  //                     </Text>
  //                   </TouchableOpacity>
  //                 )}
  //                 <TouchableOpacity
  //                   onPress={() => handleViewRoute(order.customer?.address)}
  //                   style={{
  //                     backgroundColor: '#3b82f6',
  //                     paddingHorizontal: 12,
  //                     paddingVertical: 10,
  //                     borderRadius: 8,
  //                     flexDirection: 'row',
  //                     alignItems: 'center',
  //                     justifyContent: 'center',
  //                     minWidth: 80
  //                   }}
  //                 >
  //                   <Ionicons name="navigate" size={14} color="#ffffff" style={{ marginRight: 4 }} />
  //                   <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
  //                     Route
  //                   </Text>
  //                 </TouchableOpacity>
  //                 <TouchableOpacity
  //                   onPress={() => handleCallCustomer(order.customer?.phone)}
  //                   style={{
  //                     backgroundColor: '#059669',
  //                     paddingHorizontal: 12,
  //                     paddingVertical: 10,
  //                     borderRadius: 8,
  //                     flexDirection: 'row',
  //                     alignItems: 'center',
  //                     justifyContent: 'center',
  //                     minWidth: 70
  //                   }}
  //                 >
  //                   <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 4 }} />
  //                   <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
  //                     Call
  //                   </Text>
  //                 </TouchableOpacity>
  //               </View>
  //             </View>
  //           ))
  //         )}
  //       </View>
  //     </View>
  //   );
  // };

  // Stats Section
  // const renderStats = () => (
  //   <View className="flex-row mb-3">
  //     <StatCard icon={ICONS.completed} label="Completed Today" value={stats.completedToday} color="text-green-700" />
  //     <StatCard icon={ICONS.earnings} label="Earnings Today" value={`₹${stats.earningsToday?.toFixed(2) || '0.00'}`} color="text-green-700" />
  //   </View>
  // );

  const renderStats = () => (
    <View className="flex-row mb-3">
      <StatCard 
        icon={ICONS.completed} 
        label="Delivered Today" 
        value={stats.completedToday} 
        color="text-green-700" 
      />
      <StatCard 
        icon={ICONS.earnings} 
        label="Earnings Today" 
        value={`₹${stats.earningsToday.toFixed(2)}`} 
        color="text-green-700" 
      />
    </View>
  );

  // Delivery Status container
  const renderDeliveryStatus = () => {
    // Determine status label
    let statusLabel = 'Idle';
    let statusColor = '#64748b'; // gray
    if (online && currentDeliveries.length > 0) {
      statusLabel = 'Busy';
      statusColor = '#f59e42'; // orange
    } else if (online) {
      statusLabel = 'Active';
      statusColor = '#22c55e'; // green
    } else {
      statusLabel = 'Offline';
      statusColor = '#64748b'; // gray
    }
    return (
      <Card className="flex-row items-center mb-4 bg-white" style={{ alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 2 }}>Delivery Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: 'green', fontWeight: '500' }}>
              {currentDeliveries.length} Active Deliver{currentDeliveries.length === 1 ? 'y' : 'ies'}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  // Current Deliveries Section
  const renderCurrentDeliveries = () => {
    const filteredDeliveries = currentDeliveries.filter(order => {
      const query = searchQuery.toLowerCase();
      return (
        order._id.toLowerCase().includes(query) ||
        (order.customer?.addresses?.[0]?.name?.toLowerCase().includes(query) || "") ||
        (order.customer?.phone?.toLowerCase().includes(query) || "") ||
        (order.deliveryAddress?.street?.toLowerCase().includes(query) || "")
      );
    });

    return (
      <View style={{
        backgroundColor: '#ffffff',
        margin: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden'
      }}>
        {/* Header with gradient */}
        <LinearGradient
          colors={['#e2e8f0', '#f8fafc']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '900',
              color: '#047857',
              letterSpacing: 0.5
            }}>
              Current Deliveries
            </Text>
            <View style={{
              backgroundColor: '#059669',
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginLeft: 60
            }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                {filteredDeliveries.length}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            paddingHorizontal: 12,
            height: 42
          }}>
            <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search orders, customers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 14,
                color: '#1e293b',
                fontWeight: '500'
              }}
              placeholderTextColor="#64748b"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 20, paddingTop: 16 }}>
          {currentDeliveriesLoading ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ textAlign: 'center', marginTop: 8, color: '#64748b' }}>
                Loading deliveries...
              </Text>
            </View>
          ) : filteredDeliveries.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <View style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 50,
                padding: 20,
                marginBottom: 16
              }}>
                <Ionicons name="cube-outline" size={32} color="#64748b" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#475569', marginBottom: 4 }}>
                No deliveries found
              </Text>
              <Text style={{ fontSize: 14, color: '#64748b', textAlign: 'center' }}>
                {searchQuery ? 'Try adjusting your search' : 'All caught up! No active deliveries at the moment.'}
              </Text>
            </View>
          ) : (
            filteredDeliveries.map((order, index) => (
              <View key={order._id} style={{
                backgroundColor: '#fafafa',
                borderRadius: 12,
                padding: 16,
                marginBottom: index === filteredDeliveries.length - 1 ? 0 : 12,
                borderWidth: 1,
                borderColor: '#e2e8f0'
              }}>
                {/* Order Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{
                    backgroundColor: '#10b981',
                    borderRadius: 8,
                    padding: 8,
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 16 }}>📦</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 }}>
                      Order ID: {order.orderId}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <StatusBadge status={order.deliveryAssociate?.status || order.status} />
                    </View>
                  </View>
                </View>

                {/* Customer Info */}
                <View style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="person" size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
                      {order.customer?.addresses?.[0]?.name} 
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="call" size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: '#64748b' }}>
                      {order.customer?.phone}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="location" size={14} color="#64748b" style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={{ fontSize: 14, color: '#64748b', flex: 1, lineHeight: 18 }}>
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {order.deliveryAssociate?.status === 'packaging' && (
                    <TouchableOpacity
                      onPress={() => handleStartDelivery(order._id)}
                      style={{
                        backgroundColor: '#10b981',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: 1
                      }}
                    >
                      <Ionicons name="play" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                        Start
                      </Text>
                    </TouchableOpacity>
                  )}
                  {/* <TouchableOpacity
                    onPress={() => handleViewRoute(order.deliveryAddress)}
                    style={{
                      backgroundColor: '#3b82f6',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 80
                    }}
                  >
                    <Ionicons name="navigate" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                      Route
                    </Text>
                  </TouchableOpacity> */}
                  <TouchableOpacity
                    onPress={() => handleCallCustomer(order.customer?.phone)}
                    style={{
                      backgroundColor: '#1D4ED8',
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 70
                    }}
                  >
                    <Ionicons name="call" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                      Call
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  // Overview Tab
  const renderOverview = () => (
    <ScrollView
      className="flex-1 pt-4 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ paddingHorizontal: 16 }}>
        {profileLoading ? (
          <Skeleton height={72} />
        ) : (
          renderProfileSection()
        )}
        {renderDeliveryStatus()}
        {renderStats()}
        {renderCurrentDeliveries()}
      </View>
    </ScrollView>
  );

  // Earnings Tab
  const renderEarnings = () => (
    <ScrollView className="flex-1 px-4 pt-4 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Card className="bg-green-100 border-l-4 border-green-500 mb-3">
        <Text className="text-lg font-bold text-green-700 mb-1">Total Earnings (All Time)</Text>
        {earningsLoading ? (
          <Skeleton height={32} />
        ) : (
          <Text className="text-2xl font-extrabold text-green-700">₹{earnings?.allTimeMetrics?.totalEarnings?.toFixed(2) || '0.00'}</Text>
        )}
      </Card>
      <Card>
        <Text className="text-base font-semibold mb-2 text-green-700">Earnings by Day (This Week)</Text>
        {earningsLoading ? (
          <Skeleton height={24} />
        ) : (
          <FlatList
            data={earnings?.earningsByDay || []}
            keyExtractor={item => item.date}
            renderItem={({ item }) => (
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-700">{formatDate(item.date)}</Text>
                <Text className="text-green-700 font-semibold">₹{item.amount.toFixed(2)}</Text>
              </View>
            )}
            ListEmptyComponent={<Text className="text-gray-400 text-center">No earnings data.</Text>}
            scrollEnabled={false}
          />
        )}
      </Card>
    </ScrollView>
  );

  // Orders Tab
  const renderOrders = () => (
    <View className="flex-1 px-4 pt-4 bg-gray-50">
      {ordersLoading ? (
        <Skeleton height={60} />
      ) : (
        <FlatList
          data={orders?.orders || []}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card className="flex-row items-center">
              <Text style={{ fontSize: 20, marginRight: 10 }}>{ICONS.order}</Text>
              <View className="flex-1">
                <Text className="font-semibold text-gray-800 mb-1">Order ID: {item.orderId}</Text>
                <Text className="text-xs text-gray-500 mb-1">{formatDate(item.createdAt)}</Text>
                <StatusBadge status={item.deliveryAssociate?.status || item.status} />
                <Text className="text-xs text-gray-600 mt-1">Customer: {item.customer?.firstName} {item.customer?.lastName}</Text>
              </View>
            </Card>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text className="text-gray-400 text-center mt-10">No orders assigned.</Text>}
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      {/* Custom Header for Dashboard */}
      <LinearGradient
        colors={['#10b981', '#059669', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: (StatusBar.currentHeight || 44) * 1.2,
          paddingBottom: 15,
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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Icon2.jpeg */}
          <Image source={Icon1} style={{ width: 40, height: 40, borderRadius: 8, marginRight: 10 }} />
          {/* Center: Title */}
          <Text style={{ flex: 1, fontSize: 24, fontWeight: 'bold', color: 'white', margintop: 4 }}>Dashboard</Text>
          {/* Right: Settings icon (navigates to Settings) */}
          <TouchableOpacity onPress={() => nav.navigate(routes.SETTINGS)} style={{ marginLeft: 10, padding: 6 }}>
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      {/* <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} /> */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'earnings' && renderEarnings()}
      {activeTab === 'orders' && renderOrders()}
    </View>
  );
}
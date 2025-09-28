import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import formatDate from '../utils/formatDate';
import EnhancedHeader from '../components/EnhancedHeader';
import { useRoute } from '@react-navigation/native';
import routes from '../constants/routes';

const { width: screenWidth } = Dimensions.get('window');

import * as Location from 'expo-location';

export default function AvailableOrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);

  const route = useRoute();

  // Add this array for the filter tabs
  const orderTabs = [
    { key: 'MyOrders', label: 'My Orders', screen: routes.ORDERS },
    { key: 'AvailableOrders', label: 'Available Orders', screen: routes.AVAILABLE_ORDERS },
    // { key: 'OrderHistory', label: 'Order History', screen: routes.ORDER_HISTORY },
  ];

  const fetchAvailableOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/available-for-delivery', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(data.data.orders || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch available orders.');
    }
    setLoading(false);
  }, [user]);

  //=========================================================================
  //   const fetchAvailableOrders = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Permission Denied', 'Location access is required to fetch nearby orders.');
  //       setLoading(false);
  //       return;
  //     }

  //     const location = await Location.getCurrentPositionAsync({
  //       accuracy: Location.Accuracy.High,
  //     });

  //     const { latitude, longitude } = location.coords;

  //     const { data } = await api.get('/orders/available-for-delivery', {
  //       headers: { Authorization: `Bearer ${user.token}` },
  //       params: {
  //         latitude,
  //         longitude,
  //         maxDistance: 100, // 10km in meters
  //       },
  //     });

  //     setOrders(data.data.orders || []);
  //   } catch (e) {
  //     console.error(e);
  //     Alert.alert('Error', 'Failed to fetch nearby available orders.');
  //   }
  //   setLoading(false);
  // }, [user]);


  //===========================================================================

  useEffect(() => {
    fetchAvailableOrders();
  }, [fetchAvailableOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableOrders();
    setRefreshing(false);
  };

  const handleSelfAssign = async (orderId) => {
    setAssigningId(orderId);
    try {
      await api.put(`/orders/${orderId}/self-assign`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert('Success', 'Order assigned to you!');
      fetchAvailableOrders();
      // Navigate to dashboard to show the accepted order
      navigation.navigate(routes.MAIN, { screen: routes.DASHBOARD, params: { orderId } });
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to assign order.');
    }
    setAssigningId(null);
  };

  const handleDeclineOrder = async (orderId) => {
    setDecliningId(orderId);
    try {
      await api.put(`/orders/${orderId}/decline`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      Alert.alert('Success', 'Order declined successfully!');
      fetchAvailableOrders();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to decline order.');
    }
    setDecliningId(null);
  };

  const renderOrder = ({ item, index }) => (
    <View className={`mb-4 ${index === orders.length - 1 ? 'mb-6' : ''}`}>
      <Card className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xl">
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            {/* <View className="bg-gradient-to-r from-blue-500 to-purple-600 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">
                #{item._id.slice(-6)}
              </Text>
            </View> */}
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800 ml-3">
                Order ID: {item.orderId}
              </Text>
              {/* <View className="bg-emerald-100 px-3 py-1 rounded-full self-start mt-1">
                <Text className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  • Available
                </Text>
              </View> */}
            </View>
          </View>
          <View className="items-end">
            <Text className="text-xs text-gray-500 font-medium">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>

        {/* Customer Information Card */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-blue-100 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 font-bold text-sm">👤</Text>
            </View>
            <Text className="text-base font-bold text-gray-800">Customer Details</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-semibold text-gray-600 w-16">Name:</Text>
            <Text className="text-sm text-gray-800 font-medium flex-1">
              {item.customer?.addresses?.[0]?.name} 
            </Text>
          </View>

          <View className="flex-row items-start">
            <Text className="text-sm font-semibold text-gray-600 w-16">Address:</Text>
            <Text className="text-sm text-gray-800 font-medium flex-1 leading-5" numberOfLines={3}>
              {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
            </Text>
          </View>
        </View>

        {/* Supplier Information Card */}
        <View className="bg-gray-50 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="bg-gradient-to-r from-blue-500 to-indigo-500 w-9 h-9 rounded-2xl items-center justify-center mr-3 shadow-sm">
              <Text className="text-white font-bold text-lg">📍</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900 tracking-wide">
              Pick order from
            </Text>
          </View>


          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-semibold text-gray-600 w-16">Name:</Text>
            <Text className="text-sm text-gray-800 font-medium flex-1">
              {item.supplier?.businessName}
            </Text>
          </View>

          <View className="flex-row items-start">
            <Text className="text-sm font-semibold text-gray-600 w-16">Address:</Text>
            <Text className="text-sm text-gray-800 font-medium flex-1 leading-5" numberOfLines={3}>
              {item.supplier?.address?.street}, {item.supplier?.address?.city}
            </Text>
          </View>
        </View>

        {/* Order Stats */}
        <View className="flex-row justify-between mb-5">
          <View className="bg-blue-50 px-3 py-2 rounded-xl flex-1 mr-2">
            <Text className="text-xs font-semibold text-blue-600 text-center">Order Value</Text>
            <Text className="text-sm font-bold text-blue-800 text-center">
              ₹{item.totalAmount || 'N/A'}
            </Text>
          </View>
          {/* <View className="bg-orange-50 px-3 py-2 rounded-xl flex-1 mr-2">
            <Text className="text-xs font-semibold text-orange-600 text-center">Distance</Text>
            <Text className="text-sm font-bold text-orange-800 text-center">
              {item.distance || '2.5'} km
            </Text>
          </View> */}
          {/* <View className="bg-green-50 px-3 py-2 rounded-xl flex-1">
            <Text className="text-xs font-semibold text-green-600 text-center">Delivery Fee</Text>
            <Text className="text-sm font-bold text-green-800 text-center">
              ₹{item.deliveryFee || '20.00'}
            </Text>
          </View> */}
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between space-x-3">
          <Button
            title={decliningId === item._id ? 'Declining...' : 'Decline'}
            onPress={() => handleDeclineOrder(item._id)}
            disabled={decliningId === item._id || assigningId === item._id}
            className={`$${decliningId === item._id || assigningId === item._id
                ? 'bg-gray-300'
                : 'bg-red-500'
              } px-6 py-2 rounded-2xl shadow-lg flex-1 mr-2`}
            style={{
              alignItems: 'center',
              minHeight: 36
            }}
            textClassName="text-white font-bold text-sm"
          />

          <Button
            title={assigningId === item._id ? 'Accepting...' : 'Accept Order'}
            onPress={() => handleSelfAssign(item._id)}
            disabled={assigningId === item._id || decliningId === item._id}
            className={`$${assigningId === item._id || decliningId === item._id
                ? 'bg-gray-300'
                : 'bg-green-500'
              } px-6 py-2 rounded-2xl shadow-lg flex-1`}
            style={{
              alignItems: 'center',
              minHeight: 36
            }}
            textClassName="text-white font-bold text-sm"
          />
        </View>
      </Card>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-8 py-16">
      <View className="bg-gray-100 w-24 h-24 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">📦</Text>
      </View>
      <Text className="text-2xl font-bold text-gray-800 mb-3 text-center">
        No Orders Available
      </Text>
      <Text className="text-base text-gray-600 text-center leading-6 max-w-sm">
        All orders have been assigned or there are no new orders at the moment. Check back later for new delivery opportunities.
      </Text>
      <View className="mt-6 bg-blue-50 px-4 py-3 rounded-2xl">
        <Text className="text-sm text-blue-700 font-medium text-center">
          💡 Pull down to refresh and check for new orders
        </Text>
      </View>
    </View>
  );

  const renderLoader = () => (
    <View className="flex-1 justify-center items-center py-16">
      <View className="bg-white rounded-3xl p-8 shadow-lg items-center">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-lg font-bold text-gray-800 mt-4 mb-2">
          Loading Orders
        </Text>
        <Text className="text-sm text-gray-600 text-center">
          Fetching available delivery orders...
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <EnhancedHeader title="Available Orders" onBackPress={() => navigation.goBack()} />

      {/* Order Tabs Filter */}
      <View className="flex-row justify-center items-center mt-2 mb-2">
        {orderTabs.map((tab) => {
          const isActive = route.name === tab.screen;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                if (!isActive) {
                  if (tab.screen === routes.ORDER_HISTORY) {
                    navigation.navigate(tab.screen);
                  } else {
                    navigation.navigate(routes.MAIN, { screen: tab.screen });
                  }
                }
              }}
              className={`px-4 py-2 mx-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
            >
              <Text className={`font-bold ${isActive ? 'text-white' : 'text-gray-700'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        renderLoader()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={renderOrder}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#10b981']}
              tintColor="#10b981"
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            flexGrow: 1
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
} 
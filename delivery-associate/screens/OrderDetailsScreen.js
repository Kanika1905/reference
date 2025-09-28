import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../services/api';
import Card from '../components/Card';
import formatDate from '../utils/formatDate';
import routes from '../constants/routes';

export default function OrderDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setError('Order ID is missing.');
      setLoading(false);
      return;
    }
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ordersAPI.getOrderDetails(orderId);
      setOrder(response.data.data.order);
    } catch (e) {
      setError('Failed to load order details.');
      setOrder(null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-gray-600 mt-4">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 mt-4">{error || 'Order not found.'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-6 px-6 py-3 bg-green-500 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 rounded-full bg-white shadow-sm mr-3">
          <Ionicons name="arrow-back" size={20} color="#10b981" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-emerald-800">Order Details</Text>
      </View>

      {/* Order Summary */}
      <Card>
        <Text className="text-gray-500 text-sm mb-1">Order ID</Text>
        <Text className="font-bold text-gray-900 text-lg mb-2">#{order._id?.slice(-8)}</Text>
        <Text className="text-gray-700 mb-1">Status: <Text className="font-semibold">{order.status}</Text></Text>
        <Text className="text-gray-700 mb-1">Placed: {formatDate(order.createdAt)}</Text>
        {order.estimatedDeliveryDate && (
          <Text className="text-gray-700 mb-1">Est. Delivery: {formatDate(order.estimatedDeliveryDate)}</Text>
        )}
      </Card>

      {/* Customer Info */}
      <Card style={{ marginTop: 16 }}>
        <Text className="text-base font-medium text-gray-900 mb-2">Customer</Text>
        <Text className="text-gray-800 font-semibold">{order.customer?.firstName} {order.customer?.lastName}</Text>
        <Text className="text-gray-600">{order.customer?.phone}</Text>
        <Text className="text-gray-600">{order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state}, {order.deliveryAddress?.postalCode}</Text>
      </Card>

      {/* Items */}
      <Card style={{ marginTop: 16 }}>
        <Text className="text-base font-medium text-gray-900 mb-2">Items</Text>
        {order.items?.map((item, idx) => (
          <View key={idx} className="mb-2">
            <Text className="text-gray-800 font-semibold">{item.product?.name}</Text>
            <Text className="text-gray-600">Qty: {item.quantity} • Price: ₹{item.price}</Text>
          </View>
        ))}
      </Card>

      {/* Payment Summary */}
      <Card style={{ marginTop: 16 }}>
        <Text className="text-base font-medium text-gray-900 mb-2">Payment</Text>
        <Text className="text-gray-700">Total: ₹{order.totalAmount}</Text>
        <Text className="text-gray-700">Payment Status: {order.paymentStatus}</Text>
      </Card>
    </ScrollView>
  );
} 
// // OrdersScreen.js
// import React, { useState, useEffect, useRef } from 'react';
// import { View, Text, FlatList, RefreshControl, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ordersAPI } from '../services/api';
// import formatDate, { formatCurrency, getStatusColor, getStatusText } from '../utils/formatDate';
// import { ORDER_STATUS } from '../constants/config';
// import EnhancedHeader from '../components/EnhancedHeader';

// const { width } = Dimensions.get('window');

// const statusColors = {
//   delivered: 'bg-green-100 text-green-700',
//   out_for_delivery: 'bg-blue-100 text-blue-700',
//   pending: 'bg-yellow-100 text-yellow-700',
//   processing: 'bg-orange-100 text-orange-700',
//   cancelled: 'bg-red-100 text-red-700',
//   default: 'bg-gray-100 text-gray-700',
// };

// function StatusBadge({ status }) {
//   const color = getStatusColor(status);
//   const statusText = getStatusText(status);

//   const getStatusStyle = (status) => {
//     const styles = {
//       delivered: { backgroundColor: '#10b981', shadowColor: '#10b981' },
//       out_for_delivery: { backgroundColor: '#3b82f6', shadowColor: '#3b82f6' },
//       pending: { backgroundColor: '#f59e0b', shadowColor: '#f59e0b' },
//       processing: { backgroundColor: '#f97316', shadowColor: '#f97316' },
//       cancelled: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
//       default: { backgroundColor: '#6b7280', shadowColor: '#6b7280' },
//     };
//     return styles[status] || styles.default;
//   };

//   const statusStyle = getStatusStyle(status);

//   return (
//     <View 
//       style={{ 
//         ...statusStyle,
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.15,
//         shadowRadius: 2,
//         elevation: 2,
//       }} 
//       className="px-2 py-1 rounded-full self-start"
//     >
//       <Text className="text-xs font-bold text-white capitalize">{statusText}</Text>
//     </View>
//   );
// }

// function PaymentIcon({ method }) {
//   let icon = 'credit-card';
//   let color = '#3b82f6';

//   if (method === 'cash_on_delivery') {
//     icon = 'cash';
//     color = '#10b981';
//   } else if (method === 'debit_card') {
//     icon = 'credit-card-outline';
//     color = '#8b5cf6';
//   } else if (method === 'upi') {
//     icon = 'bank-transfer';
//     color = '#f59e0b';
//   }

//   return <MaterialCommunityIcons name={icon} size={16} color={color} style={{ marginRight: 4 }} />;
// }

// function OrderCard({ item, navigation }) {
//   const cardAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   useEffect(() => {
//     Animated.spring(cardAnim, {
//       toValue: 1,
//       tension: 50,
//       friction: 7,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.98,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <Animated.View 
//       style={{ 
//         opacity: cardAnim,
//         transform: [
//           { 
//             translateY: cardAnim.interpolate({
//               inputRange: [0, 1],
//               outputRange: [30, 0],
//             })
//           },
//           { scale: scaleAnim }
//         ]
//       }}
//     >
//       <TouchableOpacity
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         activeOpacity={0.95}
//       >
//         <View className="bg-white rounded-2xl shadow-md p-4 mb-3 border border-gray-50 w-full max-w-xl self-center"
//           style={{
//             shadowColor: '#000',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.08,
//             shadowRadius: 4,
//             elevation: 3,
//           }}
//         >
//           {/* Header Section - Compact */}
//           <View className="flex-row justify-between items-center mb-3">
//             <View className="flex-1">
//               <Text className="text-lg font-bold text-gray-800">
//                 #{item.orderId ? item.orderId.slice(-6) : item._id.slice(-6)}
//               </Text>
//               <Text className="text-xs text-gray-500">
//                 {formatDate(item.createdAt || item.orderDate)}
//               </Text>
//             </View>
//             <StatusBadge status={item.status} />
//           </View>

//           {/* Amount & Payment Row - Consolidated */}
//           <View className="bg-emerald-50 rounded-xl p-3 mb-3">
//             <View className="flex-row items-center justify-between">
//               <View className="flex-1">
//                 <Text className="text-xl font-bold text-emerald-600">
//                   {formatCurrency(item.totalAmount)}
//                 </Text>
//                 <View className="flex-row items-center mt-1">
//                   <PaymentIcon method={item.paymentMethod} />
//                   <Text className="text-xs text-gray-600 capitalize">
//                     {item.paymentMethod?.replace(/_/g, ' ')}
//                   </Text>
//                 </View>
//               </View>
//               <View className="bg-white rounded-full p-2">
//                 <MaterialCommunityIcons name="currency-inr" size={20} color="#10b981" />
//               </View>
//             </View>
//           </View>

//           {/* Info Grid - Compact 2x2 Layout */}
//           <View className="bg-gray-50 rounded-xl p-3 mb-3">
//             <View className="flex-row">
//               {/* Left Column */}
//               <View className="flex-1 pr-2">
//                 {/* Delivery Date */}
//                 <View className="flex-row items-center mb-2">
//                   <MaterialCommunityIcons name="calendar-clock" size={14} color="#3b82f6" />
//                   <View className="ml-2 flex-1">
//                     <Text className="text-xs text-gray-500">Delivery</Text>
//                     <Text className="font-semibold text-gray-800 text-xs">
//                       {formatDate(item.estimatedDeliveryDate)}
//                     </Text>
//                   </View>
//                 </View>

//                 {/* Express Delivery */}
//                 {item.isExpressDelivery !== undefined && (
//                   <View className="flex-row items-center">
//                     <MaterialCommunityIcons 
//                       name={item.isExpressDelivery ? "flash" : "truck"} 
//                       size={14} 
//                       color={item.isExpressDelivery ? "#f59e0b" : "#6b7280"} 
//                     />
//                     <View className="ml-2 flex-1">
//                       <Text className="text-xs text-gray-500">Type</Text>
//                       <Text className="font-semibold text-gray-800 text-xs">
//                         {item.isExpressDelivery ? 'Express' : 'Standard'}
//                       </Text>
//                     </View>
//                   </View>
//                 )}
//               </View>

//               {/* Right Column */}
//               <View className="flex-1 pl-2">
//                 {/* Payment Status */}
//                 {item.paymentStatus && (
//                   <View className="flex-row items-center mb-2">
//                     <MaterialCommunityIcons name="check-circle" size={14} color="#10b981" />
//                     <View className="ml-2 flex-1">
//                       <Text className="text-xs text-gray-500">Payment</Text>
//                       <Text className="font-semibold text-gray-800 text-xs capitalize">
//                         {item.paymentStatus}
//                       </Text>
//                     </View>
//                 </View>
//               </View>
//             </View>
//           </View>

//           {/* Address - Compact (only if exists) */}
//           {item.deliveryAddress && (
//             <View className="bg-blue-50 rounded-xl p-3 mb-3">
//               <View className="flex-row items-center">
//                 <MaterialCommunityIcons name="map-marker" size={14} color="#3b82f6" />
//                 <Text className="ml-2 text-xs text-gray-700 flex-1" numberOfLines={1}>
//                   {item.deliveryAddress.street}, {item.deliveryAddress.city}
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Notes - Compact (only if exists) */}
//           {item.notes && (
//             <View className="bg-amber-50 rounded-xl p-3 mb-3">
//               <View className="flex-row items-center">
//                 <MaterialCommunityIcons name="note-text" size={14} color="#f59e0b" />
//                 <Text className="ml-2 text-xs text-gray-700 flex-1 italic" numberOfLines={2}>
//                   {item.notes}
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Action Buttons - Compact */}
//           <View className="flex-row space-x-2 mt-1">
//             <TouchableOpacity
//               className="flex-1 bg-emerald-500 rounded-xl py-2.5 flex-row items-center justify-center"
//               onPress={() => navigation.navigate('Feedback', { orderId: item._id })}
//               style={{
//                 shadowColor: '#10b981',
//                 shadowOffset: { width: 0, height: 1 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 2,
//                 elevation: 2,
//               }}
//             >
//               <MaterialCommunityIcons name="star" size={16} color="white" style={{ marginRight: 4 }} />
//               <Text className="text-white font-bold text-xs">Feedback</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               className="flex-1 bg-blue-500 rounded-xl py-2.5 flex-row items-center justify-center"
//               onPress={() => navigation.navigate('ProofUpload', { orderId: item._id })}
//               style={{
//                 shadowColor: '#3b82f6',
//                 shadowOffset: { width: 0, height: 1 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 2,
//                 elevation: 2,
//               }}
//             >
//               <MaterialCommunityIcons name="upload" size={16} color="white" style={{ marginRight: 4 }} />
//               <Text className="text-white font-bold text-xs">Send OTP</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// function StatusFilter({ filter, onFilterPress, selectedStatus }) {
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const isSelected = selectedStatus === filter.key;

//   const handlePressIn = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 0.95,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handlePressOut = () => {
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//     }).start();
//   };

//   return (
//     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//       <TouchableOpacity
//         onPress={() => onFilterPress(filter.key)}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         className={`px-4 py-2.5 rounded-2xl mr-3 ${isSelected ? 'bg-emerald-500' : 'bg-white'}`}
//         style={{
//           shadowColor: isSelected ? '#10b981' : '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: isSelected ? 0.2 : 0.08,
//           shadowRadius: 3,
//           elevation: isSelected ? 4 : 2,
//           borderWidth: isSelected ? 0 : 1,
//           borderColor: '#e5e7eb',
//         }}
//       >
//         <View className="flex-row items-center">
//           <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
//             {filter.label}
//           </Text>
//           <View className={`ml-2 px-2 py-0.5 rounded-full ${isSelected ? 'bg-white bg-opacity-20' : 'bg-emerald-100'}`}>
//             <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
//               {filter.count}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// }

// export default function OrdersScreen() {
//   const nav = useNavigation();
//   const [orders, setOrders] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
//   const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, processing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 });
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);

//   // Status filter tabs
//   const statusFilters = [
//     { key: 'all', label: 'All', count: statusCounts.all },
//     ...Object.keys(statusCounts)
//       .filter((key) => key !== 'all')
//       .map((key) => ({
//         key,
//         label: getStatusText(key),
//         count: statusCounts[key],
//       })),
//   ];

//   const fetchStatusCounts = async () => {
//     try {
//       const response = await ordersAPI.getOrderStatusCounts();
//       setStatusCounts({ ...response.data.data, all: Object.values(response.data.data).reduce((a, b) => a + b, 0) });
//     } catch (error) {
//       console.error('Error fetching status counts:', error);
//     }
//   };

//   const fetchOrders = async (page = 1) => {
//     try {
//       setIsLoading(true);
//       const params = { page, limit: pagination.limit };
//       if (selectedStatus !== 'all') params.status = selectedStatus;
//       const response = await ordersAPI.getOrders(params);
//       const { orders: fetchedOrders, pagination: paginationData } = response.data.data;
//       if (page === 1) {
//         setOrders(fetchedOrders);
//         console.log(fetchOrders);
//       } else {
//         setOrders((prev) => [...prev, ...fetchedOrders]);
//       }
//       setPagination(paginationData);
//       Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     fadeAnim.setValue(0);
//     await fetchOrders(1);
//     await fetchStatusCounts();
//     setRefreshing(false);
//   };

//   const loadMore = () => {
//     if (pagination.page < pagination.pages && !isLoading) {
//       fetchOrders(pagination.page + 1);
//     }
//   };

//   const handleStatusFilter = (status) => {
//     setSelectedStatus(status);
//     setPagination((prev) => ({ ...prev, page: 1 }));
//     fadeAnim.setValue(0);
//     fetchOrders(1);
//     fetchStatusCounts();
//     if (flatListRef.current) {
//       flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//     }
//   };

//   useEffect(() => {
//     fetchOrders(1);
//     fetchStatusCounts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedStatus]);

//   return (
//     <View style={{ flex: 1 }}>
//       <StatusBar barStyle="light-content" backgroundColor="#10b981" />
//       <EnhancedHeader title="My Orders" onBackPress={() => nav.goBack()} />

//       {/* Orders List */}
//       <FlatList
//         ref={flatListRef}
//         data={orders}
//         keyExtractor={(item) => item._id}
//         renderItem={({ item }) => <OrderCard item={item} navigation={nav} />}
//         contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 12 }}
//         ListEmptyComponent={
//           <View className="flex-1 justify-center items-center mt-20">
//             <MaterialCommunityIcons name="package-variant-closed" size={48} color="#d1d5db" />
//             <Text className="text-center text-gray-500 mt-3 text-base font-medium">No orders yet</Text>
//             <Text className="text-center text-gray-400 mt-1 text-sm">Your orders will appear here</Text>
//           </View>
//         }
//         showsVerticalScrollIndicator={false}
//         onEndReached={loadMore}
//         onEndReachedThreshold={0.2}
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={onRefresh} 
//             colors={["#10b981"]} 
//             tintColor="#10b981"
//             progressBackgroundColor="#f0fdf4"
//           />
//         }
//         ListFooterComponent={isLoading && pagination.page > 1 ? (
//           <View className="py-4 items-center">
//             <View className="bg-white rounded-xl p-3 shadow-sm flex-row items-center">
//               <View className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></View>
//               <Text className="text-gray-600 text-sm">Loading...</Text>
//             </View>
//           </View>
//         ) : null}
//       />
//     </View>
//   );
// }





// OrdersScreen.js
import { Alert, Linking, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, Animated, Dimensions, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../services/api';
import formatDate, { formatCurrency, getStatusColor, getStatusText } from '../utils/formatDate';
import { ORDER_STATUS } from '../constants/config';
import routes from '../constants/routes';
import useOrders from '../hooks/useOrders';
import EnhancedHeader from '../components/EnhancedHeader';

const { width } = Dimensions.get('window');

const statusColors = {
  delivered: 'bg-green-100 text-green-700',
  out_for_delivery: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-700',
};

//const { orders, loading: ordersLoading, fetchOrders } = useOrders();
function StatusBadge({ status }) {
  const color = getStatusColor(status);
  const statusText = getStatusText(status);

  const getStatusStyle = (status) => {
    const styles = {
      delivered: { backgroundColor: '#10b981', shadowColor: '#10b981' },
      out_for_delivery: { backgroundColor: '#3b82f6', shadowColor: '#3b82f6' },
      pending: { backgroundColor: '#f59e0b', shadowColor: '#f59e0b' },
      processing: { backgroundColor: '#f97316', shadowColor: '#f97316' },
      cancelled: { backgroundColor: '#ef4444', shadowColor: '#ef4444' },
      default: { backgroundColor: '#6b7280', shadowColor: '#6b7280' },
    };
    return styles[status] || styles.default;
  };

  // const handleCallCustomer = (phone) => {
  //   if (!phone) return;
  //   Linking.openURL(`tel:${phone}`);
  // };

  const statusStyle = getStatusStyle(status);

  return (
    <View
      style={{
        ...statusStyle,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
        elevation: 2,
      }}
      className="px-2 py-1 rounded-full self-start"
    >
      <Text className="text-xs font-bold text-white capitalize">{statusText}</Text>
    </View>
  );
}

function PaymentIcon({ method }) {
  let icon = 'credit-card';
  let color = '#3b82f6';

  if (method === 'cash_on_delivery') {
    icon = 'cash';
    color = '#10b981';
  } else if (method === 'debit_card') {
    icon = 'credit-card-outline';
    color = '#8b5cf6';
  } else if (method === 'upi') {
    icon = 'bank-transfer';
    color = '#f59e0b';
  }

  return <MaterialCommunityIcons name={icon} size={16} color={color} style={{ marginRight: 4 }} />;
}

function OrderCard({ item, navigation, onViewRoute }) {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCallCustomer = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    // Format phone number as +91 XXXXX XXXXX or similar
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };



  const handleSendOTP = () => {
    navigation.navigate(routes.OTP_VERIFICATION, {
      orderId: item._id,
      customerPhone: item.customerPhone || item.customer?.phone,
      customerName: item.customerName || item.customer?.name
    });
  };

  return (
    <Animated.View
      style={{
        opacity: cardAnim,
        transform: [
          {
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            })
          },
          { scale: scaleAnim }
        ]
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}
      >
        <View className="bg-white rounded-2xl shadow-md p-4 mb-3 border border-gray-50 w-full max-w-xl self-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Header Section - Compact */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">
                Order ID: {item.orderId}
              </Text>
              <Text className="text-xs text-gray-500">
                {formatDate(item.createdAt || item.orderDate)}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>

          {/* Customer Contact Info - NEW SECTION */}
          {(item.customerPhone || item.customer?.phone) && (
            <View className="bg-purple-50 rounded-xl p-3 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <MaterialCommunityIcons name="phone" size={14} color="#8b5cf6" />
                    <Text className="ml-2 text-xs text-gray-500">Customer Phone</Text>
                    {item.customer?.phone}
                  </View>
                  <Text className="font-bold text-gray-800 text-sm">
                    {formatPhoneNumber(item.customerPhone || item.customer?.phone)}
                  </Text>
                  {(item.customerName || item.customer?.name) && (
                    <Text className="text-xs text-gray-600 mt-1">
                      {item.customerName || item.customer?.name}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  className="bg-purple-500 rounded-full p-2"
                  onPress={() => {
                   handleCallCustomer(item.customer?.phone)
                  }}
                  style={{
                    shadowColor: '#8b5cf6',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                >
                  <MaterialCommunityIcons name="phone" size={16} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Amount & Payment Row - Consolidated */}
          <View className="bg-emerald-50 rounded-xl p-3 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-xl font-bold text-emerald-600">
                  {formatCurrency(item.totalAmount)}
                </Text>
                <View className="flex-row items-center mt-1">
                  <PaymentIcon method={item.paymentMethod} />
                  <Text className="text-xs text-gray-600 capitalize">
                    {item.paymentMethod?.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>
              <View className="bg-white rounded-full p-2">
                <MaterialCommunityIcons name="currency-inr" size={20} color="#10b981" />
              </View>
            </View>
          </View>

          {/* Info Grid - Compact 2x2 Layout */}
          <View className="bg-gray-50 rounded-xl p-3 mb-3">
            <View className="flex-row">
              {/* Left Column */}
              <View className="flex-1 pr-2">
                {/* Delivery Date */}
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons name="calendar-clock" size={14} color="#3b82f6" />
                  <View className="ml-2 flex-1">
                    <Text className="text-xs text-gray-500">Delivery</Text>
                    <Text className="font-semibold text-gray-800 text-xs">
                      {formatDate(item.estimatedDeliveryDate)}
                    </Text>
                  </View>
                </View>

                {/* Express Delivery */}
                {item.isExpressDelivery !== undefined && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name={item.isExpressDelivery ? "flash" : "truck"}
                      size={14}
                      color={item.isExpressDelivery ? "#f59e0b" : "#6b7280"}
                    />
                    <View className="ml-2 flex-1">
                      <Text className="text-xs text-gray-500">Type</Text>
                      <Text className="font-semibold text-gray-800 text-xs">
                        {item.isExpressDelivery ? 'Express' : 'Standard'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Right Column */}
              <View className="flex-1 pl-2">
                {/* Payment Status */}
                {(item.paymentStatus || item.status === 'delivered') && (
                  <View className="flex-row items-center mb-2">
                    <MaterialCommunityIcons name="check-circle" size={14} color="#10b981" />
                    <View className="ml-2 flex-1">
                      <Text className="text-xs text-gray-500">Payment</Text>
                      <Text className="font-semibold text-gray-800 text-xs capitalize">
                        {item.status === 'delivered' ? 'paid' : item.paymentStatus}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Items Count */}
                {item.items && (
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="package-variant" size={14} color="#8b5cf6" />
                    <View className="ml-2 flex-1">
                      <Text className="text-xs text-gray-500">Items</Text>
                      <Text className="font-semibold text-gray-800 text-xs">
                        {item.items.length} item{item.items.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Address - Compact (only if exists) */}
          {item.deliveryAddress && (
            <View className="bg-blue-50 rounded-xl p-3 mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="map-marker" size={14} color="#3b82f6" />
                <Text className="ml-2 text-xs text-gray-700 flex-1" numberOfLines={1}>
                  {item.deliveryAddress.street}, {item.deliveryAddress.city}
                </Text>
              </View>
            </View>
          )}

          {/* Notes - Compact (only if exists) */}
          {item.notes && (
            <View className="bg-amber-50 rounded-xl p-3 mb-3">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="note-text" size={14} color="#f59e0b" />
                <Text className="ml-2 text-xs text-gray-700 flex-1 italic" numberOfLines={2}>
                  {item.notes}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons - Compact */}
          {/* <View className="flex-row space-x-2 mt-1">
            <TouchableOpacity
              className="flex-1 bg-emerald-500 rounded-xl py-2.5 flex-row items-center justify-center"
              onPress={() => navigation.navigate('Feedback', { orderId: item._id })}
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <MaterialCommunityIcons name="star" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="text-white font-bold text-xs">Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onViewRoute(item.deliveryAddress)}
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
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 rounded-xl py-2.5 flex-row items-center justify-center"
              onPress={handleSendOTP}
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <MaterialCommunityIcons name="message-text" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="text-white font-bold text-xs">Verify Delivery</Text>
            </TouchableOpacity>
          </View> */}
          <View className="flex-row space-x-2 mt-1">
            {/* Route Button - 50% width */}
            <TouchableOpacity
              onPress={() => onViewRoute(item.deliveryAddress)}
              className="flex-1 bg-blue-500 rounded-xl py-2.5 flex-row items-center justify-center mx-0.5"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="navigate" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="text-white font-bold text-xs">Route</Text>
            </TouchableOpacity>

            {/* Verify Delivery Button - 50% width */}
            <TouchableOpacity
              onPress={handleSendOTP}
              className="flex-1 bg-green-600 rounded-xl py-2.5 flex-row items-center justify-center mx-0.5"
              style={{
                shadowColor: '#4f46e5',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <MaterialCommunityIcons name="message-text" size={16} color="white" style={{ marginRight: 4 }} />
              <Text className="text-white font-bold text-xs">Verify</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
// Improved View Route handler (same as in DashboardScreen)
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
      [addressObj.street, addressObj.city, addressObj.state].filter(Boolean).join(', ')
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
    addressObj.street,
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

function StatusFilter({ filter, onFilterPress, selectedStatus }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isSelected = selectedStatus === filter.key;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onFilterPress(filter.key)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`px-4 py-2.5 rounded-2xl mr-3 ${isSelected ? 'bg-emerald-500' : 'bg-white'}`}
        style={{
          shadowColor: isSelected ? '#10b981' : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.2 : 0.08,
          shadowRadius: 3,
          elevation: isSelected ? 4 : 2,
          borderWidth: isSelected ? 0 : 1,
          borderColor: '#e5e7eb',
        }}
      >
        <View className="flex-row items-center">
          <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
            {filter.label}
          </Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${isSelected ? 'bg-white bg-opacity-20' : 'bg-emerald-100'}`}>
            <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
              {filter.count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function OrdersScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, processing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Status filter tabs
  const statusFilters = [
    { key: 'all', label: 'All', count: statusCounts.all },
    ...Object.keys(statusCounts)
      .filter((key) => key !== 'all')
      .map((key) => ({
        key,
        label: getStatusText(key),
        count: statusCounts[key],
      })),
  ];

  const handleCallCustomer = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  // Add this array for the filter tabs
  const orderTabs = [
    { key: 'MyOrders', label: 'My Orders', screen: routes.ORDERS },
    { key: 'AvailableOrders', label: 'Available Orders', screen: routes.AVAILABLE_ORDERS },
    //{ key: 'OrderHistory', label: 'Order History', screen: routes.ORDER_HISTORY },
  ];

  const fetchStatusCounts = async () => {
    try {
      const response = await ordersAPI.getOrderStatusCounts();
      setStatusCounts({ ...response.data.data, all: Object.values(response.data.data).reduce((a, b) => a + b, 0) });
    } catch (error) {
      console.error('Error fetching status counts:', error);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setIsLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        // Add populate parameter to include customer details
        populate: 'customer'
      };

      // For My Orders tab, fetch all orders and filter by status
      if (selectedStatus === 'all') {
        // Fetch all orders and filter for delivered and out_for_delivery
        const response = await ordersAPI.getOrders(params);
        console.log('API returned orders:', response.data.data.orders); // Debug log
        const allOrders = response.data.data.orders.filter(order => {
          const status = order.deliveryAssociate?.status || order.status;
          return status === 'delivered' || status === 'out_for_delivery'; // Both delivered and out_for_delivery
        });
        // Sort by creation date (newest first)
        const sortedOrders = allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.assignedAt || 0);
          const dateB = new Date(b.createdAt || b.assignedAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        if (page === 1) {
          setOrders(sortedOrders);
          console.log('Fetched delivered and out_for_delivery orders:', sortedOrders);
        } else {
          setOrders((prev) => [...prev, ...sortedOrders]);
        }
        // Use the pagination from the response
        setPagination(response.data.data.pagination);
      } else {
        // If a specific status is selected, use that
        params.status = selectedStatus;
        const response = await ordersAPI.getOrders(params);
        const { orders: fetchedOrders, pagination: paginationData } = response.data.data;

        // Sort by creation date (newest first)
        const sortedFetchedOrders = fetchedOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.assignedAt || 0);
          const dateB = new Date(b.createdAt || b.assignedAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });

        if (page === 1) {
          setOrders(sortedFetchedOrders);
          console.log('Fetched orders with status:', selectedStatus, sortedFetchedOrders);
        } else {
          setOrders((prev) => [...prev, ...sortedFetchedOrders]);
        }
        setPagination(paginationData);
      }

      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    await fetchOrders(1);
    await fetchStatusCounts();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages && !isLoading) {
      fetchOrders(pagination.page + 1);
    }
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fadeAnim.setValue(0);
    fetchOrders(1);
    fetchStatusCounts();
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  const handleOrderPress = (orderId) => {
    nav.navigate(routes.ORDER_DETAILS, { orderId });
  };

  useEffect(() => {
    fetchOrders(1);
    fetchStatusCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#10b981" />
      <EnhancedHeader title="My Orders" onBackPress={() => nav.goBack()} />

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
                    nav.navigate(tab.screen);
                  } else if (tab.screen === routes.AVAILABLE_ORDERS) {
                    nav.navigate('AvailableOrders');
                  } else {
                    nav.navigate(routes.MAIN, { screen: tab.screen });
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

      {/* Orders List */}
      <FlatList
        ref={flatListRef}
        data={orders}
        keyExtractor={(item) => item._id}

        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleOrderPress(item._id)}>
            <OrderCard
              item={item}
              navigation={nav}
              onViewRoute={handleViewRoute} // Add this prop
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 16, paddingTop: 12 }}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-20">
            <MaterialCommunityIcons name="package-variant-closed" size={48} color="#d1d5db" />
            <Text className="text-center text-gray-500 mt-3 text-base font-medium">No orders yet</Text>
            <Text className="text-center text-gray-400 mt-1 text-sm">Your orders will appear here</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#10b981"]}
            tintColor="#10b981"
            progressBackgroundColor="#f0fdf4"
          />
        }
        ListFooterComponent={isLoading && pagination.page > 1 ? (
          <View className="py-4 items-center">
            <View className="bg-white rounded-xl p-3 shadow-sm flex-row items-center">
              <View className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse mr-2"></View>
              <Text className="text-gray-600 text-sm">Loading...</Text>
            </View>
          </View>
        ) : null}
      />
    </View>
  );
}
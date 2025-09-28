import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import routes from '../constants/routes';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import OrdersScreen from '../screens/OrdersScreen';
import EarningsScreen from '../screens/EarningsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const iconMap = {
  [routes.DASHBOARD]: ['home-outline', 'home'],
  [routes.ORDERS]: ['list-outline', 'list'],
  [routes.EARNINGS]: ['wallet-outline', 'wallet'],
  [routes.PROFILE]: ['person-outline', 'person'],
  [routes.SETTINGS]: ['settings-outline', 'settings'],
  [routes.AVAILABLE_ORDERS]: ['cube-outline', 'cube'], // NEW
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName={routes.DASHBOARD}
      screenOptions={({ route }) => {
        const [outline, filled] = iconMap[route.name] || ['ellipse-outline', 'ellipse'];
        return {
          headerShown: false,
          tabBarActiveTintColor: '#059669',
          tabBarInactiveTintColor: 'gray',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? filled : outline} size={size} color={color} />
          ),
        };
      }}
    >
      <Tab.Screen name={routes.DASHBOARD} component={DashboardScreen} />
      {/* <Tab.Screen name={routes.AVAILABLE_ORDERS} component={AvailableOrdersScreen} /> */}
      <Tab.Screen name={routes.ORDERS} component={OrdersScreen} />
      <Tab.Screen name={routes.EARNINGS} component={EarningsScreen} />
      <Tab.Screen name={routes.PROFILE} component={ProfileScreen} />
      {/* <Tab.Screen name={routes.SETTINGS} component={SettingsScreen} /> */}
    </Tab.Navigator>
  );
}

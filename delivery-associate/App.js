import { StatusBar } from 'expo-status-bar';

import './global.css';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import routes from './constants/routes';

// Screens
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OTPScreen from './screens/OTPScreen';
import BottomTabs from './navigation/BottomTabs';
// individual screens imported by BottomTabs
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { EarningsProvider } from './context/EarningsContext';
// Import new screens
import NotificationsScreen from './screens/NotificationsScreen';
import HelpScreen from './screens/HelpScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
// import SupportScreen from './screens/SupportScreen';
import FeedbackScreen from './screens/FeedbackScreen';
import ProofUploadScreen from './screens/ProofUploadScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import UploadDocumentsScreen from './screens/UploadDocumentsScreen';
import AvailableOrdersScreen from './screens/AvailableOrdersScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <EarningsProvider>
        <OrderProvider>
          <NavigationContainer>
              <Stack.Navigator initialRouteName={routes.SPLASH} screenOptions={{ headerShown: false }}>
                <Stack.Screen name={routes.SPLASH} component={SplashScreen} />
                <Stack.Screen name={routes.LOGIN} component={LoginScreen} />
                <Stack.Screen name={routes.OTP} component={OTPScreen} />
                <Stack.Screen name={routes.MAIN} component={BottomTabs} />
                {/* Add new screens here */}
                <Stack.Screen name={routes.NOTIFICATIONS} component={NotificationsScreen} />
                <Stack.Screen name={routes.HELP} component={HelpScreen} />
                <Stack.Screen name={routes.CHANGE_PASSWORD} component={ChangePasswordScreen} />
                <Stack.Screen name={routes.FEEDBACK} component={FeedbackScreen} />
                <Stack.Screen name={routes.PROOF_UPLOAD} component={ProofUploadScreen} />
                <Stack.Screen name={routes.OTP_VERIFICATION} component={OTPVerificationScreen} />
                <Stack.Screen name={routes.SETTINGS} component={SettingsScreen} />
                <Stack.Screen name={routes.UPLOAD_DOCUMENTS} component={UploadDocumentsScreen} />
                <Stack.Screen name={routes.AVAILABLE_ORDERS} component={AvailableOrdersScreen} />
                <Stack.Screen name={routes.ORDER_DETAILS} component={OrderDetailsScreen} />
              </Stack.Navigator>
            <StatusBar style="dark" />
            </NavigationContainer>
        </OrderProvider>
      </EarningsProvider>
    </AuthProvider>
  );
}

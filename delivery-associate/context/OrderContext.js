// OrderContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import CONFIG from '../constants/config';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${CONFIG.API_BASE_URL}/delivery-associates/orders`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      setOrders(data.data.orders);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <OrderContext.Provider value={{ orders, loading, fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);

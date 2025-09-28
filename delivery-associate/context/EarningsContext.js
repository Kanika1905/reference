import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const EarningsContext = createContext();

export const EarningsProvider = ({ children }) => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState(null);
  const [allTimeEarnings, setAllTimeEarnings] = useState(null);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEarnings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/delivery-associates/earnings?period=weekly', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEarnings(data.data);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch earnings');
      setEarnings(null);
    }
    setLoading(false);
  }, [user]);

  const fetchAllTimeEarnings = useCallback(async () => {
    if (!user) return;
    try {
      // Fetch all orders to calculate total earnings
      const { data } = await api.get('/delivery-associates/orders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      
      const allOrders = data.data.orders || [];
      
      // Calculate total earnings from all delivered orders
      const totalEarnings = allOrders
        .filter(order => order.status === 'delivered')
        .reduce((total, order) => {
          return total + (order.deliveryCharge || 0);
        }, 0);
      
      setAllTimeEarnings(totalEarnings);
    } catch (e) {
      console.error('Error fetching all-time earnings:', e);
      setAllTimeEarnings(0);
    }
  }, [user]);

  const fetchPayoutRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/delivery-associates/profile', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPayoutRequests(data.data.deliveryAssociate.payoutRequests || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to fetch payout requests');
      setPayoutRequests([]);
    }
    setLoading(false);
  }, [user]);

  const requestPayout = async (amount) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await api.post(
        '/delivery-associates/payout',
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      await fetchEarnings();
      await fetchAllTimeEarnings();
      await fetchPayoutRequests();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to request payout');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchEarnings();
      fetchAllTimeEarnings();
      fetchPayoutRequests();
    }
  }, [user, fetchEarnings, fetchAllTimeEarnings, fetchPayoutRequests]);

  return (
    <EarningsContext.Provider value={{ earnings, allTimeEarnings, payoutRequests, loading, error, fetchEarnings, fetchAllTimeEarnings, fetchPayoutRequests, requestPayout }}>
      {children}
    </EarningsContext.Provider>
  );
};

export const useEarnings = () => useContext(EarningsContext);
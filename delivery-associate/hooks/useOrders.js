// useOrders.js
import { useOrders as useOrdersCtx } from '../context/OrderContext';

export default function useOrders() {
  return useOrdersCtx();
}

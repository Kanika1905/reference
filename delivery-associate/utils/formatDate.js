// formatDate.js
export default function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function getStatusColor(status) {
  switch (status) {
    case 'pending': return '#facc15'; // yellow-400
    case 'processing': return '#fb923c'; // orange-400
    case 'out_for_delivery': return '#3b82f6'; // blue-500
    case 'delivered': return '#22c55e'; // green-500
    case 'cancelled': return '#ef4444'; // red-500
    default: return '#6b7280'; // gray-500
  }
}

export function getStatusText(status) {
  switch (status) {
    case 'pending': return 'Pending';
    case 'processing': return 'Processing';
    case 'out_for_delivery': return 'Out for Delivery';
    case 'delivered': return 'Delivered';
    case 'cancelled': return 'Cancelled';
    default: return status;
  }
}

// validatePhone.js
export default function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}

/**
 * Formats a numeric amount to Indian Rupee (INR) currency string with ₹ symbol.
 * Uses the JavaScript Intl.NumberFormat API.
 * Example outputs: ₹499, ₹1,299, ₹18,999, ₹1,25,000
 */
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};


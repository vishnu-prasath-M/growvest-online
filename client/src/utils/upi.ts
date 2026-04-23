/**
 * UPI Link Generator Utility
 * Provides consistent UPI link generation across the application
 */

/**
 * Generates a UPI payment link with consistent format
 * @param upiId - UPI ID of the recipient
 * @param amount - Amount to be paid
 * @param transactionNote - Optional transaction note/reference
 * @param payeeName - Name of the payee (defaults to "Growvest")
 * @returns Formatted UPI link string
 */
export const generateUPILink = (
  upiId: string = "q751029321@ybl",
  amount: number | string,
  transactionId?: string,
  payeeName: string = "Growvest"
): string => {
  // Validate inputs
  if (!upiId || !amount) {
    throw new Error('UPI ID and amount are required');
  }

  // Convert amount to number and validate
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Invalid amount provided');
  }

  // Generate a transaction ID if not provided
  const txnId = transactionId || `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Merchant style link: upi://pay?pa=q751029321@ybl&pn=Growvest&mc=0000&tid={txnId}&tr={txnId}&tn=Investment&am={amount}&cu=INR
  // Use direct string to avoid URL encoding issues in some UPI apps (like %40 for @)
  const upiLink = `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(payeeName)}&mc=0000&tid=${txnId}&tr=${txnId}&tn=Investment&am=${numericAmount}&cu=INR`;

  return upiLink;
};

/**
 * Validates UPI ID format
 * @param upiId - UPI ID to validate
 * @returns True if valid, false otherwise
 */
export const validateUPIId = (upiId: string): boolean => {
  if (!upiId || typeof upiId !== 'string') return false;
  
  // Basic UPI ID validation (username@provider)
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
  return upiRegex.test(upiId.trim());
};

/**
 * Validates amount for UPI payment
 * @param amount - Amount to validate
 * @returns True if valid, false otherwise
 */
export const validateAmount = (amount: number | string): boolean => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numericAmount) && numericAmount > 0 && numericAmount <= 100000; // Max 1 lakh for safety
};

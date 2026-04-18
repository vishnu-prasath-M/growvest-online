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
  upiId: string,
  amount: number | string,
  transactionNote?: string,
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

  // Build UPI link with consistent format
  const params = new URLSearchParams({
    pa: upiId.trim(),
    pn: payeeName,
    am: numericAmount.toString(),
    cu: 'INR'
  });

  // Add transaction note if provided
  if (transactionNote) {
    params.append('tn', transactionNote);
  }

  return `upi://pay?${params.toString()}`;
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

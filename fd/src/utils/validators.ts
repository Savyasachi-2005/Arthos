/**
 * Validation utility functions
 */

/**
 * Validate if text contains potential transaction data
 */
export const hasTransactionData = (text: string): boolean => {
  if (!text || text.trim().length === 0) return false;
  
  // Check for common transaction keywords
  const keywords = [
    'rs', 'inr', '₹', 'paid', 'debited', 'credited',
    'transaction', 'payment', 'upi', 'amount'
  ];
  
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword));
};

/**
 * Validate raw text input
 */
export const validateRawText = (text: string): { 
  valid: boolean; 
  error?: string;
} => {
  if (!text || text.trim().length === 0) {
    return {
      valid: false,
      error: 'Please paste some SMS messages to analyze',
    };
  }
  
  if (text.length < 10) {
    return {
      valid: false,
      error: 'Text is too short. Please paste valid transaction messages',
    };
  }
  
  if (text.length > 50000) {
    return {
      valid: false,
      error: 'Text is too long. Maximum 50,000 characters allowed',
    };
  }
  
  return { valid: true };
};

/**
 * Check if amount is valid
 */
export const isValidAmount = (amount: number): boolean => {
  return !isNaN(amount) && amount > 0 && isFinite(amount);
};

/**
 * Validate query parameters
 */
export const validateQueryParams = (params: {
  min_amount?: number;
  max_amount?: number;
}): { valid: boolean; error?: string } => {
  if (params.min_amount !== undefined && params.min_amount < 0) {
    return {
      valid: false,
      error: 'Minimum amount cannot be negative',
    };
  }
  
  if (params.max_amount !== undefined && params.max_amount < 0) {
    return {
      valid: false,
      error: 'Maximum amount cannot be negative',
    };
  }
  
  if (
    params.min_amount !== undefined &&
    params.max_amount !== undefined &&
    params.min_amount > params.max_amount
  ) {
    return {
      valid: false,
      error: 'Minimum amount cannot be greater than maximum amount',
    };
  }
  
  return { valid: true };
};

/**
 * Sanitize text input
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

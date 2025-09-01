/**
 * Common validation rules and functions for form validation
 */

// Email validation regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number validation regex (flexible format)
export const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;

// Credit card validation regex (basic format check)
export const CREDIT_CARD_REGEX = /^[0-9]{13,19}$/;

// CVV validation regex
export const CVV_REGEX = /^[0-9]{3,4}$/;

// Postal code validation regex (flexible international)
export const POSTAL_CODE_REGEX = /^[A-Za-z0-9\s\-]{3,10}$/;

/**
 * Validation rule sets for different form types
 */

// Payment form validation rules
export const PAYMENT_FORM_RULES = {
  cardNumber: {
    required: true,
    requiredMessage: 'Card number is required',
    pattern: CREDIT_CARD_REGEX,
    patternMessage: 'Please enter a valid card number',
    custom: (value) => {
      // Luhn algorithm for credit card validation
      const cleanValue = value.replace(/\s/g, '');
      if (cleanValue.length < 13) return 'Card number must be at least 13 digits';
      if (!luhnCheck(cleanValue)) return 'Invalid card number';
      return '';
    }
  },
  expiryDate: {
    required: true,
    requiredMessage: 'Expiry date is required',
    pattern: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
    patternMessage: 'Please enter date in MM/YY format',
    custom: (value) => {
      const [month, year] = value.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiry < now) return 'Card has expired';
      return '';
    }
  },
  cvv: {
    required: true,
    requiredMessage: 'CVV is required',
    pattern: CVV_REGEX,
    patternMessage: 'CVV must be 3 or 4 digits'
  },
  cardholderName: {
    required: true,
    requiredMessage: 'Cardholder name is required',
    minLength: 2,
    minLengthMessage: 'Name must be at least 2 characters',
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    patternMessage: 'Name can only contain letters and spaces'
  },
  billingAddress: {
    required: true,
    requiredMessage: 'Billing address is required',
    minLength: 5,
    minLengthMessage: 'Address must be at least 5 characters'
  },
  city: {
    required: true,
    requiredMessage: 'City is required',
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
    patternMessage: 'City can only contain letters and spaces'
  },
  postalCode: {
    required: true,
    requiredMessage: 'Postal code is required',
    pattern: POSTAL_CODE_REGEX,
    patternMessage: 'Please enter a valid postal code'
  },
  email: {
    required: true,
    email: true,
    emailMessage: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    pattern: PHONE_REGEX,
    patternMessage: 'Please enter a valid phone number'
  },
  amount: {
    required: true,
    requiredMessage: 'Amount is required',
    custom: (value) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Amount must be a valid number';
      if (numValue <= 0) return 'Amount must be greater than 0';
      if (numValue > 10000) return 'Amount cannot exceed $10,000';
      return '';
    }
  }
};

// Student registration form validation rules
export const STUDENT_FORM_RULES = {
  firstName: {
    required: true,
    requiredMessage: 'First name is required',
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-Z\s]+$/,
    patternMessage: 'Name can only contain letters and spaces'
  },
  lastName: {
    required: true,
    requiredMessage: 'Last name is required',
    minLength: 2,
    maxLength: 30,
    pattern: /^[a-zA-Z\s]+$/,
    patternMessage: 'Name can only contain letters and spaces'
  },
  email: {
    required: true,
    email: true,
    emailMessage: 'Please enter a valid email address'
  },
  phone: {
    required: true,
    pattern: PHONE_REGEX,
    patternMessage: 'Please enter a valid phone number'
  },
  dateOfBirth: {
    required: true,
    requiredMessage: 'Date of birth is required',
    custom: (value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 16) return 'Must be at least 16 years old';
      if (age > 100) return 'Please enter a valid date of birth';
      return '';
    }
  },
  licenseNumber: {
    pattern: /^[A-Za-z0-9\-]{5,20}$/,
    patternMessage: 'License number format is invalid'
  }
};

// Admin payment recording form validation rules
export const ADMIN_PAYMENT_RULES = {
  studentId: {
    required: true,
    requiredMessage: 'Please select a student'
  },
  amount: {
    required: true,
    requiredMessage: 'Amount is required',
    custom: (value) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Amount must be a valid number';
      if (numValue <= 0) return 'Amount must be greater than 0';
      if (numValue > 10000) return 'Amount cannot exceed $10,000';
      return '';
    }
  },
  paymentMethod: {
    required: true,
    requiredMessage: 'Payment method is required'
  },
  paymentDate: {
    required: true,
    requiredMessage: 'Payment date is required',
    custom: (value) => {
      const paymentDate = new Date(value);
      const today = new Date();
      if (paymentDate > today) return 'Payment date cannot be in the future';
      return '';
    }
  },
  notes: {
    maxLength: 500,
    maxLengthMessage: 'Notes cannot exceed 500 characters'
  }
};

// Pricing management form validation rules
export const PRICING_FORM_RULES = {
  packageName: {
    required: true,
    requiredMessage: 'Package name is required',
    minLength: 3,
    maxLength: 50
  },
  price: {
    required: true,
    requiredMessage: 'Price is required',
    custom: (value) => {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 'Price must be a valid number';
      if (numValue <= 0) return 'Price must be greater than 0';
      if (numValue > 50000) return 'Price cannot exceed $50,000';
      return '';
    }
  },
  lessonsIncluded: {
    required: true,
    requiredMessage: 'Number of lessons is required',
    custom: (value) => {
      const numValue = parseInt(value);
      if (isNaN(numValue)) return 'Number of lessons must be a valid number';
      if (numValue < 1) return 'Must include at least 1 lesson';
      if (numValue > 100) return 'Cannot exceed 100 lessons';
      return '';
    }
  },
  description: {
    required: true,
    requiredMessage: 'Description is required',
    minLength: 10,
    maxLength: 500
  }
};

// Refund form validation rules
export const REFUND_FORM_RULES = {
  refundAmount: {
    required: true,
    requiredMessage: 'Refund amount is required',
    custom: (value, allValues) => {
      const numValue = parseFloat(value);
      const originalAmount = parseFloat(allValues.originalAmount || 0);
      
      if (isNaN(numValue)) return 'Refund amount must be a valid number';
      if (numValue <= 0) return 'Refund amount must be greater than 0';
      if (numValue > originalAmount) return 'Refund amount cannot exceed original payment';
      return '';
    }
  },
  refundReason: {
    required: true,
    requiredMessage: 'Refund reason is required'
  },
  refundNotes: {
    maxLength: 500,
    maxLengthMessage: 'Notes cannot exceed 500 characters'
  }
};

/**
 * Luhn algorithm for credit card validation
 * @param {string} cardNumber - Credit card number
 * @returns {boolean} - Valid card number
 */
export const luhnCheck = (cardNumber) => {
  const digits = cardNumber.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i];

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Format credit card number with spaces
 * @param {string} value - Raw card number
 * @returns {string} - Formatted card number
 */
export const formatCardNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/(\d{1,4})/g);
  return match ? match.join(' ').substr(0, 19) : '';
};

/**
 * Format expiry date as MM/YY
 * @param {string} value - Raw expiry date
 * @returns {string} - Formatted expiry date
 */
export const formatExpiryDate = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

/**
 * Format phone number
 * @param {string} value - Raw phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return value;
};

export default {
  PAYMENT_FORM_RULES,
  STUDENT_FORM_RULES,
  ADMIN_PAYMENT_RULES,
  PRICING_FORM_RULES,
  REFUND_FORM_RULES,
  luhnCheck,
  formatCardNumber,
  formatExpiryDate,
  formatPhoneNumber
};
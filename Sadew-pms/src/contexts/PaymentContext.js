import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Initial payment state
const initialPaymentState = {
  currentTransaction: null,
  paymentHistory: [],
  pendingPayments: [],
  pricing: {
    pricePerLesson: 50,
    pricePerDay: 20
  },
  invoices: [],
  refunds: [],
  isLoading: false,
  error: null,
  filters: {
    dateRange: null,
    status: 'all',
    method: 'all'
  }
};

// Payment action types
const PAYMENT_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Transaction actions
  START_PAYMENT: 'START_PAYMENT',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILURE: 'PAYMENT_FAILURE',
  
  // History actions
  LOAD_PAYMENT_HISTORY: 'LOAD_PAYMENT_HISTORY',
  ADD_PAYMENT_RECORD: 'ADD_PAYMENT_RECORD',
  UPDATE_PAYMENT_STATUS: 'UPDATE_PAYMENT_STATUS',
  
  // Pricing actions
  LOAD_PRICING: 'LOAD_PRICING',
  UPDATE_PRICING: 'UPDATE_PRICING',
  
  // Invoice actions
  LOAD_INVOICES: 'LOAD_INVOICES',
  CREATE_INVOICE: 'CREATE_INVOICE',
  UPDATE_INVOICE: 'UPDATE_INVOICE',
  
  // Refund actions
  LOAD_REFUNDS: 'LOAD_REFUNDS',
  PROCESS_REFUND: 'PROCESS_REFUND',
  
  // Filter actions
  SET_FILTERS: 'SET_FILTERS',
  RESET_FILTERS: 'RESET_FILTERS'
};

// Payment reducer
function paymentReducer(state, action) {
  switch (action.type) {
    case PAYMENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case PAYMENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case PAYMENT_ACTIONS.START_PAYMENT:
      return {
        ...state,
        currentTransaction: action.payload,
        isLoading: true,
        error: null
      };
    
    case PAYMENT_ACTIONS.PAYMENT_SUCCESS:
      return {
        ...state,
        currentTransaction: null,
        paymentHistory: [action.payload, ...state.paymentHistory],
        isLoading: false,
        error: null
      };
    
    case PAYMENT_ACTIONS.PAYMENT_FAILURE:
      return {
        ...state,
        currentTransaction: null,
        isLoading: false,
        error: action.payload
      };
    
    case PAYMENT_ACTIONS.LOAD_PAYMENT_HISTORY:
      return {
        ...state,
        paymentHistory: action.payload,
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.ADD_PAYMENT_RECORD:
      return {
        ...state,
        paymentHistory: [action.payload, ...state.paymentHistory],
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.UPDATE_PAYMENT_STATUS:
      return {
        ...state,
        paymentHistory: state.paymentHistory.map(payment =>
          payment.id === action.payload.id
            ? { ...payment, status: action.payload.status }
            : payment
        )
      };
    
    case PAYMENT_ACTIONS.LOAD_PRICING:
      return {
        ...state,
        pricing: action.payload,
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.UPDATE_PRICING:
      return {
        ...state,
        pricing: action.payload
      };
    
    case PAYMENT_ACTIONS.LOAD_INVOICES:
      return {
        ...state,
        invoices: action.payload,
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.CREATE_INVOICE:
      return {
        ...state,
        invoices: [action.payload, ...state.invoices],
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.UPDATE_INVOICE:
      return {
        ...state,
        invoices: state.invoices.map(invoice =>
          invoice.id === action.payload.id ? action.payload : invoice
        )
      };
    
    case PAYMENT_ACTIONS.LOAD_REFUNDS:
      return {
        ...state,
        refunds: action.payload,
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.PROCESS_REFUND:
      return {
        ...state,
        refunds: [action.payload, ...state.refunds],
        paymentHistory: state.paymentHistory.map(payment =>
          payment.id === action.payload.originalPaymentId
            ? { ...payment, status: 'refunded', refundId: action.payload.id }
            : payment
        ),
        isLoading: false
      };
    
    case PAYMENT_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case PAYMENT_ACTIONS.RESET_FILTERS:
      return {
        ...state,
        filters: initialPaymentState.filters
      };
    
    default:
      return state;
  }
}

// Create context
const PaymentContext = createContext();

// Custom hook to use payment context
export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

// Payment provider component
export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  
  // Process online payment
  const processPayment = useCallback(async (paymentData) => {
    dispatch({ type: PAYMENT_ACTIONS.START_PAYMENT, payload: paymentData });
    
    try {
      // Simulate payment gateway API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock payment processing
      const transaction = {
        id: `txn_${Date.now()}`,
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'completed',
        studentId: paymentData.studentId,
        pricingType: paymentData.pricingType, // 'lesson' or 'day'
        quantity: paymentData.quantity,
        transactionDate: new Date().toISOString(),
        gatewayTransactionId: `gw_${Date.now()}`,
        description: paymentData.description || 'Online payment'
      };
      
      dispatch({ type: PAYMENT_ACTIONS.PAYMENT_SUCCESS, payload: transaction });
      return transaction;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.PAYMENT_FAILURE, payload: error.message });
      throw error;
    }
  }, []);
  
  // Record manual payment (for admin use)
  const recordManualPayment = useCallback(async (paymentData) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const payment = {
        id: `pay_${Date.now()}`,
        amount: paymentData.amount,
        method: paymentData.method,
        status: 'completed',
        studentId: paymentData.studentId,
        pricingType: paymentData.pricingType,
        quantity: paymentData.quantity,
        transactionDate: paymentData.date || new Date().toISOString(),
        recordedBy: paymentData.recordedBy,
        description: paymentData.description || 'Manual payment',
        receiptNumber: paymentData.receiptNumber
      };
      
      dispatch({ type: PAYMENT_ACTIONS.ADD_PAYMENT_RECORD, payload: payment });
      return payment;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Get payment history
  const loadPaymentHistory = useCallback(async (studentId, filters = {}) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock payment history data
      const mockHistory = [
        {
          id: 'pay_001',
          amount: 100,
          method: 'credit_card',
          status: 'completed',
          studentId: studentId || '1',
          pricingType: 'lesson',
          quantity: 2,
          transactionDate: '2024-01-15T10:30:00Z',
          description: '2 driving lessons',
          gatewayTransactionId: 'gw_12345'
        },
        {
          id: 'pay_002',
          amount: 60,
          method: 'cash',
          status: 'completed',
          studentId: studentId || '1',
          pricingType: 'day',
          quantity: 3,
          transactionDate: '2024-01-10T14:15:00Z',
          description: '3 days access',
          recordedBy: 'admin'
        }
      ];
      
      dispatch({ type: PAYMENT_ACTIONS.LOAD_PAYMENT_HISTORY, payload: mockHistory });
      return mockHistory;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Process refund
  const processRefund = useCallback(async (refundData) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const refund = {
        id: `ref_${Date.now()}`,
        originalPaymentId: refundData.paymentId,
        amount: refundData.amount,
        reason: refundData.reason,
        status: 'processed',
        processedBy: refundData.processedBy,
        processedDate: new Date().toISOString()
      };
      
      dispatch({ type: PAYMENT_ACTIONS.PROCESS_REFUND, payload: refund });
      return refund;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Load pricing
  const loadPricing = useCallback(async () => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPricing = {
        pricePerLesson: 50,
        pricePerDay: 20
      };
      
      dispatch({ type: PAYMENT_ACTIONS.LOAD_PRICING, payload: mockPricing });
      return mockPricing;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Calculate payment amount based on number of lessons or days and price per unit
  const calculatePaymentAmount = useCallback((pricingType, quantity, discountCode) => {
    if (!pricingType || !quantity || quantity <= 0) return 0;
    
    const { pricePerLesson, pricePerDay } = state.pricing;
    
    let amount = 0;
    if (pricingType === 'lesson') {
      amount = pricePerLesson * quantity;
    } else if (pricingType === 'day') {
      amount = pricePerDay * quantity;
    }
    
    // Apply discount if available
    if (discountCode) {
      // This would normally check against valid discount codes
      // For demo purposes, apply a 10% discount for any code
      amount = amount * 0.9;
    }
    
    return amount;
  }, [state.pricing]);
  
  // Create invoice
  const createInvoice = useCallback(async (invoiceData) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const invoice = {
        id: `inv_${Date.now()}`,
        studentId: invoiceData.studentId,
        amount: invoiceData.amount,
        pricingType: invoiceData.pricingType,
        quantity: invoiceData.quantity,
        description: invoiceData.description,
        dueDate: invoiceData.dueDate,
        status: 'pending',
        createdBy: invoiceData.createdBy,
        createdDate: new Date().toISOString()
      };
      
      dispatch({ type: PAYMENT_ACTIONS.CREATE_INVOICE, payload: invoice });
      return invoice;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Update invoice status
  const updateInvoiceStatus = useCallback(async (invoiceId, status) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_LOADING, payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedInvoice = {
        id: invoiceId,
        status
      };
      
      dispatch({ type: PAYMENT_ACTIONS.UPDATE_INVOICE, payload: updatedInvoice });
      return updatedInvoice;
    } catch (error) {
      dispatch({ type: PAYMENT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  }, []);
  
  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: PAYMENT_ACTIONS.SET_FILTERS, payload: filters });
  }, []);
  
  // Reset filters
  const resetFilters = useCallback(() => {
    dispatch({ type: PAYMENT_ACTIONS.RESET_FILTERS });
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: PAYMENT_ACTIONS.CLEAR_ERROR });
  }, []);
  
  return (
    <PaymentContext.Provider
      value={{
        ...state,
        processPayment,
        recordManualPayment,
        loadPaymentHistory,
        loadPricing,
        createInvoice,
        updateInvoiceStatus,
        processRefund,
        calculatePaymentAmount,
        setFilters,
        resetFilters,
        clearError
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
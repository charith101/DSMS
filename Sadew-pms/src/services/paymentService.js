import apiClient from './apiClient';

/**
 * Payment Service
 * Handles all payment-related API operations
 */
class PaymentService {
  constructor(client = apiClient) {
    this.client = client;
    this.baseEndpoint = '/payments';
  }

  /**
   * Process a new payment
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentData) {
    try {
      const response = await this.client.post(`${this.baseEndpoint}/process`, {
        ...paymentData,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        transactionId: response.transactionId,
        amount: response.amount,
        status: response.status,
        message: response.message || 'Payment processed successfully'
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get payment history for a user
   * @param {string} userId - User ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Payment history
   */
  async getPaymentHistory(userId, filters = {}) {
    try {
      const params = {
        userId,
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 20
      };

      const response = await this.client.get(`${this.baseEndpoint}/history`, { params });
      
      return {
        payments: response.data || [],
        pagination: response.pagination || {},
        totalAmount: response.totalAmount || 0,
        summary: response.summary || {}
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get payment details by transaction ID
   * @param {string} transactionId - Transaction ID
   * @returns {Promise<Object>} Payment details
   */
  async getPaymentDetails(transactionId) {
    try {
      const response = await this.client.get(`${this.baseEndpoint}/${transactionId}`);
      return response;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Record manual payment (admin only)
   * @param {Object} paymentData - Manual payment data
   * @returns {Promise<Object>} Recorded payment
   */
  async recordManualPayment(paymentData) {
    try {
      const response = await this.client.post(`${this.baseEndpoint}/manual`, {
        ...paymentData,
        recordedAt: new Date().toISOString(),
        type: 'manual'
      });
      
      return {
        success: true,
        paymentId: response.id,
        message: 'Manual payment recorded successfully'
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Process refund
   * @param {string} transactionId - Original transaction ID
   * @param {Object} refundData - Refund information
   * @returns {Promise<Object>} Refund result
   */
  async processRefund(transactionId, refundData) {
    try {
      const response = await this.client.post(`${this.baseEndpoint}/${transactionId}/refund`, {
        ...refundData,
        refundDate: new Date().toISOString()
      });
      
      return {
        success: true,
        refundId: response.refundId,
        amount: response.amount,
        status: response.status,
        message: 'Refund processed successfully'
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get payment statistics
   * @param {Object} filters - Date range and other filters
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStatistics(filters = {}) {
    try {
      const params = {
        startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: filters.endDate || new Date().toISOString(),
        ...filters
      };

      const response = await this.client.get(`${this.baseEndpoint}/statistics`, { params });
      
      return {
        totalRevenue: response.totalRevenue || 0,
        totalTransactions: response.totalTransactions || 0,
        avgTransactionAmount: response.avgTransactionAmount || 0,
        paymentMethods: response.paymentMethods || {},
        dailyRevenue: response.dailyRevenue || [],
        monthlyRevenue: response.monthlyRevenue || []
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Validate payment method
   * @param {Object} paymentMethod - Payment method details
   * @returns {Promise<Object>} Validation result
   */
  async validatePaymentMethod(paymentMethod) {
    try {
      const response = await this.client.post(`${this.baseEndpoint}/validate`, paymentMethod);
      
      return {
        valid: response.valid || false,
        errors: response.errors || [],
        warnings: response.warnings || []
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get supported payment methods
   * @returns {Promise<Array>} Available payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await this.client.get(`${this.baseEndpoint}/methods`);
      return response.methods || [];
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Cancel pending payment
   * @param {string} transactionId - Transaction ID to cancel
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPayment(transactionId) {
    try {
      const response = await this.client.post(`${this.baseEndpoint}/${transactionId}/cancel`);
      
      return {
        success: true,
        transactionId: response.transactionId,
        status: response.status,
        message: 'Payment cancelled successfully'
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Get outstanding balance for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Outstanding balance details
   */
  async getOutstandingBalance(userId) {
    try {
      const response = await this.client.get(`${this.baseEndpoint}/balance/${userId}`);
      
      return {
        totalOutstanding: response.totalOutstanding || 0,
        overdueAmount: response.overdueAmount || 0,
        upcomingPayments: response.upcomingPayments || [],
        lastPaymentDate: response.lastPaymentDate,
        paymentPlan: response.paymentPlan || null
      };
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Generate payment receipt
   * @param {string} transactionId - Transaction ID
   * @param {string} format - Receipt format (pdf, html)
   * @returns {Promise<Blob>} Receipt file
   */
  async generateReceipt(transactionId, format = 'pdf') {
    try {
      const response = await this.client.download(
        `${this.baseEndpoint}/${transactionId}/receipt`,
        { params: { format } }
      );
      
      return response;
    } catch (error) {
      throw this.handlePaymentError(error);
    }
  }

  /**
   * Handle payment-specific errors
   * @param {Object} error - API error
   * @returns {Object} Formatted error
   */
  handlePaymentError(error) {
    const paymentError = {
      ...error,
      category: 'payment'
    };

    // Map specific payment error codes
    const errorMap = {
      'INSUFFICIENT_FUNDS': 'Insufficient funds in your account',
      'CARD_DECLINED': 'Your card was declined. Please try a different payment method',
      'EXPIRED_CARD': 'Your card has expired. Please update your payment information',
      'INVALID_CARD': 'Invalid card information. Please check your details',
      'PAYMENT_PROCESSING_ERROR': 'Payment processing failed. Please try again',
      'DUPLICATE_TRANSACTION': 'This transaction has already been processed',
      'REFUND_NOT_ALLOWED': 'Refund is not allowed for this transaction',
      'REFUND_AMOUNT_EXCEEDED': 'Refund amount exceeds the original transaction amount'
    };

    if (error.code && errorMap[error.code]) {
      paymentError.message = errorMap[error.code];
    }

    return paymentError;
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();

export default paymentService;
export { PaymentService };
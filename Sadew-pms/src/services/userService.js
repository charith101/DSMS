import apiClient from './apiClient';

/**
 * User Service
 * Handles authentication and user management operations
 */
class UserService {
  constructor(client = apiClient) {
    this.client = client;
    this.baseEndpoint = '/users';
    this.authEndpoint = '/auth';
  }

  /**
   * User login
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login result with user data and token
   */
  async login(credentials) {
    try {
      const response = await this.client.post(`${this.authEndpoint}/login`, {
        email: credentials.email?.toLowerCase().trim(),
        password: credentials.password
      });

      // Store authentication token
      if (response.token) {
        this.client.setAuthToken(response.token, credentials.rememberMe);
      }

      return {
        success: true,
        user: this.normalizeUser(response.user),
        token: response.token,
        permissions: response.permissions || [],
        expiresAt: response.expiresAt
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * User logout
   * @returns {Promise<Object>} Logout result
   */
  async logout() {
    try {
      // Call logout endpoint to invalidate token on server
      await this.client.post(`${this.authEndpoint}/logout`);
      
      // Clear local authentication token
      this.client.clearAuthToken();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error) {
      // Clear token even if server logout fails
      this.client.clearAuthToken();
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<Object>} New token and user data
   */
  async refreshToken() {
    try {
      const response = await this.client.post(`${this.authEndpoint}/refresh`);
      
      if (response.token) {
        this.client.setAuthToken(response.token);
      }
      
      return {
        success: true,
        user: this.normalizeUser(response.user),
        token: response.token,
        expiresAt: response.expiresAt
      };
    } catch (error) {
      // If refresh fails, clear token and redirect to login
      this.client.clearAuthToken();
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  async getCurrentUser() {
    try {
      const response = await this.client.get(`${this.baseEndpoint}/me`);
      return this.normalizeUser(response);
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userData) {
    try {
      const response = await this.client.put(`${this.baseEndpoint}/me`, userData);
      
      return {
        success: true,
        user: this.normalizeUser(response),
        message: 'Profile updated successfully'
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Password change result
   */
  async changePassword(passwordData) {
    try {
      await this.client.put(`${this.baseEndpoint}/me/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await this.client.post(`${this.authEndpoint}/register`, {
        ...userData,
        email: userData.email?.toLowerCase().trim()
      });
      
      return {
        success: true,
        user: this.normalizeUser(response.user),
        message: 'Registration successful. Please check your email to verify your account.',
        requiresVerification: response.requiresVerification || false
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const response = await this.client.post(`${this.authEndpoint}/verify-email`, { token });
      
      return {
        success: true,
        message: 'Email verified successfully',
        user: this.normalizeUser(response.user)
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      await this.client.post(`${this.authEndpoint}/forgot-password`, {
        email: email.toLowerCase().trim()
      });
      
      return {
        success: true,
        message: 'Password reset instructions sent to your email'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - Password reset data
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(resetData) {
    try {
      await this.client.post(`${this.authEndpoint}/reset-password`, {
        token: resetData.token,
        newPassword: resetData.newPassword
      });
      
      return {
        success: true,
        message: 'Password reset successfully. Please log in with your new password.'
      };
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user permissions
   * @returns {Promise<Array>} User permissions
   */
  async getUserPermissions() {
    try {
      const response = await this.client.get(`${this.baseEndpoint}/me/permissions`);
      return response.permissions || [];
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Update user preferences
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await this.client.put(`${this.baseEndpoint}/me/preferences`, preferences);
      
      return {
        success: true,
        preferences: response,
        message: 'Preferences updated successfully'
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Upload user avatar
   * @param {File} file - Avatar image file
   * @returns {Promise<Object>} Upload result
   */
  async uploadAvatar(file) {
    try {
      const response = await this.client.upload(`${this.baseEndpoint}/me/avatar`, file);
      
      return {
        success: true,
        avatarUrl: response.avatarUrl,
        message: 'Avatar updated successfully'
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Get user activity log
   * @param {Object} filters - Activity filters
   * @returns {Promise<Object>} Activity log
   */
  async getActivityLog(filters = {}) {
    try {
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 20,
        startDate: filters.startDate,
        endDate: filters.endDate,
        activityType: filters.activityType
      };
      
      const response = await this.client.get(`${this.baseEndpoint}/me/activity`, { params });
      
      return {
        activities: response.data || [],
        pagination: response.pagination || {},
        summary: response.summary || {}
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Delete user account
   * @param {string} password - User password for confirmation
   * @returns {Promise<Object>} Deletion result
   */
  async deleteAccount(password) {
    try {
      await this.client.delete(`${this.baseEndpoint}/me`, {
        data: { password }
      });
      
      // Clear authentication token
      this.client.clearAuthToken();
      
      return {
        success: true,
        message: 'Account deleted successfully'
      };
    } catch (error) {
      throw this.handleUserError(error);
    }
  }

  /**
   * Normalize user data
   * @param {Object} userData - Raw user data from API
   * @returns {Object} Normalized user data
   */
  normalizeUser(userData) {
    if (!userData) return null;
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name || `${userData.firstName} ${userData.lastName}`.trim(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      permissions: userData.permissions || [],
      avatar: userData.avatar,
      phone: userData.phone,
      address: userData.address,
      dateOfBirth: userData.dateOfBirth,
      isEmailVerified: userData.isEmailVerified || false,
      isActive: userData.isActive !== false,
      preferences: userData.preferences || {},
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt
    };
  }

  /**
   * Handle authentication errors
   * @param {Object} error - API error
   * @returns {Object} Formatted error
   */
  handleAuthError(error) {
    const authError = {
      ...error,
      category: 'authentication'
    };

    const errorMap = {
      'INVALID_CREDENTIALS': 'Invalid email or password',
      'ACCOUNT_LOCKED': 'Your account has been locked. Please contact support',
      'ACCOUNT_DISABLED': 'Your account has been disabled. Please contact support',
      'EMAIL_NOT_VERIFIED': 'Please verify your email address before logging in',
      'TOKEN_EXPIRED': 'Your session has expired. Please log in again',
      'TOKEN_INVALID': 'Invalid authentication token',
      'EMAIL_ALREADY_EXISTS': 'An account with this email already exists',
      'WEAK_PASSWORD': 'Password does not meet security requirements',
      'RESET_TOKEN_EXPIRED': 'Password reset token has expired',
      'RESET_TOKEN_INVALID': 'Invalid password reset token'
    };

    if (error.code && errorMap[error.code]) {
      authError.message = errorMap[error.code];
    }

    return authError;
  }

  /**
   * Handle user-related errors
   * @param {Object} error - API error
   * @returns {Object} Formatted error
   */
  handleUserError(error) {
    const userError = {
      ...error,
      category: 'user'
    };

    const errorMap = {
      'USER_NOT_FOUND': 'User not found',
      'PERMISSION_DENIED': 'You do not have permission to perform this action',
      'INVALID_PASSWORD': 'Current password is incorrect',
      'PROFILE_UPDATE_FAILED': 'Failed to update profile. Please try again',
      'AVATAR_UPLOAD_FAILED': 'Failed to upload avatar. Please try again',
      'FILE_TOO_LARGE': 'File size is too large. Maximum size is 5MB',
      'INVALID_FILE_TYPE': 'Invalid file type. Please upload a valid image file'
    };

    if (error.code && errorMap[error.code]) {
      userError.message = errorMap[error.code];
    }

    return userError;
  }
}

// Create and export singleton instance
const userService = new UserService();

export default userService;
export { UserService };
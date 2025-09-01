import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial user state
const initialUserState = {
  profile: null,
  role: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// User action types
const USER_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// User reducer
function userReducer(state, action) {
  switch (action.type) {
    case USER_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case USER_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        profile: action.payload.profile,
        role: action.payload.role,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case USER_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        profile: null,
        role: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case USER_ACTIONS.LOGOUT:
      return {
        ...initialUserState,
        isLoading: false
      };
    
    case USER_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        profile: { ...state.profile, ...action.payload },
        error: null
      };
    
    case USER_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case USER_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
}

// Create context
const UserContext = createContext();

// Custom hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Permission checking hook
export const usePermissions = () => {
  const { user } = useUser();
  
  const hasPermission = (permission) => {
    if (!user.isAuthenticated) return false;
    if (user.role === 'admin') return true; // Admin has all permissions
    return user.permissions.includes(permission);
  };
  
  const hasRole = (role) => {
    if (!user.isAuthenticated) return false;
    return user.role === role;
  };
  
  const hasAnyRole = (roles) => {
    if (!user.isAuthenticated) return false;
    return roles.includes(user.role);
  };
  
  return { hasPermission, hasRole, hasAnyRole };
};

// User provider component
export const UserProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, initialUserState);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Validate token and get user data
          // This would typically make an API call
          // For now, we'll simulate with a mock user
          const mockUser = {
            profile: {
              id: '1',
              name: 'John Doe',
              email: 'john@example.com',
              avatar: null
            },
            role: 'student',
            permissions: ['view-own-payments', 'make-payments']
          };
          
          dispatch({
            type: USER_ACTIONS.LOGIN_SUCCESS,
            payload: mockUser
          });
        } else {
          dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('authToken');
        dispatch({ type: USER_ACTIONS.SET_LOADING, payload: false });
      }
    };
    
    checkExistingSession();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    dispatch({ type: USER_ACTIONS.LOGIN_START });
    
    try {
      // This would typically make an API call
      // For now, we'll simulate with mock authentication
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Mock authentication logic
      const mockUsers = {
        'student@example.com': {
          profile: {
            id: '1',
            name: 'John Doe',
            email: 'student@example.com',
            avatar: null
          },
          role: 'student',
          permissions: ['view-own-payments', 'make-payments']
        },
        'admin@example.com': {
          profile: {
            id: '2',
            name: 'Jane Admin',
            email: 'admin@example.com',
            avatar: null
          },
          role: 'admin',
          permissions: ['*'] // All permissions
        },
        'financial@example.com': {
          profile: {
            id: '3',
            name: 'Bob Finance',
            email: 'financial@example.com',
            avatar: null
          },
          role: 'financial-manager',
          permissions: [
            'view-all-payments',
            'process-payments',
            'generate-reports',
            'manage-refunds',
            'manage-pricing'
          ]
        }
      };
      
      const user = mockUsers[credentials.email];
      if (!user || credentials.password !== 'password') {
        throw new Error('Invalid credentials');
      }
      
      // Store token
      localStorage.setItem('authToken', 'mock-jwt-token');
      
      dispatch({
        type: USER_ACTIONS.LOGIN_SUCCESS,
        payload: user
      });
      
      return user;
    } catch (error) {
      dispatch({
        type: USER_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: USER_ACTIONS.LOGOUT });
  };
  
  // Update profile function
  const updateProfile = async (updates) => {
    try {
      // This would typically make an API call
      dispatch({
        type: USER_ACTIONS.UPDATE_PROFILE,
        payload: updates
      });
      
      return { ...user.profile, ...updates };
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };
  
  // Clear error function
  const clearError = () => {
    dispatch({ type: USER_ACTIONS.CLEAR_ERROR });
  };
  
  const contextValue = {
    user,
    login,
    logout,
    updateProfile,
    clearError
  };
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import Button from './Button';
import { useFocusTrap, useUniqueId } from '../../hooks/useAccessibility';
import { KEYS, ARIA_ROLES } from '../../utils/accessibilityUtils';

/**
 * Modal component with backdrop and keyboard support
 * Uses CSS classes for styling and animations
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'base',
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  initialFocus = null,
  ...props
}) => {
  const modalId = useUniqueId('modal');
  const titleId = useUniqueId('modal-title');
  const previousActiveElement = useRef(null);
  
  // Focus trap for modal
  const { containerRef } = useFocusTrap(isOpen);
  
  // Store the previously focused element
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
    }
  }, [isOpen]);
  
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;
    
    const handleEscape = (event) => {
      if (event.key === KEYS.ESCAPE) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);
  
  // Prevent body scroll when modal is open and manage focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.setAttribute('aria-hidden', 'true');
      
      // Focus management
      if (initialFocus) {
        const focusElement = typeof initialFocus === 'string' 
          ? document.querySelector(initialFocus)
          : initialFocus;
        if (focusElement) {
          focusElement.focus();
        }
      }
    } else {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.removeAttribute('aria-hidden');
    };
  }, [isOpen, initialFocus]);
  
  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Get modal size class
  const getModalSizeClass = () => {
    const sizeClasses = {
      sm: 'max-w-sm',
      base: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-full mx-4'
    };
    return sizeClasses[size] || sizeClasses.base;
  };
  
  if (!isOpen) return null;
  
  return createPortal(
    <div
      className={`modal-backdrop ${isOpen ? 'show' : ''}`}
      onClick={handleBackdropClick}
      role={ARIA_ROLES.DIALOG}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={!title ? `${modalId}-content` : undefined}
      id={modalId}
    >
      <div
        ref={containerRef}
        className={`modal ${isOpen ? 'show' : ''} ${getModalSizeClass()} ${className}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        {...props}
      >
        {/* Modal Header */}
        {title && (
          <div className="card-header">
            <h3 id={titleId} className="card-header-title">
              {title}
            </h3>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={onClose}
              aria-label={`Close ${title} dialog`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        
        {/* Modal Body */}
        <div 
          className="card-body"
          id={!title ? `${modalId}-content` : undefined}
          role={!title ? ARIA_ROLES.DOCUMENT : undefined}
        >
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="card-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'base', 'lg', 'xl', 'full']),
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string,
  initialFocus: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
};

/**
 * Confirmation Modal component
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  loading = false,
  dangerAction = false
}) => {
  const messageId = useUniqueId('confirm-message');
  
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling would be done by the parent component
      console.error('Confirmation action failed:', error);
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      initialFocus=".btn-confirm"
      role={dangerAction ? ARIA_ROLES.ALERTDIALOG : ARIA_ROLES.DIALOG}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            aria-describedby={messageId}
          >
            {cancelText}
          </Button>
          <Button
            className="btn-confirm"
            variant={dangerAction ? 'error' : variant}
            onClick={handleConfirm}
            loading={loading}
            loadingText="Processing..."
            aria-describedby={messageId}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p 
        id={messageId}
        className="text-secondary"
        role={dangerAction ? 'alert' : undefined}
      >
        {message}
      </p>
      {dangerAction && (
        <p className="text-error-color text-sm mt-2">
          <strong>Warning:</strong> This action cannot be undone.
        </p>
      )}
    </Modal>
  );
};

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'error', 'warning']),
  loading: PropTypes.bool
};

export default Modal;
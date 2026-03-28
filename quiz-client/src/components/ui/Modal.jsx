import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

const ModalContext = React.createContext(undefined);

export function Modal({ children, open, onClose, ...props }) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <ModalContext.Provider value={{ onClose }}>
      {createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Modal */}
          <div
            className={cn(
              'relative z-50 w-full max-w-lg mx-4 bg-white rounded-xl shadow-2xl',
              'dark:bg-gray-800',
              'animate-fade-in',
              props.className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            {...props}
          >
            {children}
          </div>
        </div>,
        document.body
      )}
    </ModalContext.Provider>
  );
}

export function ModalHeader({ className, hideCloseButton = false, children, ...props }) {
  const { onClose } = React.useContext(ModalContext);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      <div>{children}</div>
      {!hideCloseButton && (
        <button
          onClick={onClose}
          className={cn(
            'p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'dark:hover:text-gray-200 dark:hover:bg-gray-700',
            'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

export function ModalTitle({ className, children, ...props }) {
  return (
    <h2
      id="modal-title"
      className={cn('text-xl font-semibold text-gray-900 dark:text-gray-100', className)}
      {...props}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({ className, children, ...props }) {
  return (
    <p
      id="modal-description"
      className={cn('text-sm text-gray-500 dark:text-gray-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function ModalBody({ className, children, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function ModalFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Confirmation Modal Component
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <ModalDescription>{description}</ModalDescription>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default Modal;

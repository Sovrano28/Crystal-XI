'use client';

import { ReactNode, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  const modalContent = (
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4',
        'animate-fade-in'
      )}
    >
      {/* Overlay */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-black/60 backdrop-blur-sm'
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full',
          sizes[size],
          'bg-[var(--surface-elevated)] backdrop-blur-2xl',
          'border border-[var(--surface-border)]',
          'rounded-2xl shadow-[var(--shadow-xl)]',
          'animate-scale-in'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-0">
            <div>
              {title && (
                <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'p-2 -m-2 ml-4',
                  'text-[var(--foreground-muted)] hover:text-[var(--foreground)]',
                  'rounded-lg hover:bg-[var(--surface)]',
                  'transition-colors duration-200'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );

  // Use portal to render modal at document root
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return null;
}

// Modal Footer for action buttons
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3',
        'pt-4 mt-4 border-t border-[var(--surface-border)]',
        className
      )}
    >
      {children}
    </div>
  );
}

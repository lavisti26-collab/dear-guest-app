import React, { useCallback, useRef, useEffect } from 'react';

interface AccessibleWrapperProps {
  children: React.ReactNode;
  /** Accessible label for the wrapper */
  ariaLabel?: string;
  /** HTML role attribute */
  role?: string;
  /** Keyboard navigation handler for Enter/Space */
  onActivate?: () => void;
  /** Keyboard navigation handler for Escape */
  onEscape?: () => void;
  /** Whether the element is currently active/focused */
  isActive?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Whether to enable tab navigation within this wrapper */
  tabIndex?: number;
  /** Announce content changes to screen readers */
  ariaLive?: 'polite' | 'assertive' | 'off';
  /** Additional aria attributes */
  ariaAttributes?: Record<string, string | boolean | number>;
}

/**
 * AccessibleWrapper provides keyboard navigation support, aria-labels,
 * role attributes, and focus-visible styles for accessible UI components.
 */
export function AccessibleWrapper({
  children,
  ariaLabel,
  role,
  onActivate,
  onEscape,
  isActive = false,
  className = '',
  tabIndex = 0,
  ariaLive = 'polite',
  ariaAttributes = {},
}: AccessibleWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter or Space triggers activation
      if (onActivate && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onActivate();
      }
      // Escape triggers dismiss
      if (onEscape && e.key === 'Escape') {
        e.preventDefault();
        onEscape();
      }
    },
    [onActivate, onEscape]
  );

  return (
    <div
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      aria-busy={isActive}
      tabIndex={tabIndex}
      className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      onKeyDown={handleKeyDown}
      {...ariaAttributes}
    >
      {children}
    </div>
  );
}

/**
 * AccessibleButton provides a fully accessible button with
 * keyboard support and screen reader labels.
 */
export function AccessibleButton({
  children,
  ariaLabel,
  onClick,
  disabled = false,
  variant = 'default',
  className = '',
  ...props
}: {
  children: React.ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'ghost' | 'outline';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    ghost: 'hover:bg-muted hover:text-muted-foreground',
    outline: 'border border-input bg-background hover:bg-muted hover:text-muted-foreground',
  };

  return (
    <button
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 px-4 py-2 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * ScreenReaderOnly provides content that is only visible to screen readers.
 */
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only" aria-live="polite">
      {children}
    </span>
  );
}

/**
 * SkipToContent provides a skip navigation link for keyboard users.
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * FocusTrap traps keyboard focus within a container, useful for modals and dropdowns.
 */
export function FocusTrap({
  children,
  isActive = true,
  onEscape,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onEscape?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        const container = containerRef.current;
        if (!container) return;

        const focusable = container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape]);

  return (
    <div ref={containerRef} role="group">
      {children}
    </div>
  );
}
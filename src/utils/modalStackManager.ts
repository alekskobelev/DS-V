/**
 * Centralized Modal Stack Manager (DS-Engineering UI Architecture)
 * 
 * Features:
 * 1. Strict Modal Stacking: When nested dialogs are open (e.g. Add Contact over Metrology Report or Deal Card),
 *    Escape closes strictly the topmost dialog.
 * 2. Body Scroll Lock: Completely prevents background inertial scroll and rubber-banding on iOS/Android,
 *    compensating for scrollbar width on desktop to prevent layout shifts.
 * 3. Focus Trap: Traps Tab / Shift+Tab keyboard focus strictly inside the active topmost modal,
 *    preventing accidental background interaction.
 */

export interface ModalRegistration {
  id: string;
  onClose: () => void;
  containerRef?: { current: HTMLElement | null };
  baseZIndex?: number;
  autoFocus?: boolean;
}

class ModalStackManager {
  private stack: ModalRegistration[] = [];
  private originalBodyOverflow: string = '';
  private originalBodyPaddingRight: string = '';
  private originalBodyTouchAction: string = '';
  private isScrollLocked: boolean = false;
  private listenersAttached: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.attachGlobalListeners();
    }
  }

  private attachGlobalListeners() {
    if (this.listenersAttached) return;
    this.listenersAttached = true;

    // Handle Escape key at capture phase to intercept before individual listeners
    window.addEventListener('keydown', this.handleKeyDown, true);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.stack.length === 0) return;

    const topmost = this.stack[this.stack.length - 1];

    // 1. ESCAPE KEY HANDLING
    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      topmost.onClose();
      return;
    }

    // 2. FOCUS TRAP TAB KEY HANDLING
    if (e.key === 'Tab' && topmost.containerRef?.current) {
      this.handleFocusTrap(e, topmost.containerRef.current);
    }
  };

  private handleFocusTrap(e: KeyboardEvent, container: HTMLElement) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(',');

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => {
      // Check visibility
      return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
    });

    if (focusableElements.length === 0) {
      e.preventDefault();
      container.focus();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      // Shift + Tab -> moving backward
      if (!activeElement || activeElement === firstElement || !container.contains(activeElement)) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab -> moving forward
      if (!activeElement || activeElement === lastElement || !container.contains(activeElement)) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  private lockBodyScroll() {
    if (typeof document === 'undefined' || this.isScrollLocked) return;
    this.isScrollLocked = true;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    this.originalBodyOverflow = document.body.style.overflow;
    this.originalBodyPaddingRight = document.body.style.paddingRight;
    this.originalBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  private unlockBodyScroll() {
    if (typeof document === 'undefined' || !this.isScrollLocked) return;
    this.isScrollLocked = false;

    document.body.style.overflow = this.originalBodyOverflow;
    document.body.style.paddingRight = this.originalBodyPaddingRight;
    document.body.style.touchAction = this.originalBodyTouchAction;
  }

  public register(modal: ModalRegistration): number {
    // Remove if already exists to avoid duplicates
    this.stack = this.stack.filter(m => m.id !== modal.id);
    this.stack.push(modal);

    if (this.stack.length === 1) {
      this.lockBodyScroll();
    }

    // Auto focus first interactive element
    if (modal.autoFocus !== false && typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        if (modal.containerRef?.current) {
          const firstInput = modal.containerRef.current.querySelector<HTMLElement>(
            'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
          );
          if (firstInput && typeof firstInput.focus === 'function') {
            firstInput.focus();
          } else if (modal.containerRef.current.tabIndex >= 0) {
            modal.containerRef.current.focus();
          }
        }
      });
    }

    return this.getZIndex(modal.id, modal.baseZIndex);
  }

  public unregister(id: string) {
    this.stack = this.stack.filter(m => m.id !== id);
    if (this.stack.length === 0) {
      this.unlockBodyScroll();
    }
  }

  public updateCallback(id: string, onClose: () => void) {
    const modal = this.stack.find(m => m.id === id);
    if (modal) {
      modal.onClose = onClose;
    }
  }

  public getZIndex(id: string, baseZIndex: number = 400): number {
    const index = this.stack.findIndex(m => m.id === id);
    if (index === -1) return baseZIndex;
    // Each stacked level gains +30 z-index guarantee over parent
    return baseZIndex + index * 30;
  }

  public isTopmost(id: string): boolean {
    if (this.stack.length === 0) return false;
    return this.stack[this.stack.length - 1].id === id;
  }

  public getStackDepth(): number {
    return this.stack.length;
  }
}

export const modalStackManager = new ModalStackManager();

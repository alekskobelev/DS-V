/**
 * Utility to copy text or URLs to clipboard with iframe/unsecured-context fallback.
 */
export async function copyToClipboard(text?: string): Promise<boolean> {
  let textToCopy = text;
  if (!textToCopy && typeof window !== 'undefined') {
    textToCopy = window.location.href;
  }
  if (!textToCopy) return false;

  // 1. Try modern navigator.clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, trying execCommand fallback:', err);
  }

  // 2. Fallback using temporary textarea
  try {
    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = textToCopy;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      textarea.style.opacity = '0';
      textarea.setAttribute('readonly', '');
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('execCommand copy fallback failed:', err);
  }

  return false;
}

import { useEffect, useRef, useState } from 'react';
import { modalStackManager, ModalRegistration } from '../utils/modalStackManager';

interface UseModalStackOptions {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  baseZIndex?: number;
  autoFocus?: boolean;
}

export function useModalStack({
  id,
  isOpen,
  onClose,
  baseZIndex = 400,
  autoFocus = true
}: UseModalStackOptions) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [zIndex, setZIndex] = useState<number>(baseZIndex);
  const [isTopmost, setIsTopmost] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const registration: ModalRegistration = {
      id,
      onClose: () => onCloseRef.current(),
      containerRef,
      baseZIndex,
      autoFocus
    };

    const calculatedZIndex = modalStackManager.register(registration);
    setZIndex(calculatedZIndex);
    setIsTopmost(modalStackManager.isTopmost(id));

    const checkInterval = setInterval(() => {
      setIsTopmost(modalStackManager.isTopmost(id));
      setZIndex(modalStackManager.getZIndex(id, baseZIndex));
    }, 150);

    return () => {
      clearInterval(checkInterval);
      modalStackManager.unregister(id);
    };
  }, [id, isOpen, baseZIndex, autoFocus]);

  return {
    containerRef,
    zIndex,
    isTopmost
  };
}

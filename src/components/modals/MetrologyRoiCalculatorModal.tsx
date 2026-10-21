import React from 'react';
import { MetrologyRoiCalculator } from '../common/MetrologyRoiCalculator';
import { useModalStack } from '../../hooks/useModalStack';

interface MetrologyRoiCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetrologyRoiCalculatorModal: React.FC<MetrologyRoiCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { containerRef, zIndex } = useModalStack({
    id: 'metrology-roi-calculator-modal',
    isOpen,
    onClose,
    baseZIndex: 360,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      style={{ zIndex }}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl my-auto animate-in zoom-in-95 duration-200"
      >
        <MetrologyRoiCalculator onClose={onClose} />
      </div>
    </div>
  );
};

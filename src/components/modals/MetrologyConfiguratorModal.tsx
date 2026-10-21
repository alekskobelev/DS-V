import React from 'react';
import { MetrologyEquipmentConfigurator } from '../common/MetrologyEquipmentConfigurator';
import { useModalStack } from '../../hooks/useModalStack';

interface MetrologyConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetrologyConfiguratorModal: React.FC<MetrologyConfiguratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { containerRef, zIndex } = useModalStack({
    id: 'metrology-configurator-modal',
    isOpen,
    onClose,
    baseZIndex: 350,
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
        <MetrologyEquipmentConfigurator onClose={onClose} />
      </div>
    </div>
  );
};

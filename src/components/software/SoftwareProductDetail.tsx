import React from 'react';
import { Product } from '../../types';
import { ProductDetailLayout } from '../common/ProductDetailLayout';

export interface SoftwareProductDetailProps {
  product: Product;
  onBack?: () => void;
}

/**
 * Unified Software Product Detail Delegate
 * Utilizes the shared ProductDetailLayout template for 100% design consistency
 * across all software and hardware product pages.
 */
export const SoftwareProductDetail: React.FC<SoftwareProductDetailProps> = ({
  product,
  onBack,
}) => {
  return <ProductDetailLayout product={product} onBack={onBack} />;
};

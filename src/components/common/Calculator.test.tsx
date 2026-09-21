import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { Calculator } from './Calculator';

// Mock context because Calculator uses useApp
vi.mock('../../context/AppContext', () => ({
  useApp: () => ({
    openContactModal: vi.fn(),
  })
}));

describe('Calculator Unit Test', () => {
  it('renders the calculator and switches tabs', () => {
    render(<Calculator defaultService="scanning" />);
    // Initial tab
    expect(screen.getByRole('button', { name: /3D-сканирование/i })).toBeInTheDocument();
    
    // Switch to reverse
    const reverseBtn = screen.getByRole('button', { name: /Обратный инжиниринг/i });
    fireEvent.click(reverseBtn);
    expect(screen.getByRole('button', { name: /Обратный инжиниринг/i })).toHaveClass('font-semibold');
  });
});

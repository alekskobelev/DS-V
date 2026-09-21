import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Integration', () => {
  it('renders without crashing and defaults to the home page', () => {
    render(<App />);
    const dsTextElements = screen.getAllByText(/ДС‑ИНЖИНИРИНГ/i);
    expect(dsTextElements.length).toBeGreaterThan(0);
  });
});

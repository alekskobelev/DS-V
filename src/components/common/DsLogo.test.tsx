import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DsLogo } from './DsLogo';

describe('DsLogo Component', () => {
  it('renders the official logo image when no customSrc is provided', () => {
    const { container } = render(<DsLogo />);
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/logo.svg');
  });

  it('renders a custom image when customSrc is provided', () => {
    const { container } = render(<DsLogo customSrc="/custom-logo.png" />);
    const imgElement = container.querySelector('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/custom-logo.png');
  });

  it('renders text when showText is true', () => {
    render(<DsLogo showText={true} />);
    expect(screen.getByText('ДС‑ИНЖИНИРИНГ')).toBeInTheDocument();
  });

  it('does not render text when showText is false', () => {
    render(<DsLogo showText={false} />);
    expect(screen.queryByText('ДС‑ИНЖИНИРИНГ')).not.toBeInTheDocument();
  });
});

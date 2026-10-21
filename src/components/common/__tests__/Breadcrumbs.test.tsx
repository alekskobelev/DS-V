import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Breadcrumbs } from '../Breadcrumbs';
import { AppProvider } from '../../../context/AppContext';
import { ThemeProvider } from '../../../context/ThemeContext';

describe('Breadcrumbs Component (src/components/common/Breadcrumbs.tsx)', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <ThemeProvider>
        <AppProvider>
          {ui}
        </AppProvider>
      </ThemeProvider>
    );
  };

  it('should render custom breadcrumb items when provided', () => {
    const customItems = [
      { label: 'Каталог САПР', href: '/#software' },
      { label: 'TopSolid 7 CAM', href: '/#software/topsolid-7' }
    ];

    renderWithProviders(<Breadcrumbs items={customItems} />);

    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Каталог САПР')).toBeInTheDocument();
    expect(screen.getByText('TopSolid 7 CAM')).toBeInTheDocument();
  });

  it('should render back and share buttons by default', () => {
    const customItems = [
      { label: 'Инжиниринг', href: '/#services' },
      { label: '3D-сканирование', href: '/#services/service-3d-scanning' }
    ];

    renderWithProviders(<Breadcrumbs items={customItems} />);

    expect(screen.getByLabelText('Назад')).toBeInTheDocument();
    expect(screen.getByLabelText('Поделиться')).toBeInTheDocument();
  });

  it('should copy link to clipboard when share button is clicked', () => {
    const writeTextMock = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const customItems = [{ label: 'Контакты', href: '/#contacts' }];
    renderWithProviders(<Breadcrumbs items={customItems} />);

    const shareBtn = screen.getByLabelText('Поделиться');
    fireEvent.click(shareBtn);

    expect(writeTextMock).toHaveBeenCalled();
  });
});

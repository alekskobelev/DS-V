import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App Integration', () => {
  it('renders without crashing and defaults to the home page', async () => {
    await act(async () => {
      render(<App />);
    });
    const dsTextElements = screen.getAllByText(/ДС‑ИНЖИНИРИНГ/i);
    expect(dsTextElements.length).toBeGreaterThan(0);
  });

  it('renders /crm without crashing on all tabs', async () => {
    const tabs = ['funnels', 'companies', 'proposals', 'tasks', 'contracts', 'certificates', 'metrology', 'training', 'communications', 'dashboard', 'analytics', 'settings'];
    for (const tab of tabs) {
      sessionStorage.setItem('ds_crm_active_tab', tab);
      window.history.pushState({}, '', '/crm');
      const { unmount } = render(<App />);
      const errorTitle = screen.queryByText(/Сервис восстанавливает рабочее состояние/i);
      expect(errorTitle).toBeNull();
      unmount();
    }
  }, 20000);
});


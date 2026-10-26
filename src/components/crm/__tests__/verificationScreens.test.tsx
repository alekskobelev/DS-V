import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProvider } from '../../../context/AppContext';
import { ArshinVerificationWidget } from '../ArshinVerificationWidget';
import { CompanyFleetRegistry } from '../CompanyFleetRegistry';

/**
 * Смоук двух экранов, которые исторически показывали разные сроки поверки для одного
 * и того же прибора и умели выводить «Действует (осталось NaN дн.)» (битая или пустая
 * дата) и `left: [object Object]%` в стилях диаграммы Ганта.
 *
 * Проверка намеренно содержательная, а не «рендер не упал»: если расчёт снова начнёт
 * пропускать NaN или объект вместо числа — тест это увидит.
 */
const renderInApp = async (ui: React.ReactNode) => {
  let view!: ReturnType<typeof render>;
  await act(async () => {
    view = render(<AppProvider>{ui}</AppProvider>);
  });
  return view;
};

describe('Экраны контроля поверок СИ', () => {
  it('виджет главного метролога не содержит NaN в сроках', async () => {
    const { container } = await renderInApp(<ArshinVerificationWidget />);
    expect(container.textContent || '').not.toMatch(/NaN\s*дн/);
  });

  it('реестр парка СИ не содержит NaN в сроках и [object Object] в разметке', async () => {
    const { container } = await renderInApp(<CompanyFleetRegistry />);
    const text = container.textContent || '';
    expect(text).not.toMatch(/NaN\s*дн/);
    expect(text).not.toMatch(/\[object Object\]/);
    expect(container.innerHTML).not.toMatch(/\[object Object\]/);
  });
});

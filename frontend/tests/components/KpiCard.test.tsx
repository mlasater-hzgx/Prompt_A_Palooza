import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/render';
import { KpiCard } from '../../src/components/data-display/KpiCard';

describe('KpiCard', () => {
  it('renders title and value', () => {
    renderWithProviders(<KpiCard title="TRIR" value="2.4" />);
    expect(screen.getByText('TRIR')).toBeInTheDocument();
    expect(screen.getByText('2.4')).toBeInTheDocument();
  });

  it('renders trend value when provided', () => {
    renderWithProviders(<KpiCard title="TRIR" value="2.4" trend="down" trendValue="-12%" />);
    expect(screen.getByText('-12%')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithProviders(<KpiCard title="TRIR" value="2.4" subtitle="vs. 3.0 benchmark" />);
    expect(screen.getByText('vs. 3.0 benchmark')).toBeInTheDocument();
  });
});

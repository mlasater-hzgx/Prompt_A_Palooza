import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/render';
import { StatusBadge } from '../../src/components/data-display/StatusBadge';

describe('StatusBadge', () => {
  it('renders the status label', () => {
    renderWithProviders(<StatusBadge status="REPORTED" />);
    expect(screen.getByText('REPORTED')).toBeInTheDocument();
  });

  it('converts underscores to spaces', () => {
    renderWithProviders(<StatusBadge status="UNDER_INVESTIGATION" />);
    expect(screen.getByText('UNDER INVESTIGATION')).toBeInTheDocument();
  });

  it('renders unknown statuses with default styling', () => {
    renderWithProviders(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(screen.getByText('UNKNOWN STATUS')).toBeInTheDocument();
  });
});

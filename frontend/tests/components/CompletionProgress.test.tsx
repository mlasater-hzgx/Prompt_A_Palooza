import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/render';
import { CompletionProgress } from '../../src/components/data-display/CompletionProgress';

describe('CompletionProgress', () => {
  it('renders percentage label', () => {
    renderWithProviders(<CompletionProgress value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    renderWithProviders(<CompletionProgress value={75} showLabel={false} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';

describe('incident number format', () => {
  it('follows INC-YYYY-NNNN pattern', () => {
    const year = 2025;
    const seq = 42;
    const number = `INC-${year}-${String(seq).padStart(4, '0')}`;
    expect(number).toBe('INC-2025-0042');
    expect(number).toMatch(/^INC-\d{4}-\d{4}$/);
  });
});

describe('CAPA number format', () => {
  it('follows CAPA-YYYY-NNNN pattern', () => {
    const year = 2025;
    const seq = 7;
    const number = `CAPA-${year}-${String(seq).padStart(4, '0')}`;
    expect(number).toBe('CAPA-2025-0007');
    expect(number).toMatch(/^CAPA-\d{4}-\d{4}$/);
  });
});

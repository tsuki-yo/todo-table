import { isPastDue } from './dateUtils';

describe('isPastDue', () => {
  beforeEach(() => {
    // Mock current date to be 2024-04-26
    const mockDate = new Date('2024-04-26');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    // Restore the Date constructor
    jest.restoreAllMocks();
  });

  test('returns true for dates before today', () => {
    expect(isPastDue('2024-04-25')).toBe(true);
    expect(isPastDue('2024-04-01')).toBe(true);
    expect(isPastDue('2023-12-31')).toBe(true);
  });

  test('returns false for dates today or in the future', () => {
    expect(isPastDue('2024-04-26')).toBe(false);
    expect(isPastDue('2024-04-27')).toBe(false);
    expect(isPastDue('2024-12-31')).toBe(false);
  });

  test('returns false for empty or invalid dates', () => {
    expect(isPastDue('')).toBe(false);
    expect(isPastDue(null)).toBe(false);
    expect(isPastDue(undefined)).toBe(false);
    expect(isPastDue('invalid-date')).toBe(false);
  });
}); 
import { isPastDue } from './dateUtils';

describe('isPastDue', () => {
  let originalDate;

  beforeEach(() => {
    // Save original Date
    originalDate = global.Date;

    // Mock current date to 2024-04-26 12:00:00 UTC
    // This will be 2024-04-26 21:00:00 in Japan
    const mockDate = new Date('2024-04-26T12:00:00Z');
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return mockDate;
        }
        return new originalDate(...args);
      }
    };
  });

  afterEach(() => {
    // Restore original Date
    global.Date = originalDate;
  });

  test('returns true for dates before today in Japan', () => {
    expect(isPastDue('2024-04-25')).toBe(true);
    expect(isPastDue('2024-04-01')).toBe(true);
    expect(isPastDue('2023-12-31')).toBe(true);
  });

  test('returns false for today and future dates in Japan', () => {
    expect(isPastDue('2024-04-26')).toBe(false);
    expect(isPastDue('2024-04-27')).toBe(false);
    expect(isPastDue('2024-12-31')).toBe(false);
  });

  test('returns false for invalid inputs', () => {
    expect(isPastDue('')).toBe(false);
    expect(isPastDue(null)).toBe(false);
    expect(isPastDue(undefined)).toBe(false);
    expect(isPastDue('invalid-date')).toBe(false);
    expect(isPastDue('2024-13-01')).toBe(false);
  });
}); 
import React from 'react';
import { render, screen } from '@testing-library/react';
import DateInput from './DateInput';

describe('DateInput', () => {
  it('renders without crashing', () => {
    render(<DateInput />);
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });

  it('applies past-due class when isPastDue is true', () => {
    render(<DateInput isPastDue={true} />);
    expect(screen.getByTestId('date-input')).toHaveClass('past-due');
  });

  it('does not apply past-due class when isPastDue is false', () => {
    render(<DateInput isPastDue={false} />);
    expect(screen.getByTestId('date-input')).not.toHaveClass('past-due');
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<DateInput onChange={handleChange} />);
    screen.getByTestId('date-input').dispatchEvent(new Event('change'));
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    render(<DateInput onBlur={handleBlur} />);
    screen.getByTestId('date-input').dispatchEvent(new Event('blur'));
    expect(handleBlur).toHaveBeenCalled();
  });
}); 
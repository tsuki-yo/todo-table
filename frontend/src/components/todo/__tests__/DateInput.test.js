import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateInput from '../DateInput';

describe('DateInput', () => {
  it('renders without crashing', () => {
    render(<DateInput />);
    expect(screen.getByTestId('date-input')).toBeInTheDocument();
  });

  it('applies red color when isPastDue is true', () => {
    render(<DateInput isPastDue={true} />);
    expect(screen.getByTestId('date-input')).toHaveStyle({ color: '#dc3545' });
  });

  it('applies inherit color when isPastDue is false', () => {
    render(<DateInput isPastDue={false} />);
    expect(screen.getByTestId('date-input')).toHaveStyle({ color: 'inherit' });
  });

  it('calls onChange when value changes', () => {
    const handleChange = jest.fn();
    render(<DateInput onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('date-input'), { target: { value: '2024-03-22' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', () => {
    const handleBlur = jest.fn();
    render(<DateInput onBlur={handleBlur} />);
    fireEvent.blur(screen.getByTestId('date-input'));
    expect(handleBlur).toHaveBeenCalled();
  });
}); 
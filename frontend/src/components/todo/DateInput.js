import React from 'react';
import './DateInput.css';

const DateInput = ({ value, onChange, onBlur, isPastDue }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="date-input"
      style={{ color: isPastDue ? '#dc3545' : 'inherit' }}
      data-testid="date-input"
    />
  );
};

export default DateInput; 
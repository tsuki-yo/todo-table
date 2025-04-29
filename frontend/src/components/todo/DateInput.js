import React from 'react';
import '../../styles/base.css';

const DateInput = ({ value, onChange, onBlur, isPastDue }) => {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      role="date"
      data-testid="date-input"
      className={`date-input ${isPastDue ? 'past-due' : ''}`}
    />
  );
};

export default DateInput; 
import React from 'react';
import './DateInput.css';

const DateInput = ({ value, onChange, onBlur, isPastDue }) => {
  // Convert yyyy/mm/dd to yyyy-mm-dd for HTML date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.replace(/\//g, '-');
  };

  // Convert yyyy-mm-dd back to yyyy/mm/dd for storage
  const handleChange = (e) => {
    const htmlDate = e.target.value; // yyyy-mm-dd
    const displayDate = htmlDate.replace(/-/g, '/'); // yyyy/mm/dd
    onChange({ target: { value: displayDate } });
  };

  return (
    <input
      type="date"
      value={formatDateForInput(value)}
      onChange={handleChange}
      onBlur={onBlur}
      className="date-input"
      style={{ color: isPastDue ? '#dc3545' : 'inherit' }}
      data-testid="date-input"
    />
  );
};

export default DateInput; 
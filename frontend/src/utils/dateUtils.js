/**
 * Checks if a date is past due (before today)
 * @param {string} dateString - The date string to check (YYYY-MM-DD format)
 * @returns {boolean} - True if the date is before today, false otherwise
 */
export const isPastDue = (dateString) => {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Reset time part for accurate date comparison
  const dueDate = new Date(dateString);
  return dueDate < today;
}; 
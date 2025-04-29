/**
 * Checks if a date string (YYYY-MM-DD) is before today in Japan's timezone (UTC+9)
 * @param {string} dateString - The date string to check in YYYY-MM-DD format
 * @returns {boolean} - True if the date is before today, false otherwise
 */
export const isPastDue = (dateString) => {
  try {
    if (!dateString) return false;

    // Parse the input date string
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return false;

    // Get current date in UTC
    const now = new Date();
    
    // Create today's date in Japan (UTC+9)
    const todayInJapan = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));
    
    // Create input date in Japan (UTC+9)
    const inputDateInJapan = new Date(Date.UTC(year, month - 1, day));

    // Compare the dates
    return inputDateInJapan < todayInJapan;
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
};
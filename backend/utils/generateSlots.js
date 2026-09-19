/**
 * generateSlots — Port of Django's generate_slots() from views.py
 *
 * Generates 1-hour time slots between openTime and closeTime.
 *
 * @param {string} openTime  - "HH:MM:SS" (24-hour format from MySQL TIME field)
 * @param {string} closeTime - "HH:MM:SS" (24-hour format from MySQL TIME field)
 * @returns {string[]} Array of slot strings e.g. ["09:00 AM - 10:00 AM", ...]
 *
 * Example:
 *   generateSlots("09:00:00", "13:00:00")
 *   // => ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", ...]
 */
function generateSlots(openTime, closeTime) {
  const slots = [];

  // Parse "HH:MM:SS" into total minutes since midnight
  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  let current = toMinutes(openTime);
  const end   = toMinutes(closeTime);

  // Format minutes-since-midnight into "HH:MM AM/PM"
  const formatTime = (mins) => {
    const h   = Math.floor(mins / 60);
    const m   = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12  = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  while (current < end) {
    const slotStart = formatTime(current);
    const slotEnd   = formatTime(current + 60);
    slots.push(`${slotStart} - ${slotEnd}`);
    current += 60;
  }

  return slots;
}

module.exports = { generateSlots };

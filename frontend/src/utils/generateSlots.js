/**
 * Generates 1-hour time slots between openTime and closeTime.
 *
 * @param {string} openTime  - "HH:MM:SS" or "HH:MM"
 * @param {string} closeTime - "HH:MM:SS" or "HH:MM"
 * @returns {string[]} Array of slot strings e.g. ["09:00 AM - 10:00 AM", ...]
 */
export function generateSlots(openTime, closeTime) {
  if (!openTime || !closeTime) return [];

  const toMinutes = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  let current = toMinutes(openTime);
  const end = toMinutes(closeTime);

  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const slots = [];
  while (current < end) {
    const slotStart = formatTime(current);
    const slotEnd = formatTime(current + 60);
    slots.push(`${slotStart} - ${slotEnd}`);
    current += 60;
  }

  return slots;
}

export default generateSlots;

/**
 * Helper to get the full image URL from backend uploads
 *
 * @param {string} filename
 * @returns {string}
 */
export function getImageUrl(filename) {
  if (!filename || filename === 'default.jpg') {
    return '/vite.svg'; // fallback placeholder
  }
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `/uploads/${filename}`;
}

export default getImageUrl;

/**
 * Helper to get the full image URL from backend uploads
 *
 * @param {string} filename
 * @returns {string}
 */
export const DEFAULT_SALON_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

export function getImageUrl(filename) {
  if (!filename) {
    return DEFAULT_SALON_IMAGE;
  }
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `/uploads/${filename}`;
}

export function getUserAvatarUrl(filename, name = 'User') {
  if (filename && filename !== 'default.jpg') {
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    return `/uploads/${filename}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=121212&size=150&bold=true`;
}

export default getImageUrl;

export interface Sticker {
  id: string;
  name: string;
  category: string;
  tags: string[];
  url: string;
  type: 'png' | 'svg' | 'animated' | 'emoji';
  width?: number;
  height?: number;
}

let allStickers: Sticker[] = [];
let categories: string[] = [];

export async function loadStickers() {
  if (allStickers.length > 0) return; // Already loaded
  try {
    const response = await fetch('/src/data/stickers.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Sticker[] = await response.json();
    allStickers = data;
    categories = Array.from(new Set(data.map(s => s.category))).sort();
    console.log('Stickers loaded:', allStickers.length);
  } catch (error) {
    console.error('Failed to load stickers:', error);
  }
}

export function getAllStickers(): Sticker[] {
  return allStickers;
}

export function getStickerById(id: string): Sticker | undefined {
  return allStickers.find(sticker => sticker.id === id);
}

export function getStickerCategories(): string[] {
  return categories;
}

export function filterStickers(options: { category?: string; query?: string; type?: string }): Sticker[] {
  let filtered = allStickers;

  if (options.category) {
    filtered = filtered.filter(sticker => sticker.category === options.category);
  }

  if (options.query) {
    const lowerCaseQuery = options.query.toLowerCase();
    filtered = filtered.filter(
      sticker =>
        sticker.name.toLowerCase().includes(lowerCaseQuery) ||
        sticker.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery))
    );
  }

  if (options.type) {
    filtered = filtered.filter(sticker => sticker.type === options.type);
  }

  return filtered;
}

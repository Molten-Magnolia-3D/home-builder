import type { CatalogCategory, CatalogItem } from './types'

export const CATEGORIES: { id: CatalogCategory; label: string }[] = [
  { id: 'furniture', label: 'Furniture' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bath', label: 'Bath' },
  { id: 'decor', label: 'Decor' },
  { id: 'structure', label: 'Structure' },
  { id: 'exterior', label: 'Exterior' },
]

export const CATALOG: CatalogItem[] = [
  { id: 'sofa-3', name: 'Sofa', category: 'furniture', w: 7, d: 3, h: 2.7, tags: ['living', 'seating'], printFriendly: true, swatch: '#6b4f3a' },
  { id: 'loveseat', name: 'Loveseat', category: 'furniture', w: 5, d: 3, h: 2.7, tags: ['living'], printFriendly: true, swatch: '#7a5a44' },
  { id: 'armchair', name: 'Armchair', category: 'furniture', w: 2.6, d: 2.6, h: 2.8, tags: ['living'], printFriendly: true, swatch: '#8b5a3c' },
  { id: 'coffee-table', name: 'Coffee table', category: 'furniture', w: 4, d: 2.2, h: 1.4, tags: ['living'], printFriendly: true, swatch: '#c4a06a' },
  { id: 'side-table', name: 'Side table', category: 'furniture', w: 1.6, d: 1.6, h: 1.8, tags: ['living'], printFriendly: true, swatch: '#d4b483' },
  { id: 'tv-console', name: 'TV console', category: 'furniture', w: 6, d: 1.5, h: 1.8, tags: ['living'], printFriendly: true, swatch: '#4a3b2a' },
  { id: 'dining-table-6', name: 'Dining table', category: 'furniture', w: 6.5, d: 3.4, h: 2.5, tags: ['dining'], printFriendly: true, swatch: '#b08958' },
  { id: 'dining-chair', name: 'Dining chair', category: 'furniture', w: 1.6, d: 1.7, h: 3, tags: ['dining'], printFriendly: true, swatch: '#c9a36a' },
  { id: 'bench', name: 'Dining bench', category: 'furniture', w: 5, d: 1.3, h: 1.6, tags: ['dining'], printFriendly: true, swatch: '#a67c52' },
  { id: 'bed-queen', name: 'Queen bed', category: 'furniture', w: 7, d: 5.5, h: 3, tags: ['bedroom'], printFriendly: true, swatch: '#d9c4a8' },
  { id: 'bed-king', name: 'King bed', category: 'furniture', w: 8, d: 6.5, h: 3, tags: ['bedroom'], printFriendly: true, swatch: '#e2cbb0' },
  { id: 'bed-twin', name: 'Twin bed', category: 'furniture', w: 6.5, d: 3.3, h: 2.8, tags: ['bedroom'], printFriendly: true, swatch: '#c8b59a' },
  { id: 'nightstand', name: 'Nightstand', category: 'furniture', w: 1.8, d: 1.6, h: 2, tags: ['bedroom'], printFriendly: true, swatch: '#8c6a3f' },
  { id: 'dresser', name: 'Dresser', category: 'furniture', w: 5.2, d: 1.7, h: 3.2, tags: ['bedroom'], printFriendly: true, swatch: '#6e4f32' },
  { id: 'desk', name: 'Desk', category: 'furniture', w: 5, d: 2.2, h: 2.5, tags: ['office'], printFriendly: true, swatch: '#9a7544' },
  { id: 'office-chair', name: 'Office chair', category: 'furniture', w: 2, d: 2, h: 3.2, tags: ['office'], printFriendly: true, swatch: '#2e2a26' },
  { id: 'bookshelf', name: 'Bookshelf', category: 'furniture', w: 3.2, d: 1.1, h: 6.5, tags: ['office', 'living'], printFriendly: true, swatch: '#5c4030' },
  { id: 'wardrobe', name: 'Wardrobe', category: 'furniture', w: 4, d: 2, h: 7, tags: ['bedroom'], printFriendly: true, swatch: '#4a3728' },

  { id: 'fridge', name: 'Refrigerator', category: 'kitchen', w: 3, d: 2.6, h: 6, tags: ['kitchen'], printFriendly: true, swatch: '#d8d6d2' },
  { id: 'range', name: 'Range', category: 'kitchen', w: 2.6, d: 2.4, h: 3.2, tags: ['kitchen'], printFriendly: true, swatch: '#2c2c2c' },
  { id: 'dishwasher', name: 'Dishwasher', category: 'kitchen', w: 2.2, d: 2.2, h: 2.9, tags: ['kitchen'], printFriendly: true, swatch: '#c8c6c2' },
  { id: 'sink-kitchen', name: 'Kitchen sink', category: 'kitchen', w: 3, d: 2.1, h: 3, tags: ['kitchen'], printFriendly: true, swatch: '#b8b6b2' },
  { id: 'island', name: 'Kitchen island', category: 'kitchen', w: 7, d: 3.2, h: 3, tags: ['kitchen'], printFriendly: true, swatch: '#eee6d8' },
  { id: 'base-cabinet', name: 'Base cabinet', category: 'kitchen', w: 3, d: 2, h: 3, tags: ['kitchen'], printFriendly: true, swatch: '#efe8dc' },
  { id: 'upper-cabinet', name: 'Upper cabinet', category: 'kitchen', w: 3, d: 1.2, h: 2.4, tags: ['kitchen'], printFriendly: false, swatch: '#f4eee4' },
  { id: 'pantry', name: 'Pantry', category: 'kitchen', w: 2.4, d: 2, h: 7.2, tags: ['kitchen'], printFriendly: true, swatch: '#e8dcc8' },

  { id: 'toilet', name: 'Toilet', category: 'bath', w: 2.2, d: 2.4, h: 2.4, tags: ['bath'], printFriendly: true, swatch: '#f4f1ea' },
  { id: 'vanity', name: 'Vanity', category: 'bath', w: 4, d: 1.8, h: 3.2, tags: ['bath'], printFriendly: true, swatch: '#ece4d6' },
  { id: 'tub', name: 'Bathtub', category: 'bath', w: 5.2, d: 2.8, h: 2.2, tags: ['bath'], printFriendly: true, swatch: '#f7f3ec' },
  { id: 'shower', name: 'Shower', category: 'bath', w: 3.5, d: 3.5, h: 7, tags: ['bath'], printFriendly: true, swatch: '#d7e3e2' },
  { id: 'sink-bath', name: 'Pedestal sink', category: 'bath', w: 2, d: 1.6, h: 3, tags: ['bath'], printFriendly: true, swatch: '#f2efe8' },

  { id: 'plant-tall', name: 'Tall plant', category: 'decor', w: 1.6, d: 1.6, h: 5.5, tags: ['living'], printFriendly: true, swatch: '#3f6b4c' },
  { id: 'plant-small', name: 'Potted plant', category: 'decor', w: 1.2, d: 1.2, h: 2.2, tags: ['living'], printFriendly: true, swatch: '#4e7d56' },
  { id: 'floor-lamp', name: 'Floor lamp', category: 'decor', w: 1.3, d: 1.3, h: 5.5, tags: ['living'], printFriendly: false, swatch: '#e8d5a3' },
  { id: 'table-lamp', name: 'Table lamp', category: 'decor', w: 1, d: 1, h: 2.2, tags: ['bedroom'], printFriendly: false, swatch: '#f0e2b8' },
  { id: 'rug', name: 'Area rug', category: 'decor', w: 8, d: 5.5, h: 0.08, tags: ['living'], printFriendly: false, swatch: '#8b3d3d' },
  { id: 'art', name: 'Wall art', category: 'decor', w: 3, d: 0.12, h: 2.4, tags: ['living'], printFriendly: false, swatch: '#c9b48a' },
  { id: 'mirror', name: 'Mirror', category: 'decor', w: 2.4, d: 0.12, h: 3.4, tags: ['bath'], printFriendly: false, swatch: '#cfd8dc' },
  { id: 'pendant', name: 'Pendant light', category: 'decor', w: 1.4, d: 1.4, h: 2.2, tags: ['dining'], printFriendly: false, swatch: '#c4a056' },

  { id: 'fireplace', name: 'Fireplace', category: 'structure', w: 6, d: 2.2, h: 5.2, tags: ['living'], printFriendly: true, swatch: '#5a4033' },
  { id: 'chimney', name: 'Chimney', category: 'structure', w: 2.6, d: 2.6, h: 8, tags: ['roof'], printFriendly: true, swatch: '#7a4a3a' },
  { id: 'column', name: 'Column', category: 'structure', w: 1.1, d: 1.1, h: 8, tags: ['porch'], printFriendly: true, swatch: '#efe8dc' },
  { id: 'railing', name: 'Railing', category: 'structure', w: 6, d: 0.3, h: 3, tags: ['stair'], printFriendly: true, swatch: '#d8cbb4' },
  { id: 'skylight', name: 'Skylight', category: 'structure', w: 3, d: 3, h: 0.3, tags: ['roof'], printFriendly: false, swatch: '#9ec5d6' },

  { id: 'tree', name: 'Shade tree', category: 'exterior', w: 8, d: 8, h: 16, tags: ['lot'], printFriendly: true, swatch: '#2f5d38' },
  { id: 'shrub', name: 'Shrub', category: 'exterior', w: 3, d: 3, h: 3.2, tags: ['lot'], printFriendly: true, swatch: '#3d6b40' },
  { id: 'car', name: 'Sedan', category: 'exterior', w: 15, d: 6, h: 4.8, tags: ['lot'], printFriendly: true, swatch: '#4a5560' },
  { id: 'fence', name: 'Fence run', category: 'exterior', w: 8, d: 0.4, h: 4, tags: ['lot'], printFriendly: true, swatch: '#c9b48a' },
  { id: 'mailbox', name: 'Mailbox', category: 'exterior', w: 1.2, d: 1.2, h: 4.2, tags: ['lot'], printFriendly: true, swatch: '#2c3a4a' },
  { id: 'grill', name: 'Grill', category: 'exterior', w: 3.2, d: 2, h: 3.6, tags: ['lot'], printFriendly: true, swatch: '#222' },
  { id: 'deck-chair', name: 'Deck chair', category: 'exterior', w: 2.2, d: 2.6, h: 3, tags: ['lot'], printFriendly: true, swatch: '#d7c09a' },
]

export const CATALOG_BY_ID = new Map(CATALOG.map((item) => [item.id, item]))

export function catalogItem(id: string): CatalogItem | undefined {
  return CATALOG_BY_ID.get(id)
}

export const FLOOR_FINISHES = [
  { id: 'oak', label: 'White oak', color: '#c9a66b' },
  { id: 'walnut', label: 'Walnut', color: '#6b4630' },
  { id: 'tile', label: 'Ceramic tile', color: '#d8d2c6' },
  { id: 'marble', label: 'Marble', color: '#ece8e1' },
  { id: 'carpet', label: 'Wool carpet', color: '#8d6b52' },
  { id: 'concrete', label: 'Polished concrete', color: '#9a9690' },
] as const

export const WALL_FINISHES = [
  { id: 'linen', label: 'Linen', color: '#f3eee4' },
  { id: 'chalk', label: 'Chalk', color: '#f7f4ef' },
  { id: 'sage', label: 'Sage', color: '#c5cebe' },
  { id: 'clay', label: 'Clay', color: '#d9b39a' },
  { id: 'ink', label: 'Ink', color: '#2c2824' },
  { id: 'blush', label: 'Magnolia blush', color: '#f0d4c6' },
] as const

export const ROOF_COLORS = [
  { id: '#3d3a36', label: 'Charcoal shingle' },
  { id: '#6b3a2a', label: 'Clay tile' },
  { id: '#5a6570', label: 'Slate' },
  { id: '#8a7a55', label: 'Weathered cedar' },
  { id: '#2f4a3a', label: 'Standing seam' },
]

export const PRINT_SCALES = [
  { id: '1:50', label: '1:50 — interior detail', ratio: 50 },
  { id: '1:75', label: '1:75 — furnished model', ratio: 75 },
  { id: '1:87', label: '1:87 — HO railroad', ratio: 87 },
  { id: '1:100', label: '1:100 — listing desk model', ratio: 100 },
  { id: '1:150', label: '1:150 — street scale', ratio: 150 },
  { id: '1:200', label: '1:200 — massing', ratio: 200 },
] as const

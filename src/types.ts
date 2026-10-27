export type Vec2 = { x: number; y: number }

export type Tool =
  | 'select'
  | 'wall'
  | 'door'
  | 'window'
  | 'passage'
  | 'room'
  | 'stair'
  | 'place'
  | 'erase'
  | 'measure'

export type RoofStyle = 'gable' | 'hip' | 'flat' | 'shed' | 'gambrel'

export type OpeningKind = 'door' | 'window' | 'passage'

export type CatalogCategory =
  | 'furniture'
  | 'kitchen'
  | 'bath'
  | 'decor'
  | 'structure'
  | 'exterior'

export type ListingStatus = 'draft' | 'ready' | 'listed'

export type ViewMode = 'plan' | 'model' | 'split'

export type Wall = {
  id: string
  a: Vec2
  b: Vec2
  thickness: number
}

export type Opening = {
  id: string
  wallId: string
  kind: OpeningKind
  offset: number
  width: number
  height: number
  sill: number
}

export type Room = {
  id: string
  name: string
  floorFinish: FloorFinish
  wallFinish: WallFinish
}

export type FloorFinish = 'oak' | 'walnut' | 'tile' | 'marble' | 'carpet' | 'concrete'

export type WallFinish = 'linen' | 'chalk' | 'sage' | 'clay' | 'ink' | 'blush'

export type Stair = {
  id: string
  origin: Vec2
  width: number
  length: number
  rotation: number
}

export type PlacedAsset = {
  id: string
  catalogId: string
  position: Vec2
  rotation: number
}

export type Story = {
  id: string
  name: string
  elevation: number
  height: number
  walls: Wall[]
  openings: Opening[]
  rooms: Room[]
  assets: PlacedAsset[]
  stairs: Stair[]
}

export type Roof = {
  style: RoofStyle
  pitch: number
  overhang: number
  color: string
}

export type Listing = {
  address: string
  city: string
  state: string
  zip: string
  price: number
  beds: number
  baths: number
  sqft: number
  lotSqft: number
  yearBuilt: number
  agentName: string
  brokerage: string
  description: string
  status: ListingStatus
}

export type Lot = {
  width: number
  depth: number
}

export type Project = {
  id: string
  name: string
  updatedAt: number
  listing: Listing
  stories: Story[]
  roof: Roof
  lot: Lot
  activeStoryId: string
}

export type PrintScale = '1:50' | '1:75' | '1:87' | '1:100' | '1:150' | '1:200'

export type ExportFormat = 'stl' | 'glb' | 'obj' | 'json' | 'png'

export type ExportOptions = {
  format: ExportFormat
  scale: PrintScale
  includeFurniture: boolean
  includeRoof: boolean
  includeLot: boolean
  separateStories: boolean
  wallThickness: number
}

export type Selection =
  | { kind: 'none' }
  | { kind: 'wall'; id: string }
  | { kind: 'opening'; id: string }
  | { kind: 'asset'; id: string }
  | { kind: 'stair'; id: string }
  | { kind: 'room'; id: string }

export type CatalogItem = {
  id: string
  name: string
  category: CatalogCategory
  w: number
  d: number
  h: number
  tags: string[]
  printFriendly: boolean
  swatch: string
}

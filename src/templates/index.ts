import { uid } from '../ids'
import type { Listing, Opening, PlacedAsset, Project, Stair, Story, Wall } from '../types'

const blankListing = (partial: Partial<Listing> = {}): Listing => ({
  address: '',
  city: '',
  state: '',
  zip: '',
  price: 0,
  beds: 0,
  baths: 0,
  sqft: 0,
  lotSqft: 0,
  yearBuilt: new Date().getFullYear(),
  agentName: '',
  brokerage: 'Molten Magnolia 3D',
  description: '',
  status: 'draft',
  ...partial,
})

function wall(a: [number, number], b: [number, number], thickness = 0.5): Wall {
  return { id: uid('wall'), a: { x: a[0], y: a[1] }, b: { x: b[0], y: b[1] }, thickness }
}

function opening(
  wallId: string,
  kind: Opening['kind'],
  offset: number,
  width: number,
  height: number,
  sill = 0,
): Opening {
  return { id: uid('open'), wallId, kind, offset, width, height, sill }
}

function asset(catalogId: string, x: number, y: number, rotation = 0): PlacedAsset {
  return { id: uid('asset'), catalogId, position: { x, y }, rotation }
}

function stair(x: number, y: number, width: number, length: number, rotation = 0): Stair {
  return { id: uid('stair'), origin: { x, y }, width, length, rotation }
}

function story(name: string, elevation: number, height: number, walls: Wall[], openings: Opening[], assets: PlacedAsset[], stairs: Stair[] = []): Story {
  return {
    id: uid('story'),
    name,
    elevation,
    height,
    walls,
    openings,
    rooms: [],
    assets,
    stairs,
  }
}

function project(
  name: string,
  stories: Story[],
  listing: Listing,
  roof: Project['roof'] = { style: 'gable', pitch: 0.55, overhang: 1.4, color: '#3d3a36' },
): Project {
  return {
    id: uid('proj'),
    name,
    updatedAt: Date.now(),
    listing,
    stories,
    roof,
    lot: { width: 80, depth: 60 },
    activeStoryId: stories[0].id,
  }
}

export function blankProject(): Project {
  const ground = story('Ground', 0, 9, [], [], [])
  return project('Untitled listing', [ground], blankListing())
}

export function cottageTemplate(): Project {
  const s = 0.5
  const south = wall([0, 0], [28, 0], s)
  const east = wall([28, 0], [28, 20], s)
  const north = wall([28, 20], [0, 20], s)
  const west = wall([0, 20], [0, 0], s)
  const mid = wall([14, 0], [14, 20], s)
  const bath = wall([14, 12], [28, 12], s)
  const closet = wall([22, 12], [22, 20], s)
  const walls = [south, east, north, west, mid, bath, closet]
  const openings = [
    opening(south.id, 'door', 7, 3, 7),
    opening(south.id, 'window', 20, 4, 4, 3),
    opening(west.id, 'window', 8, 4, 4, 3),
    opening(west.id, 'window', 16, 3.5, 4, 3),
    opening(north.id, 'window', 7, 4, 3.5, 3.2),
    opening(north.id, 'window', 21, 3, 3.5, 3.2),
    opening(east.id, 'window', 6, 3.5, 4, 3),
    opening(mid.id, 'passage', 7, 3.4, 7),
    opening(bath.id, 'door', 3, 2.6, 6.8),
    opening(closet.id, 'door', 4, 2.4, 6.8),
  ]
  const assets = [
    asset('sofa-3', 3.6, 4.2, 0),
    asset('coffee-table', 4.2, 8.2, 0),
    asset('armchair', 10.4, 5.6, -20),
    asset('rug', 3.2, 5.4, 0),
    asset('tv-console', 1.1, 10.2, 90),
    asset('plant-tall', 1.4, 1.6, 0),
    asset('dining-table-6', 17.2, 4.6, 0),
    asset('dining-chair', 18.2, 3.1, 0),
    asset('dining-chair', 20.4, 3.1, 0),
    asset('dining-chair', 18.2, 7.4, 180),
    asset('dining-chair', 20.4, 7.4, 180),
    asset('bed-queen', 1.6, 13.4, 0),
    asset('nightstand', 0.6, 12.2, 0),
    asset('dresser', 10.4, 18.4, 180),
    asset('toilet', 15.2, 17.6, 90),
    asset('vanity', 15.4, 13.4, 0),
    asset('tub', 23.4, 13.6, 0),
    asset('tree', -8, 8, 0),
    asset('shrub', -2, -3, 0),
    asset('mailbox', 8, -8, 0),
  ]
  const ground = story('Ground', 0, 8.5, walls, openings, assets)
  return project(
    'Magnolia Cottage',
    [ground],
    blankListing({
      address: '14 Camellia Court',
      city: 'Asheville',
      state: 'NC',
      zip: '28801',
      price: 425000,
      beds: 1,
      baths: 1,
      sqft: 560,
      lotSqft: 4800,
      yearBuilt: 1928,
      agentName: 'Iris Lang',
      description: 'A one-story cottage with a generous living room, eat-in dining, and a garden-facing bedroom. Built as a listing model and a 1:87 print.',
      status: 'ready',
    }),
    { style: 'gable', pitch: 0.7, overhang: 1.6, color: '#6b3a2a' },
  )
}

export function colonialTemplate(): Project {
  const s = 0.5
  const south = wall([0, 0], [32, 0], s)
  const east = wall([32, 0], [32, 24], s)
  const north = wall([32, 24], [0, 24], s)
  const west = wall([0, 24], [0, 0], s)
  const spine = wall([16, 0], [16, 24], s)
  const cross = wall([0, 14], [32, 14], s)
  const bath = wall([24, 14], [24, 24], s)
  const walls1 = [south, east, north, west, spine, cross, bath]
  const openings1 = [
    opening(south.id, 'door', 8, 3.2, 7.2),
    opening(south.id, 'window', 24, 4.5, 4.2, 2.8),
    opening(west.id, 'window', 7, 4, 4.2, 2.8),
    opening(west.id, 'window', 19, 3.6, 4, 3),
    opening(east.id, 'window', 7, 4.5, 4.2, 2.8),
    opening(east.id, 'window', 19, 3.2, 3.6, 3.2),
    opening(north.id, 'window', 8, 4, 3.6, 3.2),
    opening(north.id, 'window', 20, 3.2, 3.6, 3.2),
    opening(north.id, 'window', 28, 2.8, 3.2, 3.4),
    opening(spine.id, 'passage', 7, 4, 7.2),
    opening(spine.id, 'door', 19, 2.8, 6.8),
    opening(cross.id, 'passage', 8, 3.6, 7),
    opening(cross.id, 'passage', 22, 3.4, 7),
    opening(bath.id, 'door', 5, 2.6, 6.8),
  ]
  const stairs1 = [stair(16.6, 15.2, 3.4, 7.2, 0)]
  const assets1 = [
    asset('sofa-3', 2.2, 3.4, 0),
    asset('armchair', 11.4, 4.2, -15),
    asset('coffee-table', 3.4, 7.4, 0),
    asset('rug', 1.8, 4.6, 0),
    asset('fireplace', 0.4, 6.4, 90),
    asset('plant-tall', 13.6, 1.4, 0),
    asset('floor-lamp', 12.8, 11.6, 0),
    asset('dining-table-6', 20.4, 4.6, 0),
    asset('dining-chair', 21.2, 3.1, 0),
    asset('dining-chair', 23.6, 3.1, 0),
    asset('dining-chair', 21.2, 7.6, 180),
    asset('dining-chair', 23.6, 7.6, 180),
    asset('pendant', 22.6, 5.6, 0),
    asset('island', 3.2, 17.6, 0),
    asset('range', 0.6, 20.8, 90),
    asset('fridge', 0.6, 15.2, 90),
    asset('sink-kitchen', 12.8, 21.6, 180),
    asset('base-cabinet', 6.6, 21.8, 180),
    asset('toilet', 25.2, 21.4, 90),
    asset('vanity', 25.4, 14.8, 0),
    asset('tree', -10, 10, 0),
    asset('tree', 38, 18, 0),
    asset('car', 8, -12, 0),
    asset('mailbox', 14, -10, 0),
    asset('shrub', -3, -4, 0),
  ]

  const s2south = wall([0, 0], [32, 0], s)
  const s2east = wall([32, 0], [32, 24], s)
  const s2north = wall([32, 24], [0, 24], s)
  const s2west = wall([0, 24], [0, 0], s)
  const s2spine = wall([16, 0], [16, 24], s)
  const s2cross = wall([0, 14], [32, 14], s)
  const s2bath = wall([24, 14], [24, 24], s)
  const walls2 = [s2south, s2east, s2north, s2west, s2spine, s2cross, s2bath]
  const openings2 = [
    opening(s2south.id, 'window', 8, 4, 4, 3),
    opening(s2south.id, 'window', 24, 4, 4, 3),
    opening(s2west.id, 'window', 7, 3.6, 4, 3),
    opening(s2west.id, 'window', 19, 3.2, 4, 3),
    opening(s2east.id, 'window', 7, 3.6, 4, 3),
    opening(s2east.id, 'window', 19, 3.2, 3.6, 3),
    opening(s2north.id, 'window', 8, 3.6, 3.6, 3.2),
    opening(s2north.id, 'window', 28, 2.8, 3.2, 3.4),
    opening(s2spine.id, 'door', 7, 2.8, 6.8),
    opening(s2spine.id, 'door', 19, 2.8, 6.8),
    opening(s2cross.id, 'door', 8, 2.8, 6.8),
    opening(s2cross.id, 'passage', 20, 4, 7),
    opening(s2bath.id, 'door', 5, 2.6, 6.8),
  ]
  const stairs2 = [stair(16.6, 15.2, 3.4, 7.2, 0)]
  const assets2 = [
    asset('bed-king', 2.2, 3.2, 0),
    asset('nightstand', 0.6, 2.2, 0),
    asset('nightstand', 9.4, 2.2, 0),
    asset('dresser', 1.4, 12.2, 0),
    asset('wardrobe', 12.4, 8.6, 90),
    asset('bed-queen', 18.4, 3.4, 0),
    asset('nightstand', 17.2, 2.2, 0),
    asset('desk', 26.4, 10.8, 180),
    asset('office-chair', 28, 8.8, 180),
    asset('bed-twin', 2.2, 16.4, 0),
    asset('bookshelf', 12.4, 21.6, 180),
    asset('toilet', 25.4, 21.2, 90),
    asset('vanity', 25.4, 14.8, 0),
    asset('shower', 28.2, 16.4, 0),
    asset('plant-small', 14.2, 12.2, 0),
  ]

  const first = story('Ground', 0, 9, walls1, openings1, assets1, stairs1)
  const second = story('Second', 9.2, 8.5, walls2, openings2, assets2, stairs2)
  return project(
    'Cedar Hill Colonial',
    [first, second],
    blankListing({
      address: '88 Cedar Hill Road',
      city: 'Hudson',
      state: 'NY',
      zip: '12534',
      price: 875000,
      beds: 3,
      baths: 2,
      sqft: 1536,
      lotSqft: 10890,
      yearBuilt: 1912,
      agentName: 'Maren Cole',
      description: 'A two-story colonial with a formal dining room, working kitchen, and three bedrooms upstairs. Prepared as a realtor walkthrough model and a printable 1:100 house.',
      status: 'listed',
    }),
    { style: 'gable', pitch: 0.5, overhang: 1.5, color: '#3d3a36' },
  )
}

export function townhouseTemplate(): Project {
  const s = 0.5
  const makeBox = () => {
    const south = wall([0, 0], [18, 0], s)
    const east = wall([18, 0], [18, 36], s)
    const north = wall([18, 36], [0, 36], s)
    const west = wall([0, 36], [0, 0], s)
    return { south, east, north, west }
  }
  const g = makeBox()
  const gMid = wall([0, 22], [18, 22], s)
  const gBath = wall([12, 22], [12, 36], s)
  const walls1 = [g.south, g.east, g.north, g.west, gMid, gBath]
  const openings1 = [
    opening(g.south.id, 'door', 9, 3.2, 7.2),
    opening(g.east.id, 'window', 10, 4, 4, 3),
    opening(g.west.id, 'window', 10, 4, 4, 3),
    opening(g.north.id, 'window', 6, 3.2, 3.6, 3.2),
    opening(gMid.id, 'passage', 6, 3.6, 7),
    opening(gBath.id, 'door', 4, 2.6, 6.8),
  ]
  const stairs1 = [stair(13.2, 1.4, 3.4, 9, 90)]
  const assets1 = [
    asset('sofa-3', 2.2, 6.4, 90),
    asset('coffee-table', 6.2, 8.2, 90),
    asset('rug', 3.2, 6.6, 90),
    asset('dining-table-6', 3.4, 16.4, 0),
    asset('island', 2.4, 26.4, 0),
    asset('range', 0.5, 32.4, 90),
    asset('fridge', 0.5, 23.4, 90),
    asset('toilet', 13.2, 33.6, 0),
    asset('vanity', 13.4, 23.2, 90),
  ]

  const two = makeBox()
  const tMid = wall([0, 16], [18, 16], s)
  const tHall = wall([12, 16], [12, 36], s)
  const walls2 = [two.south, two.east, two.north, two.west, tMid, tHall]
  const openings2 = [
    opening(two.east.id, 'window', 8, 3.6, 4, 3),
    opening(two.west.id, 'window', 8, 3.6, 4, 3),
    opening(two.east.id, 'window', 26, 3.2, 4, 3),
    opening(two.west.id, 'window', 26, 3.2, 4, 3),
    opening(tMid.id, 'door', 6, 2.8, 6.8),
    opening(tHall.id, 'door', 6, 2.6, 6.8),
    opening(tHall.id, 'door', 14, 2.6, 6.8),
  ]
  const stairs2 = [stair(13.2, 1.4, 3.4, 9, 90)]
  const assets2 = [
    asset('bed-queen', 2.2, 3.4, 0),
    asset('dresser', 0.6, 12.6, 90),
    asset('bed-twin', 2.2, 18.6, 0),
    asset('desk', 2.2, 30.4, 0),
    asset('toilet', 13.4, 32.6, 0),
    asset('vanity', 13.4, 17.2, 90),
  ]

  const three = makeBox()
  const rMid = wall([0, 18], [18, 18], s)
  const walls3 = [three.south, three.east, three.north, three.west, rMid]
  const openings3 = [
    opening(three.east.id, 'window', 8, 4, 4, 3),
    opening(three.west.id, 'window', 8, 4, 4, 3),
    opening(three.east.id, 'window', 26, 4, 4, 3),
    opening(three.north.id, 'window', 9, 5, 4, 3),
    opening(rMid.id, 'passage', 9, 4, 7),
  ]
  const assets3 = [
    asset('bed-king', 2.4, 4.2, 0),
    asset('nightstand', 0.8, 3.2, 0),
    asset('tub', 3.2, 22.4, 0),
    asset('vanity', 0.6, 30.2, 90),
    asset('plant-tall', 15.4, 32.6, 0),
  ]

  const first = story('Garden', 0, 9, walls1, openings1, assets1, stairs1)
  const second = story('Piano', 9.2, 9, walls2, openings2, assets2, stairs2)
  const third = story('Attic suite', 18.4, 8.5, walls3, openings3, assets3)
  return project(
    'Pearl Street Townhouse',
    [first, second, third],
    blankListing({
      address: '221 Pearl Street',
      city: 'Charleston',
      state: 'SC',
      zip: '29401',
      price: 1240000,
      beds: 3,
      baths: 2.5,
      sqft: 1944,
      lotSqft: 1800,
      yearBuilt: 1894,
      agentName: 'Theo March',
      description: 'A three-story townhouse stacked for a vertical listing walkthrough. Garden kitchen, two bedroom floors, and a top-floor suite.',
      status: 'ready',
    }),
    { style: 'shed', pitch: 0.28, overhang: 1.1, color: '#5a6570' },
  )
}

export function ranchTemplate(): Project {
  const s = 0.5
  const south = wall([0, 0], [48, 0], s)
  const east = wall([48, 0], [48, 26], s)
  const north = wall([48, 26], [0, 26], s)
  const west = wall([0, 26], [0, 0], s)
  const wing = wall([28, 0], [28, 26], s)
  const bedHall = wall([28, 10], [48, 10], s)
  const bedSplit = wall([38, 10], [38, 26], s)
  const bath = wall([28, 18], [38, 18], s)
  const walls = [south, east, north, west, wing, bedHall, bedSplit, bath]
  const openings = [
    opening(south.id, 'door', 14, 3.4, 7.2),
    opening(south.id, 'window', 6, 5, 4.2, 2.6),
    opening(south.id, 'window', 22, 5, 4.2, 2.6),
    opening(south.id, 'window', 34, 3.6, 4, 3),
    opening(south.id, 'window', 43, 3.6, 4, 3),
    opening(west.id, 'window', 12, 5, 4, 2.8),
    opening(north.id, 'window', 10, 6, 3.6, 3),
    opening(north.id, 'window', 22, 4, 3.6, 3),
    opening(east.id, 'window', 5, 3.6, 4, 3),
    opening(east.id, 'window', 18, 3.2, 3.6, 3.2),
    opening(wing.id, 'passage', 5, 4.2, 7.2),
    opening(wing.id, 'door', 14, 2.8, 6.8),
    opening(wing.id, 'door', 22, 2.8, 6.8),
    opening(bedHall.id, 'door', 5, 2.8, 6.8),
    opening(bedHall.id, 'door', 14, 2.8, 6.8),
    opening(bedSplit.id, 'door', 4, 2.6, 6.8),
    opening(bath.id, 'door', 5, 2.6, 6.8),
  ]
  const assets = [
    asset('sofa-3', 8.4, 8.6, 0),
    asset('loveseat', 3.2, 14.2, 90),
    asset('coffee-table', 9.2, 12.4, 0),
    asset('rug', 7.2, 9.6, 0),
    asset('fireplace', 0.4, 12.4, 90),
    asset('tv-console', 18.4, 1.1, 0),
    asset('dining-table-6', 18.6, 16.4, 0),
    asset('island', 8.4, 20.6, 0),
    asset('range', 0.6, 22.8, 90),
    asset('fridge', 24.6, 23.2, 180),
    asset('sink-kitchen', 16.6, 23.8, 180),
    asset('bed-king', 30.2, 2.2, 0),
    asset('nightstand', 29, 1.2, 0),
    asset('dresser', 30.2, 8.2, 0),
    asset('bed-queen', 39.4, 12.4, 0),
    asset('bed-twin', 29.4, 19.4, 0),
    asset('toilet', 30.2, 23.6, 0),
    asset('vanity', 30.2, 18.6, 0),
    asset('tub', 33.8, 19.2, 0),
    asset('tree', -10, 8, 0),
    asset('tree', 54, 20, 0),
    asset('car', 16, -12, 0),
  ]
  const ground = story('Ground', 0, 9, walls, openings, assets)
  return project(
    'Lowcountry Ranch',
    [ground],
    blankListing({
      address: '6 Palmetto Lane',
      city: 'Beaufort',
      state: 'SC',
      zip: '29902',
      price: 640000,
      beds: 3,
      baths: 2,
      sqft: 1248,
      lotSqft: 14000,
      yearBuilt: 1964,
      agentName: 'Nell Avery',
      description: 'A single-story ranch with an open living-kitchen wing and a quiet bedroom wing. Easy to print as a one-piece 1:87 model.',
      status: 'ready',
    }),
    { style: 'hip', pitch: 0.35, overhang: 2, color: '#8a7a55' },
  )
}

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank lot',
    blurb: 'Empty plate. Draw walls from the floor plane up.',
    stories: 1,
    make: blankProject,
  },
  {
    id: 'cottage',
    name: 'Cottage',
    blurb: 'One-story 28×20 with living, dining, bedroom, and bath.',
    stories: 1,
    make: cottageTemplate,
  },
  {
    id: 'colonial',
    name: 'Colonial',
    blurb: 'Two-story 32×24 listing model with stairs and three bedrooms.',
    stories: 2,
    make: colonialTemplate,
  },
  {
    id: 'townhouse',
    name: 'Townhouse',
    blurb: 'Three stacked floors — garden, piano, attic suite.',
    stories: 3,
    make: townhouseTemplate,
  },
  {
    id: 'ranch',
    name: 'Ranch',
    blurb: 'Single-story 48×26 wing plan, hip roof, open kitchen.',
    stories: 1,
    make: ranchTemplate,
  },
] as const

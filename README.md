# Home Builder

**Molten Magnolia 3D** — a studio for turning floor planes into homes you can walk, list, and print.

Realtors get a listing-ready 3D walkthrough of the house they are selling. You get the same geometry as a scale model for the printer.

## What it does

- Draw walls on a snapped floor plane, story by story
- Cut doors, windows, and cased openings
- Stack multiple stories, with stairs that rise to the floor above
- Place furniture, kitchen, bath, decor, structure, and lot pieces from a built-in catalog
- Choose gable, hip, shed, gambrel, or flat roofs
- Present a dark listing walkthrough with price, beds, baths, and agent copy
- Export **STL** at architectural scales (1:50 through 1:200) for FDM or resin
- Export **GLB** / **OBJ** for listing sites and CAD cleanup
- Save projects in the browser and download the editable JSON

Units are feet. The 3D scene is one unit per foot. Print export scales that mesh into inches.

## Run it

```bash
npm install
npm run dev
```

Open the local Vite URL. Start from Cottage, Colonial (two stories), Townhouse (three stories), Ranch, or a blank lot.

```bash
npm test
npm run build
```

## Studio notes

| Action | How |
| --- | --- |
| Draw walls | Wall tool, click-click, chain until Enter/Esc |
| Openings | Door / Window / Opening, then click a wall |
| Furniture | Pick a catalog tile, click the plan |
| Stories | Tabs along the bottom. Add story copies the exterior walls up |
| Hide a story in 3D | Double-click its tab |
| Present | Listing overlay + auto-orbit camera |
| Print | Export → STL → pick scale. 1:100 is a desk model; 1:87 is HO |

Undo is Ctrl/Cmd+Z. Save is Ctrl/Cmd+S. R rotates a selected piece 90°.

## Catalog

The library is procedural on purpose. Pieces are chunky, painted, and print-friendly so the on-screen house matches a physical scale model — not a photoreal render that falls apart at 1:100.

## Stack

Vite, React, TypeScript, Three.js, React Three Fiber, Zustand. Projects persist in `localStorage` under `molten-magnolia-home-builder`.

/**
 * Generate static OpenTopoMap composites for the quiz extracts.
 *
 * Run:  node scripts/generate-quiz-maps.mjs
 *
 * Fetches OpenTopoMap tiles for a defined area around Courchevel, stitches
 * them into a single PNG, draws Q-point markers, and saves to public/maps/.
 *
 * Usage policy: OpenTopoMap allows non-commercial use of moderate volume
 * with attribution. We're 16 tiles total per run for a personal-use demo,
 * well within fair-use limits. Attribution is rendered alongside the image
 * via the <MapExtract> component.
 */

import { Jimp, intToRGBA, rgbaToInt } from "jimp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "maps");

const TILE_SIZE = 256;
const TILE_HOSTS = ["a", "b", "c"];
const USER_AGENT = "AlpineMapTraining/1.5 (personal-use demo; nigel@performos.ai)";

// Slippy-tile math
function lonToTileX(lon, z) {
  return ((lon + 180) / 360) * Math.pow(2, z);
}
function latToTileY(lat, z) {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * Math.pow(2, z)
  );
}

async function fetchTile(z, x, y) {
  const host = TILE_HOSTS[(x + y) % TILE_HOSTS.length];
  const url = `https://${host}.tile.opentopomap.org/${z}/${x}/${y}.png`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) {
    throw new Error(`Tile fetch failed ${z}/${x}/${y}: ${res.status}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  return await Jimp.read(buf);
}

/**
 * Generate one map composite.
 *
 * @param {object} cfg
 * @param {string} cfg.id            output filename stem (e.g. "c7-1")
 * @param {number} cfg.centerLat
 * @param {number} cfg.centerLon
 * @param {number} cfg.zoom          OSM zoom level (14-15 typical for ~5-10 km views)
 * @param {number} cfg.widthTiles    horizontal tile count (4 = 1024 px)
 * @param {number} cfg.heightTiles   vertical tile count (3 = 768 px)
 * @param {Array}  cfg.markers       [{ label, lat, lon, color? }]
 * @param {Array}  cfg.lines         [[lat,lon],[lat,lon],...] sequences for routes
 */
async function generateMap(cfg) {
  console.log(`\n→ ${cfg.id}: zoom ${cfg.zoom}, ${cfg.widthTiles}×${cfg.heightTiles} tiles`);

  const z = cfg.zoom;
  const cx = lonToTileX(cfg.centerLon, z);
  const cy = latToTileY(cfg.centerLat, z);

  // Top-left tile coords (integer)
  const x0 = Math.floor(cx - cfg.widthTiles / 2);
  const y0 = Math.floor(cy - cfg.heightTiles / 2);

  const W = cfg.widthTiles * TILE_SIZE;
  const H = cfg.heightTiles * TILE_SIZE;
  const canvas = new Jimp({ width: W, height: H, color: 0xfafaf5ff });

  // Fetch + composite tiles
  for (let dx = 0; dx < cfg.widthTiles; dx += 1) {
    for (let dy = 0; dy < cfg.heightTiles; dy += 1) {
      const x = x0 + dx;
      const y = y0 + dy;
      try {
        const tile = await fetchTile(z, x, y);
        canvas.composite(tile, dx * TILE_SIZE, dy * TILE_SIZE);
        process.stdout.write(".");
        // Be a polite citizen — small delay between tile fetches.
        await new Promise((r) => setTimeout(r, 80));
      } catch (err) {
        console.warn(`\n  skipped tile ${z}/${x}/${y}: ${err.message}`);
      }
    }
  }
  console.log("");

  // Convert lat/lon to canvas pixel coords
  function toPx(lat, lon) {
    const tx = lonToTileX(lon, z) - x0;
    const ty = latToTileY(lat, z) - y0;
    return { x: Math.round(tx * TILE_SIZE), y: Math.round(ty * TILE_SIZE) };
  }

  // Draw lines (routes)
  if (cfg.lines) {
    for (const line of cfg.lines) {
      for (let i = 0; i < line.length - 1; i += 1) {
        const a = toPx(line[i][0], line[i][1]);
        const b = toPx(line[i + 1][0], line[i + 1][1]);
        drawLine(canvas, a.x, a.y, b.x, b.y, rgbaToInt(31, 42, 51, 220), 3);
      }
    }
  }

  // Draw markers
  if (cfg.markers) {
    for (const m of cfg.markers) {
      const { x, y } = toPx(m.lat, m.lon);
      const fill = m.color ?? rgbaToInt(163, 59, 42, 235); // crimson default
      drawMarker(canvas, x, y, m.label, fill);
    }
  }

  // Add scale-attribution badge in bottom-right
  drawAttribution(canvas, W, H);

  await fs.mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${cfg.id}.png`);
  await canvas.write(outPath);
  console.log(`  wrote ${outPath}`);
}

// Draw a line via Bresenham (jimp doesn't ship a line primitive)
function drawLine(img, x0, y0, x1, y1, color, thickness = 1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  while (true) {
    drawDisk(img, x, y, thickness, color);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

function drawDisk(img, cx, cy, radius, color) {
  const r2 = radius * radius;
  const W = img.bitmap.width;
  const H = img.bitmap.height;
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx * dx + dy * dy <= r2) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < W && y >= 0 && y < H) {
          img.setPixelColor(color, x, y);
        }
      }
    }
  }
}

function drawMarker(img, x, y, label, fillColor) {
  // White outline halo, crimson fill, black border
  drawDisk(img, x, y, 13, rgbaToInt(255, 255, 255, 230));
  drawDisk(img, x, y, 11, fillColor);
  // Inner ring for legibility
  drawDisk(img, x, y, 4, rgbaToInt(255, 255, 255, 255));

  // Label text via the built-in font
  // (Jimp ships Open Sans bitmap fonts; we use the smallest white one
  // and place it next to the marker.)
}

async function drawAttribution(img, W, H) {
  // Subtle paper-coloured strip across the bottom 22 px
  for (let y = H - 22; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const px = intToRGBA(img.getPixelColor(x, y));
      const blended = rgbaToInt(
        Math.round(px.r * 0.4 + 244 * 0.6),
        Math.round(px.g * 0.4 + 236 * 0.6),
        Math.round(px.b * 0.4 + 216 * 0.6),
        255,
      );
      img.setPixelColor(blended, x, y);
    }
  }
}

// ===== Map definitions =====
// Centered around La Saulire, Courchevel — recognisable alpine terrain
// with summits, ridges, valleys, and a glacier system to the east.
const COURCHEVEL = { lat: 45.4017, lon: 6.5733 };

const MAPS = [
  {
    id: "c7-1",
    centerLat: COURCHEVEL.lat,
    centerLon: COURCHEVEL.lon,
    zoom: 14,
    widthTiles: 4,
    heightTiles: 3,
    markers: [
      { label: "Q1", lat: 45.4090, lon: 6.5650, color: rgbaToInt(163, 59, 42, 235) },  // crimson
      { label: "Q2", lat: 45.3970, lon: 6.5810, color: rgbaToInt(31, 42, 51, 235) },   // ink
      { label: "Q3", lat: 45.4055, lon: 6.5570, color: rgbaToInt(92, 122, 63, 235) },  // moss
    ],
  },
  {
    id: "c7-2",
    centerLat: COURCHEVEL.lat,
    centerLon: COURCHEVEL.lon,
    zoom: 14,
    widthTiles: 4,
    heightTiles: 3,
    markers: [
      { label: "A", lat: 45.4115, lon: 6.5660, color: rgbaToInt(31, 42, 51, 235) },     // ink — start
      { label: "B", lat: 45.4040, lon: 6.5780, color: rgbaToInt(163, 59, 42, 235) },    // crimson — bowl
      { label: "C", lat: 45.3970, lon: 6.5860, color: rgbaToInt(197, 139, 44, 235) },   // amber — spur
      { label: "D", lat: 45.3905, lon: 6.5950, color: rgbaToInt(92, 122, 63, 235) },    // moss — end
    ],
    lines: [
      [
        [45.4115, 6.5660],
        [45.4040, 6.5780],
        [45.3970, 6.5860],
        [45.3905, 6.5950],
      ],
    ],
  },
  {
    id: "d10-1",
    centerLat: COURCHEVEL.lat - 0.012,
    centerLon: COURCHEVEL.lon + 0.018,
    zoom: 14,
    widthTiles: 4,
    heightTiles: 3,
    markers: [
      { label: "Q4", lat: 45.3945, lon: 6.5825, color: rgbaToInt(163, 59, 42, 235) },   // crimson
      { label: "F1", lat: 45.4010, lon: 6.6020, color: rgbaToInt(31, 42, 51, 235) },    // ink
      { label: "F2", lat: 45.3870, lon: 6.5660, color: rgbaToInt(31, 42, 51, 235) },    // ink
    ],
  },
  {
    id: "d10-2",
    centerLat: COURCHEVEL.lat,
    centerLon: COURCHEVEL.lon + 0.005,
    zoom: 14,
    widthTiles: 4,
    heightTiles: 3,
    markers: [
      { label: "Start", lat: 45.4090, lon: 6.5680, color: rgbaToInt(31, 42, 51, 235) },   // ink
      { label: "DP1", lat: 45.4040, lon: 6.5775, color: rgbaToInt(163, 59, 42, 235) },    // crimson
      { label: "DP2", lat: 45.3970, lon: 6.5870, color: rgbaToInt(163, 59, 42, 235) },
      { label: "DP3", lat: 45.3905, lon: 6.5945, color: rgbaToInt(163, 59, 42, 235) },
      { label: "End", lat: 45.3865, lon: 6.6025, color: rgbaToInt(92, 122, 63, 235) },     // moss
    ],
    lines: [
      [
        [45.4090, 6.5680],
        [45.4040, 6.5775],
        [45.3970, 6.5870],
        [45.3905, 6.5945],
        [45.3865, 6.6025],
      ],
    ],
  },
];

async function main() {
  console.log(`Generating ${MAPS.length} OpenTopoMap composites…`);
  for (const m of MAPS) {
    await generateMap(m);
  }
  console.log("\nDone. Maps in public/maps/");
  console.log("Attribution required: 'Map data © OpenStreetMap contributors, rendering © OpenTopoMap (CC-BY-SA)'");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Glossary content. Hand-curated from the Levels 1-3 source workbook
 * vocabulary plus the IMS Nav Programme standards.
 *
 * Each term has:
 *  - id: kebab-case for anchor links (#contour-interval)
 *  - term: display label
 *  - short: ≤140 chars summary for inline tooltips and cards
 *  - long: optional paragraph for the glossary page
 *  - tags: which level(s) the term first appears in
 *  - seeAlso: related term ids to cross-reference
 */

export interface GlossaryTerm {
  id: string;
  term: string;
  short: string;
  long?: string;
  tags: string[];
  seeAlso?: string[];
}

export const GLOSSARY: GlossaryTerm[] = [
  // ===== Map basics (L1) =====
  {
    id: "topographic-map",
    term: "Topographic map",
    short: "A detailed picture of the land seen from above, showing terrain shape, water, vegetation and features in symbols.",
    long: "Unlike a road map (focused on routes between places) or a satellite image (real surfaces), a topographic map selects, simplifies and organises information so a navigator can read the *shape* of the land and make decisions. The standard tool for mountain navigation.",
    tags: ["L1"],
    seeAlso: ["contour-line", "scale", "legend"],
  },
  {
    id: "contour-line",
    term: "Contour line",
    short: "A line on the map joining points of equal elevation. Every point on a single contour is at the same height.",
    long: "Contours are the shape of the ground rendered in 2D. They are usually drawn in brown on alpine maps and labelled with their elevation in metres. Every contour you cross changes your height by the contour interval.",
    tags: ["L1", "L2"],
    seeAlso: ["contour-interval", "index-contour", "spot-height"],
  },
  {
    id: "contour-interval",
    term: "Contour interval",
    short: "The vertical distance between adjacent contour lines. Typically 10 m on a 1:25,000 alpine map.",
    long: "On a 1:25,000 alpine map the interval is usually 10 m; on 1:50,000 it's typically 20 m. The interval is stated on the map margin. Counting contours × interval = total height change.",
    tags: ["L1", "L2"],
    seeAlso: ["contour-line", "index-contour"],
  },
  {
    id: "index-contour",
    term: "Index contour",
    short: "Every fifth (sometimes tenth) contour drawn slightly thicker, with the elevation labelled.",
    long: "Index contours speed up height-counting on dense terrain. The elevation is printed on or near the index line.",
    tags: ["L1"],
    seeAlso: ["contour-line", "contour-interval"],
  },
  {
    id: "spot-height",
    term: "Spot height",
    short: "A small marker on the map giving the elevation of a specific point — usually a summit, col or notable feature.",
    long: "Spot heights are more precise than contours because they mark the actual highest point of a feature, which usually sits between two contour lines. On a 1:25,000 alpine map almost every named summit carries a spot height.",
    tags: ["L1", "L2"],
    seeAlso: ["contour-line", "summit"],
  },
  {
    id: "scale",
    term: "Scale",
    short: "The ratio between map distance and ground distance. 1:25,000 means 1 cm on paper = 250 m on the ground.",
    long: "Common alpine map scales are 1:25,000 (1 cm = 250 m, more terrain detail) and 1:50,000 (1 cm = 500 m, broader overview). Always check the printed scale bar before measuring; PDFs that have been rescaled lose their stated scale.",
    tags: ["L1"],
    seeAlso: ["topographic-map"],
  },
  {
    id: "legend",
    term: "Legend",
    short: "The map's key — confirms what each symbol, colour and line style actually means on this particular sheet.",
    long: "Symbols vary between national mapping agencies (IGN, Swisstopo, OS, Alpenvereinskarte). Always confirm symbol meaning from the legend before trusting your interpretation.",
    tags: ["L1"],
    seeAlso: ["topographic-map"],
  },
  {
    id: "grid-reference",
    term: "Grid reference",
    short: "Eastings then northings. Four-figure references identify a 1 km square; six- and eight-figure references narrow it down.",
    long: "\"Along the corridor, then up the stairs.\" Eastings (the horizontal axis) come first, then northings. A four-figure reference identifies a grid square, not a point. Six-figure references narrow it to a 100 m square; eight-figure to a precise point.",
    tags: ["L1"],
  },

  // ===== Terrain interpretation (L2) =====
  {
    id: "summit",
    term: "Summit",
    short: "A high point shown as a set of closed contour loops with the highest contour at the centre.",
    tags: ["L2"],
    seeAlso: ["spot-height", "col", "ridge", "spur"],
  },
  {
    id: "col",
    term: "Col (saddle)",
    short: "The lowest point on a ridge between two summits. Two opposite sides of contours rise; two opposite sides fall.",
    long: "Cols are critical decision points in mountain navigation — they're where ridges can be crossed, where valleys connect, and where wind funnelling can change conditions sharply. The contour pattern is distinctive and unmistakable once you've seen it a few times.",
    tags: ["L2"],
    seeAlso: ["summit", "ridge"],
  },
  {
    id: "ridge",
    term: "Ridge",
    short: "A long, sustained linear high feature — a continuous backbone connecting summits or cols.",
    tags: ["L2"],
    seeAlso: ["spur", "col", "summit"],
  },
  {
    id: "spur",
    term: "Spur",
    short: "A shorter projection off a ridge or peak. On the map: a V or U of contours pointing downhill.",
    long: "The inverse-pairing rule: V down = spur, V up = valley. Spurs are useful as orientation features and as descent options off summits.",
    tags: ["L2"],
    seeAlso: ["ridge", "valley", "inverse-pairing"],
  },
  {
    id: "valley",
    term: "Valley",
    short: "A V or U of contours pointing uphill, typically with a watercourse running down the centre.",
    tags: ["L2"],
    seeAlso: ["spur", "gully", "inverse-pairing"],
  },
  {
    id: "gully",
    term: "Gully",
    short: "A narrow steep-sided channel, often with very close contours on both flanks. A textbook terrain trap.",
    tags: ["L2"],
    seeAlso: ["valley", "terrain-trap"],
  },
  {
    id: "bowl",
    term: "Bowl",
    short: "A U or arc of contours opening downhill. Tight contours at the back (the headwall), wider on the flanks.",
    long: "Bowls collect wind-loaded snow on the lee side, especially in the upper part below the headwall. Cornices may build on the rim above. Single-mouth bowls are terrain traps because slides have nowhere to escape.",
    tags: ["L2"],
    seeAlso: ["headwall", "cornice", "terrain-trap"],
  },
  {
    id: "headwall",
    term: "Headwall",
    short: "The steep upper back wall of a bowl or corrie. Contours are tightest here; wind-loaded snow accumulates just below.",
    tags: ["L2"],
    seeAlso: ["bowl"],
  },
  {
    id: "cornice",
    term: "Cornice",
    short: "An overhanging mass of windblown snow on the lee side of a ridge, summit or bowl rim.",
    long: "Cornices fail without warning and trigger avalanches on the slope below. Stay back from a cornice line by at least the cornice's full visible length.",
    tags: ["L2"],
    seeAlso: ["lee", "bowl"],
  },
  {
    id: "plateau",
    term: "Plateau",
    short: "A broad, nearly contour-free high area, usually marked by a single closed loop and a spot height.",
    tags: ["L2"],
    seeAlso: ["spot-height", "summit"],
  },
  {
    id: "cliff-band",
    term: "Cliff band",
    short: "Identified by two cues together: merged or near-merged contours AND rock symbology overlaid.",
    long: "Either cue alone can mislead; both together are diagnostic. Rock symbology varies by national series (hatching on IGN, stippling on Swisstopo, rock-face shading on Alpenvereinskarte).",
    tags: ["L2"],
    seeAlso: ["topographic-map"],
  },
  {
    id: "convex-roll",
    term: "Convex roll",
    short: "A point where the slope rolls over and steepens below — hard to spot from above.",
    long: "On the map: contours that suddenly tighten beneath wider contours. A common avalanche trigger point because the slope steepens past your feet without warning.",
    tags: ["L2"],
    seeAlso: ["slope-angle"],
  },
  {
    id: "concave-slope",
    term: "Concave slope",
    short: "A slope that gets gentler as you descend. Contours tight at the top, wider towards the bottom.",
    tags: ["L2"],
  },
  {
    id: "aspect",
    term: "Aspect",
    short: "The compass direction the slope faces — the direction the slope falls towards.",
    long: "Always given to one of eight directions (N, NE, E, SE, S, SW, W, NW), not just four. Avalanche bulletins, sun exposure and snow stability all vary substantially within 45° of aspect.",
    tags: ["L2"],
    seeAlso: ["fall-line", "lee"],
  },
  {
    id: "fall-line",
    term: "Fall line",
    short: "The line a ball would roll if released — perpendicular to the contour, pointing from higher to lower contour.",
    tags: ["L2"],
    seeAlso: ["aspect"],
  },
  {
    id: "lee",
    term: "Lee",
    short: "The downwind side of a feature. Where windblown snow accumulates and where cornices and wind slabs form.",
    tags: ["L2"],
    seeAlso: ["aspect", "cornice"],
  },
  {
    id: "slope-angle",
    term: "Slope angle",
    short: "The steepness of a slope. Read from contour spacing using the C1.2 rule: ~3 mm = 30°, ~5–6 mm = 12° on a 1:25,000 map with 10 m contours.",
    tags: ["L2"],
    seeAlso: ["contour-interval", "comfortable-skinning-band"],
  },
  {
    id: "comfortable-skinning-band",
    term: "Comfortable skinning band",
    short: "8 to 12 degrees comfortable; up to 15 degrees as the upper sustained limit before kick turns become necessary.",
    tags: ["L2"],
    seeAlso: ["slope-angle", "zig-zag"],
  },
  {
    id: "terrain-trap",
    term: "Terrain trap",
    short: "Ground where a small avalanche or fall produces disproportionate consequences — about consequence, not just steepness.",
    long: "A 30° slope is not a terrain trap on its own; a 30° slope above a cliff is. Examples: a gully (concentrates snow), a single-mouth bowl (removes the exit), a slope above a cliff band (adds a vertical drop).",
    tags: ["L2"],
    seeAlso: ["gully", "bowl", "cliff-band"],
  },
  {
    id: "zig-zag",
    term: "Zig-zag (with kick turns)",
    short: "A skinning line that alternates diagonal traverses with kick turns. Used on sustained steeper ground.",
    tags: ["L2"],
    seeAlso: ["comfortable-skinning-band"],
  },
  {
    id: "inverse-pairing",
    term: "Inverse-pairing rule",
    short: "V points uphill = valley. V points downhill = spur. The foundational rule for distinguishing the two most common alpine features.",
    tags: ["L2"],
    seeAlso: ["valley", "spur"],
  },

  // ===== Navigation toolkit (L3) =====
  {
    id: "direction-of-travel-arrow",
    term: "Direction-of-travel arrow (DTA)",
    short: "Fixed on the baseplate. Points where you're going. You walk in the direction it indicates.",
    tags: ["L3"],
    seeAlso: ["compass", "orienting-arrow", "bearing"],
  },
  {
    id: "orienting-arrow",
    term: "Orienting arrow",
    short: "On the floor of the rotating bezel. The alignment target for the magnetic needle when you've set a bearing.",
    long: "Most-confused-with-the-DTA part of the compass. \"Red Fred in the shed\" — line up the red end of the magnetic needle inside the orienting arrow, then walk in the direction the DTA points.",
    tags: ["L3"],
    seeAlso: ["direction-of-travel-arrow", "compass"],
  },
  {
    id: "compass",
    term: "Baseplate compass",
    short: "A clear-plastic compass with rotating bezel, orienting arrow, magnetic needle, direction-of-travel arrow and orienting lines.",
    tags: ["L3"],
    seeAlso: ["direction-of-travel-arrow", "orienting-arrow", "bearing"],
  },
  {
    id: "bearing",
    term: "Bearing",
    short: "A compass direction in degrees from 000 (north) clockwise. Read to within 2°; settled in under 60 seconds (IMS standard).",
    tags: ["L3"],
    seeAlso: ["magnetic-bearing", "grid-bearing", "back-bearing"],
  },
  {
    id: "grid-bearing",
    term: "Grid bearing",
    short: "A bearing read off the map relative to grid north (the vertical map gridlines).",
    tags: ["L3"],
    seeAlso: ["magnetic-bearing", "magnetic-variation"],
  },
  {
    id: "magnetic-bearing",
    term: "Magnetic bearing",
    short: "A bearing as read on the compass — relative to magnetic north. Used in the field. Differs from a grid bearing by the local magnetic variation.",
    tags: ["L3"],
    seeAlso: ["grid-bearing", "magnetic-variation"],
  },
  {
    id: "magnetic-variation",
    term: "Magnetic variation",
    short: "The angle between magnetic north and grid north at a particular location. East variation: add to grid → magnetic. West variation: subtract.",
    long: "Stated on each map sheet at publication date, with the annual rate of change. Over hundreds of metres, a few degrees of variation becomes a real position error.",
    tags: ["L3"],
    seeAlso: ["grid-bearing", "magnetic-bearing"],
  },
  {
    id: "back-bearing",
    term: "Back bearing",
    short: "The reverse of a forward bearing — the bearing FROM the destination back to your starting point.",
    long: "Used to verify position by sighting back at where you came from. Arithmetic: forward ≥ 180° → subtract 180°; forward < 180° → add 180°.",
    tags: ["L3"],
    seeAlso: ["bearing"],
  },
  {
    id: "resection",
    term: "Resection",
    short: "Fixing your position by taking bearings to two or more visible features and drawing back-bearing lines on the map.",
    long: "Minimum two features; optimal angular separation about 90° so a small bearing error gives a small position error. With three features you get a triangle of error — a more reliable fix.",
    tags: ["L3"],
    seeAlso: ["back-bearing"],
  },
  {
    id: "aiming-off",
    term: "Aiming off",
    short: "Deliberately bearing-off your target by a few degrees so you arrive on a known side of a linear feature, not at the exact point.",
    tags: ["L3"],
  },
  {
    id: "altimeter",
    term: "Altimeter",
    short: "Measures atmospheric pressure and converts it to altitude. Rule of thumb: 1 hPa ≈ 8 m of apparent altitude change.",
    long: "Pressure changes with altitude AND with weather. \"Drift\" is altitude change you read while standing still — it's actually pressure change, useful as a barometric trend indicator.",
    tags: ["L3"],
    seeAlso: ["altimeter-calibration", "barometric-trend"],
  },
  {
    id: "altimeter-calibration",
    term: "Altimeter calibration",
    short: "Setting the altimeter to a known elevation point (hut, summit, marked col) to zero out current pressure.",
    long: "Without periodic recalibration, weather drift accumulates as height error. Calibrate at every known reference point along your route.",
    tags: ["L3"],
    seeAlso: ["altimeter"],
  },
  {
    id: "barometric-trend",
    term: "Barometric trend",
    short: "Whether pressure is rising, steady, or falling at one of three rates. Signals weather change.",
    long: "Five IMS bands: Rising / Steady (<0.1 hPa/hr for 3 hr) / Slow fall (<0.5 hPa/hr) / Moderate fall (0.5–1.0 hPa/hr) / Rapid fall (>1.0 hPa/hr). Falling pressure means worsening weather.",
    tags: ["L3"],
    seeAlso: ["altimeter"],
  },
  {
    id: "aspect-of-slope-relocation",
    term: "Aspect-of-slope relocation",
    short: "A four-stage technique for finding your position when lost in poor visibility, using the aspect of the slope you're standing on.",
    long: "Stage 1: take a compass bearing directly down the fall line — this is the aspect bearing. Then use the aspect plus altitude (from altimeter), nearby features and apparent steepness to narrow down which slope on the map you must be on. IMS target time on a known slope: under 2 minutes.",
    tags: ["L3"],
    seeAlso: ["aspect", "altimeter", "fall-line"],
  },
  {
    id: "pole-and-cord",
    term: "Pole-and-cord technique",
    short: "Fixed-bearing probing in white-out conditions: a team member walks ahead on a known cord length while the leader watches.",
    long: "Used only when ALL three conditions hold: visibility under 5–10 m, hidden hazards present, and bearing-walked approach is the only available navigation option. Slow and labour-intensive — not a routine technique.",
    tags: ["L3"],
    seeAlso: ["bearing"],
  },
  {
    id: "route-card",
    term: "Route card",
    short: "Pre-tour planning artefact with eleven standard fields: leg number, start/end points + altitudes, bearing, distance, time, altimeter trigger, key features, avalanche assessment, decision-point criteria, escape route.",
    long: "Locks down the leg-by-leg plan so under stress in the field you refer back to a calm, considered decision rather than improvise. One sheet per tour day.",
    tags: ["L3"],
    seeAlso: ["decision-point", "escape-route"],
  },
  {
    id: "decision-point",
    term: "Decision point",
    short: "A pre-agreed location on a route where a go / no-go criterion is checked.",
    long: "A pre-agreed criterion needs three components: a specific trigger (measurable), a specific action (turn around, alternative line), and a named decision point (where the criterion is checked).",
    tags: ["L3"],
    seeAlso: ["route-card", "escape-route"],
  },
  {
    id: "escape-route",
    term: "Escape route",
    short: "A pre-planned safe withdrawal line for any given leg, recorded on the route card.",
    long: "If a decision-point criterion triggers a turn-around, you don't invent the retreat under pressure — it's already planned. Belongs on the route card alongside the forward leg.",
    tags: ["L3"],
    seeAlso: ["decision-point", "route-card"],
  },
  {
    id: "drift",
    term: "Drift",
    short: "Lateral deviation between your intended bearing line and your actual line as you walk. IMS standard: <15 m per 100 m of travel.",
    tags: ["L3"],
    seeAlso: ["bearing"],
  },

  // ===== Cross-cutting =====
  {
    id: "ims-nav-programme",
    term: "IMS Nav Programme",
    short: "International Mountain Safety / EMS-aligned navigation curriculum standard. Defines the working accuracy, time and procedural standards used throughout this workbook.",
    tags: ["L3", "cross"],
  },
  {
    id: "basi-istd",
    term: "BASI Alpine Level 4 ISTD",
    short: "British Association of Snowsport Instructors' top alpine ski-instructor qualification, with an embedded IMS / EMS Nav Programme assessment.",
    tags: ["cross"],
  },
  {
    id: "underfoot-vocabulary",
    term: "Underfoot description",
    short: "The first part of the four-part standing description — what's beneath your feet (snow type, surface, rock, vegetation, ice).",
    tags: ["L2"],
    seeAlso: ["aspect"],
  },
];

export function getTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.id === id);
}

export function getTermsByLevel(tag: string): GlossaryTerm[] {
  return GLOSSARY.filter((t) => t.tags.includes(tag)).sort((a, b) =>
    a.term.localeCompare(b.term),
  );
}

export function getAllTermsAlpha(): GlossaryTerm[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
}

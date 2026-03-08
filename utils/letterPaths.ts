export type StrokePoint = { x: number; y: number; p: number };
export type Stroke = StrokePoint[];

const interpolate = (p1: StrokePoint, p2: StrokePoint, steps: number): StrokePoint[] => {
  const pts: StrokePoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Ease in out
    const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    pts.push({
      x: p1.x + (p2.x - p1.x) * easeT,
      y: p1.y + (p2.y - p1.y) * easeT,
      p: p1.p + (p2.p - p1.p) * easeT,
    });
  }
  return pts;
};

const buildStroke = (keypoints: StrokePoint[]): Stroke => {
  const stroke: Stroke = [];
  for (let i = 0; i < keypoints.length - 1; i++) {
    const p1 = keypoints[i];
    const p2 = keypoints[i + 1];
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(Math.floor(dist * 100), 10); // 100 points per full width
    const segment = interpolate(p1, p2, steps);
    if (i > 0) segment.shift(); // remove duplicate point
    stroke.push(...segment);
  }
  return stroke;
};

export const LETTER_PATHS: Record<string, Stroke[]> = {
  'A': [
    buildStroke([{x: 0.5, y: 0.2, p: 0.2}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.5, y: 0.2, p: 0.2}, {x: 0.7, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.4, y: 0.6, p: 0.5}, {x: 0.6, y: 0.6, p: 0.5}])
  ],
  'B': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.6, y: 0.2, p: 0.5}, {x: 0.7, y: 0.35, p: 0.8}, {x: 0.6, y: 0.5, p: 0.5}, {x: 0.3, y: 0.5, p: 0.5}]),
    buildStroke([{x: 0.3, y: 0.5, p: 0.5}, {x: 0.65, y: 0.5, p: 0.5}, {x: 0.75, y: 0.65, p: 0.8}, {x: 0.65, y: 0.8, p: 0.5}, {x: 0.3, y: 0.8, p: 0.5}])
  ],
  'C': [
    buildStroke([{x: 0.7, y: 0.3, p: 0.2}, {x: 0.5, y: 0.2, p: 0.5}, {x: 0.3, y: 0.5, p: 0.9}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.7, y: 0.7, p: 0.2}])
  ],
  'D': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.6, y: 0.2, p: 0.5}, {x: 0.75, y: 0.5, p: 0.8}, {x: 0.6, y: 0.8, p: 0.5}, {x: 0.3, y: 0.8, p: 0.5}])
  ],
  'E': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.7, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.3, y: 0.5, p: 0.5}, {x: 0.6, y: 0.5, p: 0.5}]),
    buildStroke([{x: 0.3, y: 0.8, p: 0.5}, {x: 0.7, y: 0.8, p: 0.5}])
  ],
  'F': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.7, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.3, y: 0.5, p: 0.5}, {x: 0.6, y: 0.5, p: 0.5}])
  ],
  'G': [
    buildStroke([{x: 0.7, y: 0.3, p: 0.2}, {x: 0.5, y: 0.2, p: 0.5}, {x: 0.3, y: 0.5, p: 0.9}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.7, y: 0.7, p: 0.2}, {x: 0.7, y: 0.5, p: 0.5}, {x: 0.5, y: 0.5, p: 0.5}])
  ],
  'H': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.7, y: 0.2, p: 0.8}, {x: 0.7, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.5, p: 0.5}, {x: 0.7, y: 0.5, p: 0.5}])
  ],
  'I': [
    buildStroke([{x: 0.5, y: 0.2, p: 0.8}, {x: 0.5, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.7, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.3, y: 0.8, p: 0.5}, {x: 0.7, y: 0.8, p: 0.5}])
  ],
  'J': [
    buildStroke([{x: 0.4, y: 0.2, p: 0.5}, {x: 0.8, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.6, y: 0.2, p: 0.8}, {x: 0.6, y: 0.7, p: 0.8}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.4, y: 0.7, p: 0.2}])
  ],
  'K': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.7, y: 0.2, p: 0.2}, {x: 0.3, y: 0.5, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.5, p: 0.5}, {x: 0.7, y: 0.8, p: 0.8}])
  ],
  'L': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.8, p: 0.5}, {x: 0.7, y: 0.8, p: 0.5}])
  ],
  'M': [
    buildStroke([{x: 0.2, y: 0.8, p: 0.8}, {x: 0.2, y: 0.2, p: 0.8}]),
    buildStroke([{x: 0.2, y: 0.2, p: 0.5}, {x: 0.5, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.5, y: 0.8, p: 0.5}, {x: 0.8, y: 0.2, p: 0.8}]),
    buildStroke([{x: 0.8, y: 0.2, p: 0.8}, {x: 0.8, y: 0.8, p: 0.8}])
  ],
  'N': [
    buildStroke([{x: 0.25, y: 0.8, p: 0.8}, {x: 0.25, y: 0.2, p: 0.8}]),
    buildStroke([{x: 0.25, y: 0.2, p: 0.5}, {x: 0.75, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.75, y: 0.8, p: 0.8}, {x: 0.75, y: 0.2, p: 0.8}])
  ],
  'O': [
    buildStroke([{x: 0.5, y: 0.2, p: 0.5}, {x: 0.25, y: 0.5, p: 0.9}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.75, y: 0.5, p: 0.2}, {x: 0.5, y: 0.2, p: 0.5}])
  ],
  'P': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.6, y: 0.2, p: 0.5}, {x: 0.7, y: 0.35, p: 0.8}, {x: 0.6, y: 0.5, p: 0.5}, {x: 0.3, y: 0.5, p: 0.5}])
  ],
  'Q': [
    buildStroke([{x: 0.5, y: 0.2, p: 0.5}, {x: 0.25, y: 0.5, p: 0.9}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.75, y: 0.5, p: 0.2}, {x: 0.5, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.6, y: 0.6, p: 0.5}, {x: 0.8, y: 0.8, p: 0.8}])
  ],
  'R': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.6, y: 0.2, p: 0.5}, {x: 0.7, y: 0.35, p: 0.8}, {x: 0.6, y: 0.5, p: 0.5}, {x: 0.3, y: 0.5, p: 0.5}]),
    buildStroke([{x: 0.5, y: 0.5, p: 0.5}, {x: 0.7, y: 0.8, p: 0.8}])
  ],
  'S': [
    buildStroke([{x: 0.7, y: 0.3, p: 0.2}, {x: 0.5, y: 0.2, p: 0.5}, {x: 0.3, y: 0.35, p: 0.8}, {x: 0.5, y: 0.5, p: 0.5}, {x: 0.7, y: 0.65, p: 0.8}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.3, y: 0.7, p: 0.2}])
  ],
  'T': [
    buildStroke([{x: 0.2, y: 0.2, p: 0.5}, {x: 0.8, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.5, y: 0.2, p: 0.8}, {x: 0.5, y: 0.8, p: 0.8}])
  ],
  'U': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.3, y: 0.7, p: 0.8}, {x: 0.5, y: 0.8, p: 0.5}, {x: 0.7, y: 0.7, p: 0.8}, {x: 0.7, y: 0.2, p: 0.8}])
  ],
  'V': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.5, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.5, y: 0.8, p: 0.5}, {x: 0.7, y: 0.2, p: 0.2}])
  ],
  'W': [
    buildStroke([{x: 0.2, y: 0.2, p: 0.8}, {x: 0.35, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.35, y: 0.8, p: 0.5}, {x: 0.5, y: 0.4, p: 0.2}]),
    buildStroke([{x: 0.5, y: 0.4, p: 0.8}, {x: 0.65, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.65, y: 0.8, p: 0.5}, {x: 0.8, y: 0.2, p: 0.2}])
  ],
  'X': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.7, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.7, y: 0.2, p: 0.2}, {x: 0.3, y: 0.8, p: 0.8}])
  ],
  'Y': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.8}, {x: 0.5, y: 0.5, p: 0.8}]),
    buildStroke([{x: 0.7, y: 0.2, p: 0.2}, {x: 0.5, y: 0.5, p: 0.8}]),
    buildStroke([{x: 0.5, y: 0.5, p: 0.8}, {x: 0.5, y: 0.8, p: 0.8}])
  ],
  'Z': [
    buildStroke([{x: 0.3, y: 0.2, p: 0.5}, {x: 0.7, y: 0.2, p: 0.5}]),
    buildStroke([{x: 0.7, y: 0.2, p: 0.8}, {x: 0.3, y: 0.8, p: 0.8}]),
    buildStroke([{x: 0.3, y: 0.8, p: 0.5}, {x: 0.7, y: 0.8, p: 0.5}])
  ]
};

export const getLetterPath = (letter: string): Stroke[] => {
  if (LETTER_PATHS[letter]) return LETTER_PATHS[letter];
  // Generic fallback: a simple S-curve or circle
  return [
    buildStroke([
      {x: 0.5, y: 0.2, p: 0.2}, 
      {x: 0.3, y: 0.5, p: 0.8}, 
      {x: 0.7, y: 0.5, p: 0.8}, 
      {x: 0.5, y: 0.8, p: 0.2}
    ])
  ];
};

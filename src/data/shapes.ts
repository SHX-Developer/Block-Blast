export interface Shape {
  id: string;
  color: string;
  cells: [number, number][]; // [row, col] offsets from top-left of bounding box
  weight: number; // higher = more common
}

export function getShapeBounds(shape: Shape): { rows: number; cols: number } {
  const maxRow = Math.max(...shape.cells.map(([r]) => r)) + 1;
  const maxCol = Math.max(...shape.cells.map(([, c]) => c)) + 1;
  return { rows: maxRow, cols: maxCol };
}

export const SHAPES: Shape[] = [
  // ─── Singles ───────────────────────────────────────────────────────────────
  {
    id: 'single',
    color: '#FF6B81',
    cells: [[0, 0]],
    weight: 3,
  },

  // ─── Doubles ───────────────────────────────────────────────────────────────
  {
    id: 'h2',
    color: '#FF9F43',
    cells: [[0, 0], [0, 1]],
    weight: 5,
  },
  {
    id: 'v2',
    color: '#FF9F43',
    cells: [[0, 0], [1, 0]],
    weight: 5,
  },

  // ─── Triples – lines ───────────────────────────────────────────────────────
  {
    id: 'h3',
    color: '#FFC312',
    cells: [[0, 0], [0, 1], [0, 2]],
    weight: 6,
  },
  {
    id: 'v3',
    color: '#FFC312',
    cells: [[0, 0], [1, 0], [2, 0]],
    weight: 6,
  },

  // ─── Quad lines ────────────────────────────────────────────────────────────
  {
    id: 'h4',
    color: '#2ECC71',
    cells: [[0, 0], [0, 1], [0, 2], [0, 3]],
    weight: 3,
  },
  {
    id: 'v4',
    color: '#2ECC71',
    cells: [[0, 0], [1, 0], [2, 0], [3, 0]],
    weight: 3,
  },

  // ─── Quint lines ───────────────────────────────────────────────────────────
  {
    id: 'h5',
    color: '#17C0EB',
    cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
    weight: 1,
  },
  {
    id: 'v5',
    color: '#17C0EB',
    cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
    weight: 1,
  },

  // ─── Squares ───────────────────────────────────────────────────────────────
  {
    id: 'sq2',
    color: '#F8B500',
    cells: [[0, 0], [0, 1], [1, 0], [1, 1]],
    weight: 5,
  },
  {
    id: 'sq3',
    color: '#E55039',
    cells: [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
    weight: 1,
  },

  // ─── Small corners (3-cell L) ──────────────────────────────────────────────
  {
    id: 'cornerTL',
    color: '#A29BFE',
    cells: [[0, 0], [0, 1], [1, 0]],
    weight: 5,
  },
  {
    id: 'cornerTR',
    color: '#A29BFE',
    cells: [[0, 0], [0, 1], [1, 1]],
    weight: 5,
  },
  {
    id: 'cornerBL',
    color: '#A29BFE',
    cells: [[0, 0], [1, 0], [1, 1]],
    weight: 5,
  },
  {
    id: 'cornerBR',
    color: '#A29BFE',
    cells: [[0, 1], [1, 0], [1, 1]],
    weight: 5,
  },

  // ─── Big L-shapes (4-cell) ─────────────────────────────────────────────────
  {
    id: 'L_dr',  // L going down-right
    color: '#6C5CE7',
    cells: [[0, 0], [1, 0], [2, 0], [2, 1]],
    weight: 3,
  },
  {
    id: 'L_dl',  // L going down-left (J shape)
    color: '#6C5CE7',
    cells: [[0, 1], [1, 1], [2, 0], [2, 1]],
    weight: 3,
  },
  {
    id: 'L_ur',  // L going up-right
    color: '#6C5CE7',
    cells: [[0, 0], [0, 1], [1, 0], [2, 0]],
    weight: 3,
  },
  {
    id: 'L_ul',  // L going up-left
    color: '#6C5CE7',
    cells: [[0, 0], [0, 1], [1, 1], [2, 1]],
    weight: 3,
  },

  // ─── T-shapes (4-cell) ─────────────────────────────────────────────────────
  {
    id: 'T_down',
    color: '#00D2D3',
    cells: [[0, 0], [0, 1], [0, 2], [1, 1]],
    weight: 3,
  },
  {
    id: 'T_up',
    color: '#00D2D3',
    cells: [[0, 1], [1, 0], [1, 1], [1, 2]],
    weight: 3,
  },
  {
    id: 'T_right',
    color: '#00D2D3',
    cells: [[0, 0], [1, 0], [1, 1], [2, 0]],
    weight: 3,
  },
  {
    id: 'T_left',
    color: '#00D2D3',
    cells: [[0, 1], [1, 0], [1, 1], [2, 1]],
    weight: 3,
  },

  // ─── S / Z shapes ──────────────────────────────────────────────────────────
  {
    id: 'S_h',
    color: '#FD79A8',
    cells: [[0, 1], [0, 2], [1, 0], [1, 1]],
    weight: 2,
  },
  {
    id: 'Z_h',
    color: '#FD79A8',
    cells: [[0, 0], [0, 1], [1, 1], [1, 2]],
    weight: 2,
  },
  {
    id: 'S_v',
    color: '#FD79A8',
    cells: [[0, 0], [1, 0], [1, 1], [2, 1]],
    weight: 2,
  },
  {
    id: 'Z_v',
    color: '#FD79A8',
    cells: [[0, 1], [1, 0], [1, 1], [2, 0]],
    weight: 2,
  },

  // ─── Big corners (5-cell) ──────────────────────────────────────────────────
  {
    id: 'bigCornerTL',
    color: '#55EFC4',
    cells: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
    weight: 2,
  },
  {
    id: 'bigCornerTR',
    color: '#55EFC4',
    cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
    weight: 2,
  },
  {
    id: 'bigCornerBL',
    color: '#55EFC4',
    cells: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
    weight: 2,
  },
  {
    id: 'bigCornerBR',
    color: '#55EFC4',
    cells: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]],
    weight: 2,
  },
];

export function weightedRandom(): Shape {
  const total = SHAPES.reduce((s, sh) => s + sh.weight, 0);
  let rand = Math.random() * total;
  for (const shape of SHAPES) {
    rand -= shape.weight;
    if (rand <= 0) return shape;
  }
  return SHAPES[SHAPES.length - 1];
}

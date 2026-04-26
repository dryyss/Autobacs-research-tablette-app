'use client';

// ─── Encodage EAN-13 ────────────────────────────────────────────
// Tables L / G / R — 7 modules par chiffre
const L = ['0001101', '0011001', '0010011', '0111101', '0100011',
           '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101',
           '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100',
           '1001110', '1010000', '1000100', '1001000', '1110100'];
// Parité des 6 chiffres gauches selon le 1er chiffre du code
const PARITIES = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
                  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

function buildEAN13Bars(ean: string): string {
  if (!/^\d{13}$/.test(ean)) return '';
  const first = parseInt(ean[0], 10);
  const parity = PARITIES[first];
  let bars = '101'; // start guard
  for (let i = 0; i < 6; i++) {
    const d = parseInt(ean[i + 1], 10);
    bars += parity[i] === 'L' ? L[d] : G[d];
  }
  bars += '01010'; // middle guard
  for (let i = 0; i < 6; i++) {
    const d = parseInt(ean[i + 7], 10);
    bars += R[d];
  }
  bars += '101'; // end guard
  return bars; // 3+42+5+42+3 = 95 modules
}

interface BarcodeProps {
  value: string;
  /** Largeur totale SVG (défaut 200) */
  width?: number;
  /** Hauteur des barres (défaut 60) */
  barHeight?: number;
  /** Couleur des barres (défaut noir) */
  color?: string;
  /** Couleur du fond (défaut blanc) */
  background?: string;
}

/** Rend un code-barres EAN-13 scannable en SVG. */
export default function Barcode({
  value,
  width = 200,
  barHeight = 60,
  color = '#000',
  background = '#fff',
}: BarcodeProps) {
  const bars = buildEAN13Bars(value);
  if (!bars) {
    return (
      <div className="text-xs text-red-500">Code-barres invalide : {value}</div>
    );
  }

  // 95 modules + quiet zone ~9 modules de chaque côté = 113 modules
  const QUIET = 9;
  const totalModules = bars.length + QUIET * 2;
  const moduleW = width / totalModules;
  const totalHeight = barHeight + 16; // place pour le texte humain

  const rects: JSX.Element[] = [];
  for (let i = 0; i < bars.length; i++) {
    if (bars[i] === '1') {
      rects.push(
        <rect
          key={i}
          x={(QUIET + i) * moduleW}
          y={0}
          width={moduleW}
          height={barHeight}
          fill={color}
        />
      );
    }
  }

  // Texte lisible humain sous le code (groupes : 1 | 6 | 6 )
  const left = value.slice(1, 7);
  const right = value.slice(7);
  const first = value[0];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${totalHeight}`}
      width={width}
      height={totalHeight}
      style={{ background, display: 'block' }}
    >
      {rects}
      <g fontFamily="monospace" fontSize={moduleW * 7} fill={color}>
        <text x={moduleW * 3} y={totalHeight - 3} textAnchor="middle">
          {first}
        </text>
        <text x={moduleW * (QUIET + 3 + 21)} y={totalHeight - 3} textAnchor="middle">
          {left}
        </text>
        <text x={moduleW * (QUIET + 3 + 42 + 5 + 21)} y={totalHeight - 3} textAnchor="middle">
          {right}
        </text>
      </g>
    </svg>
  );
}

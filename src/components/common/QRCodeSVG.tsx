import React from 'react';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  className?: string;
  symbol?: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({ 
  value, 
  size = 200, 
  className = '',
  symbol = 'PRISM'
}) => {
  // Generate deterministic pseudo-random QR pattern based on address hash
  const cells = 25; // 25x25 grid
  const hash = Array.from(value).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  
  const grid: boolean[][] = Array(cells).fill(null).map(() => Array(cells).fill(false));

  // Seed corner finder patterns (standard QR corner boxes)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(cells - 7, 0); // Top-right
  drawFinder(0, cells - 7); // Bottom-left

  // Fill alignment and deterministic body
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      // Don't overwrite finder patterns or center logo zone
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= cells - 8;
      const inBottomLeft = r >= cells - 8 && c < 8;
      const inCenter = r >= 10 && r <= 14 && c >= 10 && c <= 14;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
        const valChar = value.charCodeAt((r * cells + c) % value.length);
        const bit = ((hash ^ (r * 31 + c * 17) ^ valChar) % 2 === 0);
        grid[r][c] = bit;
      }
    }
  }

  const cellSize = size / cells;

  return (
    <div className={`relative inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize - 0.4}
                height={cellSize - 0.4}
                rx={cellSize * 0.25}
                fill="#0B0E14"
              />
            ) : null
          )
        )}
      </svg>
      {/* Center Logo badge */}
      <div 
        className="absolute flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold shadow-md border-2 border-white"
        style={{ width: size * 0.22, height: size * 0.22, fontSize: size * 0.08 }}
      >
        <span>{symbol.slice(0, 3)}</span>
      </div>
    </div>
  );
};

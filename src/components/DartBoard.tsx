import React from 'react';
import { SliceItem, DartCoord } from '../types/game';

interface DartBoardProps {
  slices: SliceItem[];
  highlightSliceIndex: number | null;
  isShaking: boolean;
  stuckDarts: DartCoord[];
  flyingDartPos: { x: number; y: number; scale: number; angle: number; opacity: number } | null;
  onSliceClick?: (index: number) => void;
}

export const DartBoard: React.FC<DartBoardProps> = ({
  slices,
  highlightSliceIndex,
  isShaking,
  stuckDarts,
  flyingDartPos,
}) => {
  const size = 460;
  const center = size / 2;
  const radius = 205;
  const innerRadius = 38; // bullseye edge
  const numSlices = slices.length || 25;
  const anglePerSlice = 360 / numSlices;

  // Convert polar coordinates to Cartesian (x, y)
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // Generate SVG path for circular sector
  const describeWedge = (startAngle: number, endAngle: number, rInner: number, rOuter: number) => {
    const startOuter = polarToCartesian(center, center, rOuter, endAngle);
    const endOuter = polarToCartesian(center, center, rOuter, startAngle);
    const startInner = polarToCartesian(center, center, rInner, startAngle);
    const endInner = polarToCartesian(center, center, rInner, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', startOuter.x, startOuter.y,
      'A', rOuter, rOuter, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
      'L', startInner.x, startInner.y,
      'A', rInner, rInner, 0, largeArcFlag, 1, endInner.x, endInner.y,
      'Z',
    ].join(' ');
  };

  return (
    <div className="relative h-full max-h-full max-w-full aspect-square mx-auto flex items-center justify-center">
      {/* Decorative Outer Glow on win */}
      {highlightSliceIndex !== null && (
        <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-2xl animate-pulse pointer-events-none" />
      )}

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className={`w-full h-full drop-shadow-2xl transition-transform duration-100 ${
          isShaking ? 'animate-board-hit' : ''
        }`}
        style={{ filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.4))' }}
      >
        <defs>
          {/* Deep Navy/Carbon Rim (NO BROWN) */}
          <radialGradient id="rimNavyGradient" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#1e293b" />
            <stop offset="96%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Platinum / Golden Rivet */}
          <radialGradient id="platinumBolt" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#854d0e" />
          </radialGradient>

          {/* Bullseye Gradient */}
          <radialGradient id="bullseyeRed" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="70%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </radialGradient>

          <filter id="shadowSlice" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.35" />
          </filter>

          <filter id="dartShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="4" dy="7" />
            <feComponentTransfer><feFuncA type="linear" slope="0.4" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Dark Navy Rim (NO BROWN) */}
        <circle
          cx={center}
          cy={center}
          r={radius + 18}
          fill="url(#rimNavyGradient)"
          stroke="#0f172a"
          strokeWidth="4"
        />

        {/* Silver inner ring */}
        <circle
          cx={center}
          cy={center}
          r={radius + 2}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2.5"
        />

        {/* 25 Rivets around circumference */}
        {Array.from({ length: numSlices }).map((_, i) => {
          const boltAngle = i * anglePerSlice;
          const pos = polarToCartesian(center, center, radius + 10, boltAngle);
          return (
            <g key={`bolt-${i}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="3.5"
                fill="url(#platinumBolt)"
                stroke="#0f172a"
                strokeWidth="0.6"
              />
              <circle
                cx={pos.x - 0.8}
                cy={pos.y - 0.8}
                r="0.9"
                fill="#ffffff"
                opacity="0.85"
              />
            </g>
          );
        })}

        {/* 25 Slices of the Board (Including 20, 15, 10, 5) */}
        <g id="board-slices">
          {slices.map((slice, index) => {
            const startAngle = index * anglePerSlice - anglePerSlice / 2;
            const endAngle = startAngle + anglePerSlice;
            const midAngle = (startAngle + endAngle) / 2;
            const isWinner = highlightSliceIndex === index;
            const isPrizeNumber = slice.type === 'number';

            // Text placement coordinate (at ~66% radius, r = 130)
            const textPos = polarToCartesian(center, center, 130, midAngle);

            return (
              <g key={slice.id || index} className="transition-all duration-300">
                {/* Wedge slice path */}
                <path
                  d={describeWedge(startAngle, endAngle, innerRadius, radius)}
                  fill={slice.color}
                  stroke={isWinner ? '#facc15' : '#0f172a'}
                  strokeWidth={isWinner ? '3.5' : '1.6'}
                  className={isWinner ? 'animate-slice-pulse' : ''}
                  style={
                    isWinner
                      ? {
                          filter: 'brightness(1.3) drop-shadow(0 0 16px #facc15)',
                        }
                      : isPrizeNumber
                      ? {
                          filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.75))',
                        }
                      : {}
                  }
                />

                {/* Subtle highlight arc */}
                <path
                  d={describeWedge(startAngle, endAngle, radius - 3, radius)}
                  fill="#ffffff"
                  opacity={isPrizeNumber ? 0.35 : 0.15}
                />

                {/* Text inside wedge */}
                <g
                  transform={`translate(${textPos.x}, ${textPos.y}) rotate(${midAngle})`}
                  className="pointer-events-none select-none"
                >
                  {isWinner && (
                    <circle
                      cx="0"
                      cy="0"
                      r="16"
                      fill="none"
                      stroke="#fef08a"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-spin"
                    />
                  )}

                  {isPrizeNumber ? (
                    /* Prize Numbers: 20, 15, 10, 5 */
                    <g transform="translate(0, 0)">
                      <circle cx="0" cy="-13" r="5" fill="#fef08a" stroke="#0f172a" strokeWidth="0.8" />
                      <text x="0" y="-11.5" textAnchor="middle" dominantBaseline="central" fontSize="6.5">
                        ⭐
                      </text>
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={slice.value === 20 ? '#0f172a' : '#ffffff'}
                        stroke={slice.value === 20 ? '#fef08a' : '#0f172a'}
                        strokeWidth="2.5"
                        paintOrder="stroke"
                        fontSize="14"
                        fontWeight="900"
                        letterSpacing="-0.02em"
                      >
                        {slice.value}
                      </text>
                    </g>
                  ) : slice.type === 'coba_lagi' ? (
                    /* COBA LAGI (Stacked text) */
                    <g transform="translate(0, 0)">
                      <text
                        x="0"
                        y="-5"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        paintOrder="stroke"
                        fontSize="8"
                        fontWeight="900"
                        letterSpacing="0.02em"
                      >
                        COBA
                      </text>
                      <text
                        x="0"
                        y="6"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#ffffff"
                        stroke="#0f172a"
                        strokeWidth="2.5"
                        paintOrder="stroke"
                        fontSize="8"
                        fontWeight="900"
                        letterSpacing="0.02em"
                      >
                        LAGI
                      </text>
                    </g>
                  ) : (
                    /* ZONK */
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      stroke="#0f172a"
                      strokeWidth="2.5"
                      paintOrder="stroke"
                      fontSize="10"
                      fontWeight="900"
                      letterSpacing="0.02em"
                    >
                      ZONK
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </g>

        {/* Center Bullseye */}
        <g id="bullseye" filter="url(#shadowSlice)">
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="#ffffff"
            stroke="#0f172a"
            strokeWidth="3"
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 6}
            fill="url(#bullseyeRed)"
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 16}
            fill="#ffffff"
            stroke="#b91c1c"
            strokeWidth="2"
          />
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 24}
            fill="url(#bullseyeRed)"
          />
          <circle
            cx={center - 3}
            cy={center - 3}
            r="3.5"
            fill="#ffffff"
            opacity="0.8"
          />
        </g>

        {/* Stuck Darts - STRICTLY SYMMETRIC WITH NEEDLE AT (0,0) */}
        {stuckDarts.map((dart) => (
          <g
            key={dart.id}
            transform={`translate(${center + dart.x}, ${center + dart.y}) rotate(${dart.angle})`}
            filter="url(#dartShadow)"
            className="animate-dart-wobble"
          >
            {/* Target puncture ring & steel point */}
            <circle cx="0" cy="0" r="3.2" fill="#0f172a" stroke="#facc15" strokeWidth="1" />

            {/* Steel Needle */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#e2e8f0"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* Brass Barrel (symmetric) */}
            <rect
              x="-3"
              y="10"
              width="6"
              height="14"
              rx="1.5"
              fill="#f59e0b"
              stroke="#0f172a"
              strokeWidth="1"
            />
            <line x1="-3" y1="14" x2="3" y2="14" stroke="#fef08a" strokeWidth="1" />
            <line x1="-3" y1="18" x2="3" y2="18" stroke="#fef08a" strokeWidth="1" />

            {/* White Shaft */}
            <line
              x1="0"
              y1="24"
              x2="0"
              y2="42"
              stroke="#ffffff"
              strokeWidth="2.4"
            />

            {/* Red Flights - Symmetrical left/right */}
            <polygon
              points="0,42 -9,50 -8,62 0,55"
              fill="#ef4444"
              stroke="#450a0a"
              strokeWidth="1"
            />
            <polygon
              points="0,42 9,50 8,62 0,55"
              fill="#dc2626"
              stroke="#450a0a"
              strokeWidth="1"
            />
            <polygon
              points="0,42 -4,64 0,60 4,64"
              fill="#f87171"
              stroke="#450a0a"
              strokeWidth="0.8"
            />

            {/* Centered Result Badge on Dart Tail */}
            <g transform="translate(0, 72)">
              <rect
                x="-14"
                y="-6"
                width="28"
                height="12"
                rx="3.5"
                fill="#0f172a"
                stroke="#fef08a"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x="0"
                y="2"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#fef08a"
                fontSize="7.5"
                fontWeight="900"
              >
                {dart.label === 'COBA LAGI' ? '+1' : dart.label === 'ZONK' ? 'ZONK' : dart.label}
              </text>
            </g>
          </g>
        ))}

        {/* Flying Dart */}
        {flyingDartPos && flyingDartPos.opacity > 0 && (
          <g
            transform={`translate(${flyingDartPos.x}, ${flyingDartPos.y}) scale(${flyingDartPos.scale}) rotate(${flyingDartPos.angle})`}
            opacity={flyingDartPos.opacity}
            filter="url(#dartShadow)"
          >
            <polygon points="0,0 -3.5,-16 3.5,-16" fill="#cbd5e1" stroke="#334155" strokeWidth="1" />
            <rect x="-4.5" y="-32" width="9" height="16" rx="2" fill="#f59e0b" stroke="#0f172a" strokeWidth="1.2" />
            <line x1="-4.5" y1="-24" x2="4.5" y2="-24" stroke="#fbbf24" strokeWidth="1.2" />
            <line x1="0" y1="-32" x2="0" y2="-56" stroke="#ffffff" strokeWidth="2.5" />
            <polygon points="0,-56 -18,-72 -16,-84 0,-64" fill="#ef4444" stroke="#450a0a" strokeWidth="1.2" />
            <polygon points="0,-56 18,-72 16,-84 0,-64" fill="#dc2626" stroke="#450a0a" strokeWidth="1.2" />
            <polygon points="0,-56 -6,-90 0,-86 6,-90" fill="#f87171" stroke="#450a0a" strokeWidth="1.2" />
          </g>
        )}
      </svg>
    </div>
  );
};

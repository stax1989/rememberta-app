import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Mood } from '../types';

interface PieDataItem {
  mood: Mood;
  count: number;
  color: string;
}

interface Props {
  data: PieDataItem[];
  onPress?: (mood: Mood) => void;
}

const SIZE = 120;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 2; // small inset to avoid clipping

/**
 * Convert polar coordinates (angle in degrees, 0 = 12 o'clock, clockwise)
 * to Cartesian (x, y) relative to the pie center.
 */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path string for a single pie slice.
 *
 * Returns a closed path: M (center) L (arc-start) A (arc) Z
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
}

export default function SimplePieChart({ data, onPress }: Props) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return null;
  }

  // Build slice descriptors, skipping zero-count entries
  let currentAngle = 0;
  const slices = data
    .filter(d => d.count > 0)
    .map(d => {
      const angle = (d.count / total) * 360;
      const path = describeArc(CENTER, CENTER, RADIUS, currentAngle, currentAngle + angle);
      const slice = { ...d, path };
      currentAngle += angle;
      return slice;
    });

  return (
    <View>
      <Svg width={SIZE} height={SIZE}>
        {slices.length === 1 ? (
          // Single slice: render a full circle (faster + avoids arc edge-cases)
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill={slices[0].color}
            onPress={() => onPress?.(slices[0].mood)}
          />
        ) : (
          slices.map((slice, index) => (
            <Path
              key={index}
              d={slice.path}
              fill={slice.color}
              onPress={() => onPress?.(slice.mood)}
            />
          ))
        )}
      </Svg>
    </View>
  );
}

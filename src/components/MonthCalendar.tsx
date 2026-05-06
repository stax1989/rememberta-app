import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mood, MOOD_EMOJI } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';

interface Props {
  /** Display year, e.g. 2026 */
  year: number;
  /** Display month, 1-indexed (1 = January) */
  month: number;
  /** Mapping of date string "YYYY-MM-DD" to Mood */
  moodData: Record<string, Mood>;
  /** Called when a day *with data* is pressed */
  onDayPress?: (dateStr: string, mood: Mood | null) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const CELL_SIZE = 44;

/** Number of days in a given month (month is 1-indexed). */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Day-of-week for the 1st of a given month (0=Sun .. 6=Sat). */
function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

export default function MonthCalendar({
  year: initialYear,
  month: initialMonth,
  moodData,
  onDayPress,
}: Props) {
  const [displayYear, setDisplayYear] = useState(initialYear);
  const [displayMonth, setDisplayMonth] = useState(initialMonth);

  // ---- derived values ----
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfMonth(displayYear, displayMonth);

  // Build grid: null = empty placeholder, number = day-of-month
  const cells: (number | null)[] = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      result.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(d);
    }
    return result;
  }, [firstDay, daysInMonth]);

  // ---- navigation ----
  const goToPrevMonth = () => {
    if (displayMonth === 1) {
      setDisplayYear(y => y - 1);
      setDisplayMonth(12);
    } else {
      setDisplayMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (displayMonth === 12) {
      setDisplayYear(y => y + 1);
      setDisplayMonth(1);
    } else {
      setDisplayMonth(m => m + 1);
    }
  };

  // ---- press handler ----
  const handleDayPress = (day: number) => {
    const dateStr = `${displayYear}-${pad(displayMonth)}-${pad(day)}`;
    const mood = moodData[dateStr] ?? null;
    onDayPress?.(dateStr, mood);
  };

  // ---- render ----
  return (
    <View style={styles.container}>
      {/* Header row: left-nav | title | right-nav */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.navButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {displayYear}年{displayMonth}月
        </Text>
        <TouchableOpacity onPress={goToNextMonth} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.navButton}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, i) => (
          <View key={i} style={styles.weekCell}>
            <Text style={styles.weekText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.dayCell} />;
          }

          const dateStr = `${displayYear}-${pad(displayMonth)}-${pad(day)}`;
          const mood = moodData[dateStr];
          const isToday = dateStr === todayStr;

          // Day has mood data => touchable, shows emoji
          if (mood) {
            return (
              <TouchableOpacity
                key={dateStr}
                style={[styles.dayCell, isToday && styles.todayBorder]}
                activeOpacity={0.6}
                onPress={() => handleDayPress(day)}
              >
                <Text style={styles.dayNumber}>{day}</Text>
                <Text style={styles.indicator}>{MOOD_EMOJI[mood]}</Text>
              </TouchableOpacity>
            );
          }

          // No mood data => gray dot, still pressable
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dayCell, isToday && styles.todayBorder]}
              activeOpacity={0.6}
              onPress={() => handleDayPress(day)}
            >
              <Text style={styles.dayNumber}>{day}</Text>
              <Text style={styles.grayDot}>{'●'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  navButton: {
    fontSize: FONTS.subtitle,
    color: COLORS.primary,
    fontWeight: '600',
    paddingHorizontal: SPACING.sm,
  },
  monthTitle: {
    fontSize: FONTS.body,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* Weekday row */
  weekRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  weekCell: {
    width: `${100 / 7}%` as unknown as number,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  weekText: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  /* Grid */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%` as unknown as number,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    minHeight: CELL_SIZE,
    justifyContent: 'center',
  },
  todayBorder: {
    borderRadius: CELL_SIZE / 2,
    borderWidth: 2,
    borderColor: COLORS.calendarToday,
  },
  dayNumber: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    marginBottom: 2,
  },
  indicator: {
    fontSize: 16,
    lineHeight: 20,
  },
  grayDot: {
    fontSize: 16,
    lineHeight: 20,
    color: COLORS.calendarDot,
  },
});

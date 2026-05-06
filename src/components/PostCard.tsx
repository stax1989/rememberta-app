import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Post } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import MoodEmoji from './MoodEmoji';
import ImageGrid from './ImageGrid';

interface Props {
  /** The diary post to display */
  post: Post;
  /** Whether to show the date/time header (default true) */
  showDate?: boolean;
}

function pad(n: number): string {
  return n < 10 ? '0' + n : '' + n;
}

/** Format an ISO datetime string into a readable Chinese format. */
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${year}年${month}月${day}日 ${hour}:${min}`;
}

/**
 * PostCard — a single diary entry card styled like a WeChat Moments post.
 *
 * Layout:
 *  ┌──────────────────────────────────┐
 *  │  2026年5月6日 14:30               │  (optional date)
 *  │                                  │
 *  │  Post text content here...   ☺️  │  (mood emoji right-aligned)
 *  │                                  │
 *  │  [image grid if any]             │
 *  └──────────────────────────────────┘
 */
export default function PostCard({ post, showDate = true }: Props) {
  return (
    <View style={styles.card}>
      {showDate && (
        <Text style={styles.date}>{formatDateTime(post.createdAt)}</Text>
      )}

      <View style={styles.body}>
        {/* Text + mood row */}
        <View style={styles.contentRow}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>{post.text}</Text>
          </View>
          <View style={styles.moodContainer}>
            <MoodEmoji mood={post.mood} size={24} />
          </View>
        </View>

        {/* Images (if any) */}
        {post.images.length > 0 && (
          <View style={styles.imageContainer}>
            <ImageGrid images={post.images} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    // shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // shadow (Android)
    elevation: 3,
  },
  date: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  body: {
    // contains contentRow and optionally imageContainer
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  text: {
    fontSize: FONTS.body,
    color: COLORS.text,
    lineHeight: FONTS.body * 1.5,
  },
  moodContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
  },
  imageContainer: {
    marginTop: SPACING.sm,
  },
});

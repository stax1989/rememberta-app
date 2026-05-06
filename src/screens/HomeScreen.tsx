import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING, MOOD_COLORS } from '../constants/theme';
import { Mood, MOOD_EMOJI } from '../types';
import { loadAppData, getAllPosts, deletePost } from '../store/storage';
import MoodEmoji from '../components/MoodEmoji';
import SimplePieChart from '../components/SimplePieChart';
import MonthCalendar from '../components/MonthCalendar';
import PostCard from '../components/PostCard';

const HomeScreen = ({ navigation }: any) => {
  const [appData, setAppData] = useState<any>(null);
  const [filterMood, setFilterMood] = useState<Mood | null>(null);
  const [angryWarning, setAngryWarning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const data = await loadAppData();
      setAppData(data);
    } catch (e) {
      console.warn('Failed to load app data', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!appData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const { taInfo, taProfile, posts } = appData;

  // Calculate days together
  const calculateDays = (): number => {
    const meet = taInfo?.meetDate ? new Date(taInfo.meetDate) : new Date();
    const today = new Date();
    const diffTime = today.getTime() - meet.getTime();
    return Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const days = calculateDays();
  const daysText = `在一起 ${days} 天`;

  // Get last post mood
  const sortedPosts = [...(posts || [])].sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastPost = sortedPosts.length > 0 ? sortedPosts[0] : null;

  // Build moodData for calendar: date string -> last mood of that day
  const moodData: Record<string, Mood> = {};
  if (posts) {
    const dateMap: Record<string, Mood> = {};
    for (const post of posts) {
      if (post.isDeleted) continue;
      const dateKey = post.createdAt.split('T')[0];
      dateMap[dateKey] = post.mood;
    }
    Object.assign(moodData, dateMap);
  }

  // Mood counts for pie chart
  const moodCounts: Record<string, number> = { angry: 0, happy: 0, neutral: 0 };
  if (posts) {
    for (const post of posts) {
      if (post.isDeleted) continue;
      moodCounts[post.mood]++;
    }
  }

  const pieData = [
    { mood: 'happy' as Mood, count: moodCounts.happy, color: MOOD_COLORS.happy },
    { mood: 'neutral' as Mood, count: moodCounts.neutral, color: MOOD_COLORS.neutral },
    { mood: 'angry' as Mood, count: moodCounts.angry, color: MOOD_COLORS.angry },
  ].filter((d) => d.count > 0);

  // Angry warning detection:
  // Check if the last 3 calendar days (consecutive) all have angry as their last mood
  const checkAngryWarning = (): boolean => {
    if (!posts || posts.length === 0) return false;
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayMood = moodData[dateStr];
      if (dayMood !== 'angry') return false;
    }
    return true;
  };

  // Recalculate warning when posts change
  const showAngryWarning = checkAngryWarning();

  const handleDayPress = (dateStr: string, _mood: Mood | null) => {
    navigation.navigate('DayDetail', { date: dateStr });
  };

  const handlePiePress = (mood: Mood) => {
    setFilterMood((prev) => (prev === mood ? null : mood));
  };

  const handleEditPost = (post: any) => {
    navigation.navigate('Post', { post });
  };

  const handleDeletePost = async (post: any) => {
    try {
      await deletePost(post.id);
      loadData();
    } catch (e) {
      console.warn('Delete failed', e);
    }
  };

  const handleBrowseRandom = async () => {
    try {
      const allPosts = await getAllPosts();
      if (allPosts.length === 0) {
        Alert.alert('提示', '还没有任何记录');
        return;
      }
      const randomPost = allPosts[Math.floor(Math.random() * allPosts.length)];
      const dateStr = randomPost.createdAt.split('T')[0];
      navigation.navigate('DayDetail', { date: dateStr });
    } catch (e) {
      console.warn('Browse random error', e);
    }
  };

  // Filter posts by mood if filter is active
  const displayedPosts = filterMood
    ? sortedPosts.filter((p: any) => p.mood === filterMood && !p.isDeleted)
    : sortedPosts.filter((p: any) => !p.isDeleted);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Home title */}
        <Text style={styles.homeTitle}>首页</Text>

        {/* Days title */}
        <Text style={styles.daysTitle}>{daysText}</Text>

        {/* Angry warning */}
        {showAngryWarning && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              已经 3 天不开心了，发生了什么？
            </Text>
          </View>
        )}

        {/* Emotion triple */}
        <View style={styles.emotionTriple}>
          {lastPost ? (
            <Text style={styles.largeEmoji}>
              {MOOD_EMOJI[lastPost.mood]}
            </Text>
          ) : (
            <Text style={styles.hintText}>还没有记录</Text>
          )}
        </View>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>情感分布</Text>
            <SimplePieChart
              data={pieData}
              onPress={handlePiePress}
            />
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarSection}>
          <MonthCalendar
            year={currentYear}
            month={currentMonth}
            moodData={moodData}
            onDayPress={handleDayPress}
          />
        </View>

        {/* Recent posts */}
        {displayedPosts.length > 0 && (
          <View style={styles.recentPosts}>
            <Text style={styles.chartTitle}>
              {filterMood ? `筛选: ${MOOD_EMOJI[filterMood]}` : '最近的记录'}
            </Text>
            {displayedPosts.slice(0, 5).map((post: any) => (
              <View key={post.id} style={styles.postItem}>
                <PostCard post={post} showDate />
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.postActionBtn}
                    onPress={() => handleEditPost(post)}
                  >
                    <Text style={styles.postActionText}>编辑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.postActionBtn, styles.postDeleteBtn]}
                    onPress={() => handleDeletePost(post)}
                  >
                    <Text style={[styles.postActionText, styles.postDeleteText]}>删除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => Alert.alert('AI', 'AI 功能即将上线')}
        >
          <Text style={styles.bottomIcon}>🤖</Text>
          <Text style={styles.bottomLabel}>AI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Explore')}
        >
          <Text style={styles.bottomIcon}>🔍</Text>
          <Text style={styles.bottomLabel}>探索</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Post')}
        >
          <Text style={styles.bottomIcon}>✏️</Text>
          <Text style={styles.bottomLabel}>新笔记</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.bottomIcon}>⚙️</Text>
          <Text style={styles.bottomLabel}>设置</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 100,
  },
  homeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  daysTitle: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  warningBanner: {
    backgroundColor: '#FFE5E5',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.moodAngry,
  },
  warningText: {
    fontSize: FONTS.body,
    color: COLORS.moodAngry,
    textAlign: 'center',
    fontWeight: '500',
  },
  emotionTriple: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  largeEmoji: {
    fontSize: 64,
  },
  hintText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  chartSection: {
    marginVertical: SPACING.md,
  },
  chartTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  calendarSection: {
    marginVertical: SPACING.md,
  },
  recentPosts: {
    marginTop: SPACING.md,
  },
  postItem: {
    marginBottom: SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  postActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  postDeleteBtn: {
    borderColor: COLORS.danger,
  },
  postActionText: {
    fontSize: FONTS.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  postDeleteText: {
    color: COLORS.danger,
  },
  bottomBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingBottom: 20,
    paddingTop: 8,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    fontSize: 22,
  },
  bottomLabel: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;

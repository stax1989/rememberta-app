import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { Post } from '../types';
import { getPostsForDate, deletePost } from '../store/storage';
import PostCard from '../components/PostCard';

const DayDetailScreen = ({ route, navigation }: any) => {
  const { date } = route.params || {};
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
  };

  const loadPosts = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const data = await getPostsForDate(date);
      setPosts(data.filter((p: Post) => !p.isDeleted));
    } catch (e) {
      console.warn('Failed to load posts', e);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [loadPosts])
  );

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      console.warn('Delete failed', e);
    }
  };

  if (!date) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>日期参数错误</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{formatDate(date)}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>这一天还没有记录</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('Post', { date })
            }
          >
            <Text style={styles.addButtonText}>添加记录</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {posts.map((post) => (
            <View key={post.id} style={styles.postWrapper}>
              <PostCard post={post} />
              <View style={styles.postActions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => navigation.navigate('Post', { post })}
                >
                  <Text style={styles.editIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(post.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('Post', { date })
            }
          >
            <Text style={styles.addButtonText}>添加记录</Text>
          </TouchableOpacity>
          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  dateTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
  },
  postWrapper: {
    marginBottom: SPACING.md,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  editButton: {
    padding: 6,
  },
  editIcon: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 6,
  },
  deleteIcon: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.body,
    fontWeight: '600',
  },
});

export default DayDetailScreen;

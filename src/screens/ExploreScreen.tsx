import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { Post, MOOD_EMOJI } from '../types';
import { getAllPosts } from '../store/storage';
import PostCard from '../components/PostCard';

const ExploreScreen = ({ navigation }: any) => {
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const loadAllPosts = useCallback(async () => {
    setLoading(true);
    try {
      const posts = await getAllPosts();
      setAllPosts(posts);
      if (posts.length > 0) {
        const randomPost = posts[Math.floor(Math.random() * posts.length)];
        setCurrentPost(randomPost);
      } else {
        setCurrentPost(null);
      }
    } catch (e) {
      console.warn('Failed to load posts', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllPosts();
    }, [loadAllPosts])
  );

  const handleRefresh = () => {
    if (allPosts.length === 0) return;
    const randomPost = allPosts[Math.floor(Math.random() * allPosts.length)];
    setCurrentPost(randomPost);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : !currentPost ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>还没有任何记录</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Post')}
            >
              <Text style={styles.addButtonText}>写第一篇笔记</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.postContainer}>
            <PostCard post={currentPost} showDate />

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              activeOpacity={0.7}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
              <Text style={styles.refreshText}>刷新探索</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.md,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.body,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: SPACING.lg,
    marginHorizontal: SPACING.md,
  },
  refreshIcon: {
    fontSize: 18,
    marginRight: SPACING.xs,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: FONTS.body,
    fontWeight: '600',
  },
});

export default ExploreScreen;

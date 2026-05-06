import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SPACING, MOOD_COLORS } from '../constants/theme';
import { Mood, MOOD_EMOJI, Post } from '../types';
import { addPost, updatePost } from '../store/storage';

const PostScreen = ({ navigation, route }: any) => {
  // Edit mode: if a post object is passed in params, pre-fill the form
  const editPost = route?.params?.post as Post | undefined;
  const [text, setText] = useState(editPost?.text || '');
  const [mood, setMood] = useState<Mood | null>(editPost?.mood || null);
  const [images, setImages] = useState<string[]>(editPost?.images || []);

  // If route.params.date is provided, this is a back-dated post
  const backDate = route?.params?.date || null;
  const isEditing = !!editPost;

  const charCount = text.length;
  const hasContent = text.trim().length > 0 || images.length > 0;
  const isPostDisabled = !mood || !hasContent;

  const pickImage = async () => {
    if (images.length >= 9) {
      Alert.alert('提示', '最多添加9张图片');
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        const newUris = result.assets.map((a) => a.uri);
        setImages((prev) => [...prev, ...newUris].slice(0, 9));
      }
    } catch (e) {
      console.warn('Image picker error', e);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (isPostDisabled) return;

    const id = editPost?.id ||
      Date.now().toString(36) + Math.random().toString(36).slice(2);

    // If backDate is set, use it as the date part; keep the time as current
    const createdAt = editPost?.createdAt || (backDate
      ? `${backDate}T${new Date().toISOString().split('T')[1]}`
      : new Date().toISOString());

    const post: Post = {
      id,
      createdAt,
      mood: mood!,
      text: text.trim(),
      images,
      isDeleted: false,
    };

    try {
      if (isEditing) {
        await updatePost(post);
      } else {
        await addPost(post);
      }
      Alert.alert(isEditing ? '已更新' : '已记录', '', [
        { text: '好的', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const moodOptions: { mood: Mood; emoji: string }[] = [
    { mood: 'angry', emoji: MOOD_EMOJI.angry },
    { mood: 'happy', emoji: MOOD_EMOJI.happy },
    { mood: 'neutral', emoji: MOOD_EMOJI.neutral },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Text input */}
      <View style={styles.card}>
        <TextInput
          style={styles.textInput}
          placeholder="今天发生了什么？"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={500}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{charCount}/500</Text>
      </View>

      {/* Mood selector */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>此刻的心情</Text>
        <View style={styles.moodRow}>
          {moodOptions.map((item) => {
            const selected = mood === item.mood;
            const moodColor = MOOD_COLORS[item.mood];
            return (
              <TouchableOpacity
                key={item.mood}
                style={[
                  styles.moodButton,
                  selected && {
                    borderColor: moodColor,
                    borderWidth: 3,
                    backgroundColor: moodColor + '20',
                  },
                ]}
                onPress={() => setMood(item.mood)}
              >
                <Text style={styles.moodEmoji}>{item.emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {!mood && hasContent && (
          <Text style={styles.moodHint}>请选择一个心情表情</Text>
        )}
      </View>

      {/* Image picker */}
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.addImageButton}
          onPress={pickImage}
        >
          <Text style={styles.addImageText}>添加图片</Text>
          <Text style={styles.addImageHint}>
            {images.length}/9
          </Text>
        </TouchableOpacity>

        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <TouchableOpacity
                key={`${uri}-${index}`}
                style={styles.imageThumbContainer}
                onPress={() => removeImage(index)}
              >
                <Image
                  source={{ uri }}
                  style={styles.imageThumb}
                />
                <View style={styles.removeOverlay}>
                  <Text style={styles.removeIcon}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Post button */}
      <TouchableOpacity
        style={[
          styles.postButton,
          isPostDisabled && styles.postButtonDisabled,
        ]}
        onPress={handlePost}
        disabled={isPostDisabled}
      >
        <Text
          style={[
            styles.postButtonText,
            isPostDisabled && styles.postButtonTextDisabled,
          ]}
        >
          发送
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    fontSize: FONTS.body,
    color: COLORS.text,
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.sm,
  },
  moodHint: {
    color: COLORS.danger,
    fontSize: FONTS.caption,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  moodButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.background,
  },
  moodEmoji: {
    fontSize: 36,
  },
  addImageButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 10,
  },
  addImageText: {
    fontSize: FONTS.body,
    color: COLORS.primary,
    fontWeight: '500',
  },
  addImageHint: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  imageThumbContainer: {
    position: 'relative',
  },
  imageThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  postButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.body,
    fontWeight: '700',
  },
  postButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});

export default PostScreen;

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppData,
  TaInfo,
  TaProfile,
  Post,
  UserSettings,
} from '../types';

const KEYS = {
  APP_DATA: '@rememberta:appData',
};

const DEFAULT_APP_DATA: AppData = {
  isOnboarded: false,
  taInfo: null,
  taProfile: null,
  posts: [],
  settings: null,
};

// ===== 读写 AppData =====

export async function loadAppData(): Promise<AppData> {
  try {
    const json = await AsyncStorage.getItem(KEYS.APP_DATA);
    if (json) {
      const data: AppData = JSON.parse(json);
      // Data migration: ensure settings fields have defaults for old data
      if (data.settings && typeof data.settings.passwordEnabled !== 'boolean') {
        data.settings.passwordEnabled = true;
        await saveAppData(data);
      }
      return data;
    }
    return { ...DEFAULT_APP_DATA };
  } catch {
    return { ...DEFAULT_APP_DATA };
  }
}

async function saveAppData(data: AppData): Promise<void> {
  await AsyncStorage.setItem(KEYS.APP_DATA, JSON.stringify(data));
}

// ===== Onboarding =====

export async function completeOnboarding(
  taInfo: TaInfo,
  taProfile: TaProfile,
  passwordHash: string,
): Promise<void> {
  const data = await loadAppData();
  data.isOnboarded = true;
  data.taInfo = taInfo;
  data.taProfile = taProfile;
  data.settings = {
    passwordHash,
    biometricEnabled: false,
    passwordEnabled: true,
  };
  await saveAppData(data);
}

// ===== 密码验证 =====

export async function getPasswordHash(): Promise<string | null> {
  const data = await loadAppData();
  return data.settings?.passwordHash ?? null;
}

// ===== ta 档案 =====

export async function updateTaProfile(profile: Partial<TaProfile>): Promise<void> {
  const data = await loadAppData();
  if (data.taProfile) {
    Object.assign(data.taProfile, profile);
    await saveAppData(data);
  }
}

// ===== 设置 =====

export async function updateSettings(
  settings: Partial<UserSettings>
): Promise<void> {
  const data = await loadAppData();
  if (data.settings) {
    Object.assign(data.settings, settings);
    await saveAppData(data);
  }
}

// ===== 日记 =====

export async function addPost(post: Post): Promise<void> {
  const data = await loadAppData();
  data.posts.unshift(post);
  await saveAppData(data);
}

export async function updatePost(post: Post): Promise<void> {
  const data = await loadAppData();
  const index = data.posts.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    data.posts[index] = post;
    await saveAppData(data);
  }
}

export async function deletePost(postId: string): Promise<void> {
  const data = await loadAppData();
  data.posts = data.posts.filter((p) => p.id !== postId);
  await saveAppData(data);
}

export async function getPostsForDate(dateStr: string): Promise<Post[]> {
  const data = await loadAppData();
  return data.posts.filter((p) => {
    const postDate = p.createdAt.split('T')[0];
    return postDate === dateStr && !p.isDeleted;
  });
}

export async function getAllPosts(): Promise<Post[]> {
  const data = await loadAppData();
  return data.posts.filter((p) => !p.isDeleted);
}

// ===== 清除全部数据（注销） =====

export async function clearAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.APP_DATA);
}

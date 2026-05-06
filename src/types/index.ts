// ===== 情感类型 =====
export type Mood = 'angry' | 'happy' | 'neutral';

export const MOOD_EMOJI: Record<Mood, string> = {
  angry: '😡',
  happy: '☺️',
  neutral: '😑',
};

export const MOOD_LABEL: Record<Mood, string> = {
  angry: '不开心',
  happy: '开心',
  neutral: '日常',
};

// ===== 星座 =====
export const ZODIAC_SIGNS = [
  '摩羯座', '水瓶座', '双鱼座', '白羊座', '金牛座', '双子座',
  '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座',
];

export function getZodiac(month: number, day: number): string {
  const dates = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
  const signs = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const index = day < dates[month - 1] ? signs[month - 1] : signs[month % 12];
  return ZODIAC_SIGNS[index];
}

// ===== 生肖 =====
export function getChineseZodiac(year: number): string {
  const animals = [
    '鼠', '牛', '虎', '兔', '龙', '蛇',
    '马', '羊', '猴', '鸡', '狗', '猪',
  ];
  return animals[(year - 4) % 12];
}

// ===== ta 信息 =====
export interface TaInfo {
  name: string;
  gender: string;
  birthDate: string;       // YYYY-MM-DD
  lunarBirthday: string;
  solarBirthday: string;
  zodiac: string;
  chineseZodiac: string;
  birthplace: string;
  meetDate: string;         // YYYY-MM-DD
}

// ===== ta 档案（可修改） =====
export interface TaProfile {
  nickname: string;
  avatar: string | null;    // 本地 uri
  phone: string;
  wechat: string;
}

// ===== 日记动态 =====
export interface Post {
  id: string;
  createdAt: string;        // ISO datetime
  mood: Mood;
  text: string;
  images: string[];         // 本地 uri 数组
  isDeleted: boolean;
}

// ===== 用户设置 =====
export interface UserSettings {
  passwordHash: string;     // 6 位 PIN 的哈希
  biometricEnabled: boolean;
  passwordEnabled: boolean; // 是否启用密码锁
}

// ===== App 状态 =====
export interface AppData {
  isOnboarded: boolean;
  taInfo: TaInfo | null;
  taProfile: TaProfile | null;
  posts: Post[];
  settings: UserSettings | null;
}

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { TA_CATEGORIES, TaCategory } from '../types';
import { loadAppData, updateTaProfile } from '../store/storage';

const AboutTaScreen = ({ navigation }: any) => {
  const [appData, setAppData] = useState<any>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingWechat, setEditingWechat] = useState(false);

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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const { taInfo, taProfile } = appData;

  const categoryLabel =
    TA_CATEGORIES.find(
      (c) => c.value === (taInfo?.category as TaCategory)
    )?.label || '未知';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '未设置';
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m, 10)}月${parseInt(d, 10)}日`;
  };

  const handleSaveProfile = async (field: string, value: string) => {
    try {
      const updated = { ...taProfile, [field]: value };
      await updateTaProfile(updated);
      setAppData((prev: any) => ({
        ...prev,
        taProfile: updated,
      }));
    } catch (e) {
      console.warn('Failed to update profile', e);
    }
  };

  const EditableField = ({
    label,
    value,
    isEditing,
    setIsEditing,
    onChangeValue,
  }: {
    label: string;
    value: string;
    isEditing: boolean;
    setIsEditing: (v: boolean) => void;
    onChangeValue: (v: string) => void;
  }) => {
    const [editValue, setEditValue] = useState(value || '');

    const handleSubmit = () => {
      setIsEditing(false);
      if (editValue !== value) {
        onChangeValue(editValue);
      }
    };

    if (isEditing) {
      return (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{label}</Text>
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleSubmit}
            onSubmitEditing={handleSubmit}
            autoFocus
          />
        </View>
      );
    }

    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <TouchableOpacity onPress={() => setIsEditing(true)}>
          <Text style={styles.infoValue}>
            {value || '未设置'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Avatar and nickname */}
      <View style={styles.profileHeader}>
        {taProfile?.avatar ? (
          <Image
            source={{ uri: taProfile.avatar }}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>👤</Text>
          </View>
        )}

        {editingNickname ? (
          <TextInput
            style={styles.nicknameInput}
            defaultValue={taProfile?.nickname || taInfo?.name || ''}
            onBlur={(e) => {
              const val = e.nativeEvent.text;
              setEditingNickname(false);
              if (val !== taProfile?.nickname) {
                handleSaveProfile('nickname', val);
              }
            }}
            onSubmitEditing={(e) => {
              const val = e.nativeEvent.text;
              setEditingNickname(false);
              if (val !== taProfile?.nickname) {
                handleSaveProfile('nickname', val);
              }
            }}
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingNickname(true)}>
            <Text style={styles.nickname}>
              {taProfile?.nickname || taInfo?.name || '未设置'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Info section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ta 的信息</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>标签</Text>
            <Text style={styles.infoValue}>{categoryLabel}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>名字</Text>
            <Text style={styles.infoValue}>
              {taInfo?.name || '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>性别</Text>
            <Text style={styles.infoValue}>
              {taInfo?.gender || '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>生日</Text>
            <Text style={styles.infoValue}>
              {taInfo?.birthDate
                ? formatDate(taInfo.birthDate)
                : '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>星座</Text>
            <Text style={styles.infoValue}>
              {taInfo?.zodiac || '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>生肖</Text>
            <Text style={styles.infoValue}>
              {taInfo?.chineseZodiac || '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>出生地</Text>
            <Text style={styles.infoValue}>
              {taInfo?.birthplace || '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>结识日期</Text>
            <Text style={styles.infoValue}>
              {taInfo?.meetDate
                ? formatDate(taInfo.meetDate)
                : '未设置'}
            </Text>
          </View>
          <View style={styles.divider} />
          <EditableField
            label="电话"
            value={taProfile?.phone || ''}
            isEditing={editingPhone}
            setIsEditing={setEditingPhone}
            onChangeValue={(v) => handleSaveProfile('phone', v)}
          />
          <View style={styles.divider} />
          <EditableField
            label="微信"
            value={taProfile?.wechat || ''}
            isEditing={editingWechat}
            setIsEditing={setEditingWechat}
            onChangeValue={(v) => handleSaveProfile('wechat', v)}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: SPACING.md,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarPlaceholderText: {
    fontSize: 40,
  },
  nickname: {
    fontSize: FONTS.subtitle,
    fontWeight: '700',
    color: COLORS.text,
  },
  nicknameInput: {
    fontSize: FONTS.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: 2,
    minWidth: 100,
  },
  section: {
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
  },
  infoLabel: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  editInput: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
    paddingVertical: 2,
    textAlign: 'right',
    minWidth: 120,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
});

export default AboutTaScreen;

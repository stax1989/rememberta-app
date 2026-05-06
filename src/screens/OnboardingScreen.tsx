import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import {
  TaInfo,
  TaProfile,
  getZodiac,
  getChineseZodiac,
} from '../types';
import { completeOnboarding } from '../store/storage';

const OnboardingScreen = ({ navigation }: any) => {
  // Basic info
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');

  // Step 3: Birth info
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [chineseZodiac, setChineseZodiac] = useState('');

  // Step 4: Contact
  const [phone, setPhone] = useState('');
  const [wechat, setWechat] = useState('');

  // Step 5: Meet date
  const [meetYear, setMeetYear] = useState('');
  const [meetMonth, setMeetMonth] = useState('');
  const [meetDay, setMeetDay] = useState('');

  // Step 6: Password
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  // Auto-calculate zodiac and Chinese zodiac when birth date changes
  useEffect(() => {
    const y = parseInt(birthYear, 10);
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);

    if (y && m && d && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      setZodiac(getZodiac(m, d));
      setChineseZodiac(getChineseZodiac(y));
    } else {
      setZodiac('');
      setChineseZodiac('');
    }
  }, [birthYear, birthMonth, birthDay]);

  const handleComplete = useCallback(async () => {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('提示', '请填写名字');
      return;
    }

    // Validate password
    if (password1.length !== 6 || password2.length !== 6) {
      Alert.alert('提示', '密码必须是6位数字');
      return;
    }
    if (password1 !== password2) {
      Alert.alert('提示', '两次输入的密码不匹配');
      return;
    }

    // Build birthDate string
    const y = birthYear ? birthYear.padStart(4, '0') : '';
    const m = birthMonth ? birthMonth.padStart(2, '0') : '';
    const d = birthDay ? birthDay.padStart(2, '0') : '';
    const birthDate = y && m && d ? `${y}-${m}-${d}` : '';

    // Build meetDate string
    const my = meetYear ? meetYear.padStart(4, '0') : '';
    const mm = meetMonth ? meetMonth.padStart(2, '0') : '';
    const md = meetDay ? meetDay.padStart(2, '0') : '';
    const meetDate = my && mm && md ? `${my}-${mm}-${md}` : '';

    const taInfo: TaInfo = {
      name: trimmedName,
      gender,
      birthDate,
      lunarBirthday: '',
      solarBirthday: birthDate,
      zodiac,
      chineseZodiac,
      birthplace: '',
      meetDate,
    };

    const taProfile: TaProfile = {
      nickname: trimmedName,
      avatar: null,
      phone,
      wechat,
    };

    try {
      await completeOnboarding(taInfo, taProfile, password1);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  }, [
    name,
    password1,
    password2,
    birthYear,
    birthMonth,
    birthDay,
    gender,
    zodiac,
    chineseZodiac,
    meetYear,
    meetMonth,
    meetDay,
    phone,
    wechat,
    navigation,
  ]);

  const passwordMismatch =
    password2.length > 0 && password1 !== password2;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Basic info */}
      <Text style={styles.sectionTitle}>基本信息</Text>
      <View style={styles.card}>
        <Text style={styles.inputLabel}>
          名字 <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="输入名字"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.inputLabel}>性别</Text>
        <TextInput
          style={styles.input}
          placeholder="输入性别（可选）"
          placeholderTextColor={COLORS.textSecondary}
          value={gender}
          onChangeText={setGender}
        />
      </View>

      {/* Step 3: Birth info */}
      <Text style={styles.sectionTitle}>出生信息</Text>
      <View style={styles.card}>
        <Text style={styles.inputLabel}>出生年月</Text>
        <View style={styles.dateGroup}>
          <TextInput
            style={[styles.dateInputField, styles.dateInput]}
            placeholder="年"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={4}
            value={birthYear}
            onChangeText={setBirthYear}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={[styles.dateInputField, styles.dateInputSmall]}
            placeholder="月"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={2}
            value={birthMonth}
            onChangeText={setBirthMonth}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={[styles.dateInputField, styles.dateInputSmall]}
            placeholder="日"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={2}
            value={birthDay}
            onChangeText={setBirthDay}
          />
        </View>
        {zodiac ? (
          <View style={styles.autoInfo}>
            <Text style={styles.autoText}>
              星座: {zodiac} | 生肖: {chineseZodiac}
            </Text>
            <Text style={styles.autoText}>农历生日: 自动计算中</Text>
          </View>
        ) : null}
      </View>

      {/* Step 4: Contact */}
      <Text style={styles.sectionTitle}>联系方式</Text>
      <View style={styles.card}>
        <Text style={styles.inputLabel}>电话</Text>
        <TextInput
          style={styles.input}
          placeholder="输入电话（可选）"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <Text style={styles.inputLabel}>微信</Text>
        <TextInput
          style={styles.input}
          placeholder="输入微信号（可选）"
          placeholderTextColor={COLORS.textSecondary}
          value={wechat}
          onChangeText={setWechat}
        />
      </View>

      {/* Step 5: Meet date */}
      <Text style={styles.sectionTitle}>结识日期</Text>
      <View style={styles.card}>
        <View style={styles.dateGroup}>
          <TextInput
            style={[styles.dateInputField, styles.dateInput]}
            placeholder="年"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={4}
            value={meetYear}
            onChangeText={setMeetYear}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={[styles.dateInputField, styles.dateInputSmall]}
            placeholder="月"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={2}
            value={meetMonth}
            onChangeText={setMeetMonth}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={[styles.dateInputField, styles.dateInputSmall]}
            placeholder="日"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
            maxLength={2}
            value={meetDay}
            onChangeText={setMeetDay}
          />
        </View>
      </View>

      {/* Step 6: Password */}
      <Text style={styles.sectionTitle}>设置密码</Text>
      <View style={styles.card}>
        <Text style={styles.inputLabel}>6位数字密码</Text>
        <TextInput
          style={styles.input}
          placeholder="输入6位数字密码"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={password1}
          onChangeText={setPassword1}
        />
        <Text style={styles.inputLabel}>确认密码</Text>
        <TextInput
          style={[
            styles.input,
            passwordMismatch && styles.inputError,
          ]}
          placeholder="再次输入密码"
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          value={password2}
          onChangeText={setPassword2}
        />
        {passwordMismatch && (
          <Text style={styles.errorText}>密码不匹配</Text>
        )}
      </View>

      {/* Complete button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleComplete}
      >
        <Text style={styles.completeButtonText}>完成</Text>
      </TouchableOpacity>

      <View style={{ height: SPACING.xl }} />
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
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONTS.subtitle,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipSelected: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: FONTS.body,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    overflow: 'hidden',
  },
  dateInputField: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 14,
    textAlign: 'center',
    color: COLORS.text,
    minWidth: 0,
  },
  dateInput: {
    flex: 2,
  },
  dateInputSmall: {
    flex: 1,
  },
  dateSep: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.xs,
  },
  autoInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  autoText: {
    fontSize: FONTS.caption,
    color: COLORS.text,
    lineHeight: 20,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.caption,
    marginTop: SPACING.xs,
  },
  required: {
    color: COLORS.danger,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: FONTS.body,
    fontWeight: '700',
  },
});

export default OnboardingScreen;

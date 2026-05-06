import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { loadAppData, clearAllData, updateSettings } from '../store/storage';

const SettingsScreen = ({ navigation }: any) => {
  const [passwordEnabled, setPasswordEnabled] = useState(true);

  useEffect(() => {
    loadAppData().then((data) => {
      if (data.settings) {
        setPasswordEnabled(data.settings.passwordEnabled);
      }
    });
  }, []);

  const handleClearCache = () => {
    Alert.alert('清理缓存', '确定要清理缓存吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => {
          Alert.alert('提示', '缓存已清理');
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert(
      '注销账号',
      '确定要注销账号吗？这将清除所有数据。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '注销',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } catch (e) {
              Alert.alert('错误', '注销失败');
            }
          },
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.alert('提示', '修改密码功能开发中');
  };

  const handlePasswordToggle = async (value: boolean) => {
    setPasswordEnabled(value);
    await updateSettings({ passwordEnabled: value });
  };

  return (
    <View style={styles.container}>
      {/* Password lock */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>密码锁</Text>
          <Switch
            value={passwordEnabled}
            onValueChange={handlePasswordToggle}
            trackColor={{
              false: COLORS.border,
              true: COLORS.primary,
            }}
            thumbColor={Platform.OS === 'android' ? COLORS.primary : '#FFFFFF'}
          />
        </View>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.row}
          onPress={handleChangePassword}
        >
          <Text style={styles.rowLabel}>修改密码</Text>
          <Text style={styles.rowArrow}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* Cache */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={handleClearCache}
        >
          <Text style={styles.rowLabel}>清理缓存</Text>
          <Text style={styles.rowArrow}>&gt;</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>关于</Text>
          <View style={styles.aboutRight}>
            <Text style={styles.appName}>记住ta</Text>
            <Text style={styles.version}>v0.1.0</Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutRow}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>注销账号</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  rowLabel: {
    fontSize: FONTS.body,
    color: COLORS.text,
  },
  rowArrow: {
    fontSize: FONTS.body,
    color: COLORS.textSecondary,
  },
  aboutRight: {
    alignItems: 'flex-end',
  },
  appName: {
    fontSize: FONTS.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  version: {
    fontSize: FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  logoutRow: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: FONTS.body,
    color: COLORS.danger,
    fontWeight: '600',
  },
});

export default SettingsScreen;

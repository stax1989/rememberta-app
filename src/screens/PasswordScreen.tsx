import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { getPasswordHash } from '../store/storage';

const PasswordScreen = ({ navigation }: any) => {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [storedHash, setStoredHash] = useState<string | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadHash = async () => {
      const hash = await getPasswordHash();
      setStoredHash(hash);
    };
    loadHash();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -4,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (value: string) => {
    setError('');
    if (value === 'backspace') {
      setDigits((prev) => prev.slice(0, -1));
      return;
    }
    if (digits.length >= 6) return;

    const newDigits = [...digits, value];
    setDigits(newDigits);

    if (newDigits.length === 6) {
      const entered = newDigits.join('');
      if (entered === storedHash) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        setError('密码错误');
        shake();
        setTimeout(() => {
          setDigits([]);
        }, 300);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>输入密码</Text>

      {/* Dot indicators */}
      <Animated.View
        style={[
          styles.dotRow,
          { transform: [{ translateX: shakeAnim }] },
        ]}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < digits.length ? styles.dotFilled : styles.dotEmpty,
            ]}
          />
        ))}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Number pad */}
      <View style={styles.numpad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.numpadButton}
            onPress={() => handlePress(num.toString())}
          >
            <Text style={styles.numpadText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.numpadButton} />
        <TouchableOpacity
          style={styles.numpadButton}
          onPress={() => handlePress('0')}
        >
          <Text style={styles.numpadText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.numpadButton}
          onPress={() => handlePress('backspace')}
        >
          <Text style={styles.backspaceText}>⌫</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONTS.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  dotRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotEmpty: {
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONTS.caption,
    marginBottom: SPACING.lg,
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 280,
  },
  numpadButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  numpadText: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: '400',
  },
  backspaceText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
});

export default PasswordScreen;

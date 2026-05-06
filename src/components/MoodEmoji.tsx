import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mood, MOOD_EMOJI } from '../types';

interface Props {
  mood: Mood;
  size?: number;
}

export default function MoodEmoji({ mood, size = 48 }: Props) {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: size }}>{MOOD_EMOJI[mood]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

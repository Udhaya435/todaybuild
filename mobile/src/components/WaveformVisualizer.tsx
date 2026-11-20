import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { DarkTheme } from '../theme/colors';

interface WaveformProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const WaveformVisualizer: React.FC<WaveformProps> = ({
  isPlaying,
  barCount = 28,
  height = 50,
  activeColor = DarkTheme.primaryBlue,
  inactiveColor = DarkTheme.waveformInactive,
}) => {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    let isMounted = true;

    if (isPlaying) {
      const animations = animatedValues.map((val) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(val, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 250 + Math.random() * 300,
              useNativeDriver: false,
            }),
            Animated.timing(val, {
              toValue: 0.15 + Math.random() * 0.2,
              duration: 250 + Math.random() * 300,
              useNativeDriver: false,
            }),
          ])
        );
      });

      animations.forEach((anim) => anim.start());

      return () => {
        isMounted = false;
        animations.forEach((anim) => anim.stop());
      };
    } else {
      animatedValues.forEach((val, i) => {
        Animated.timing(val, {
          toValue: 0.2 + (i % 3) * 0.1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isPlaying]);

  return (
    <View style={[styles.container, { height }]}>
      {animatedValues.map((anim, index) => {
        return (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                backgroundColor: isPlaying ? activeColor : inactiveColor,
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [4, height],
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
  },
  bar: {
    width: 3.5,
    borderRadius: 2,
    marginHorizontal: 1.5,
  },
});

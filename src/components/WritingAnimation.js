import React, {useEffect, useRef, useState} from 'react';
import {Animated, Text, StyleSheet} from 'react-native';

const WritingAnimation = ({text}) => {
  const [displayText, setDisplayText] = useState('');
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: text.length,
      duration: text.length * 100, // Adjust this to control the speed
      useNativeDriver: false,
    }).start();
  }, [text, animatedValue]);

  useEffect(() => {
    animatedValue.addListener(({value}) => {
      setDisplayText(text.slice(0, Math.floor(value)));
    });

    return () => {
      animatedValue.removeAllListeners();
    };
  }, [animatedValue, text]);

  return (
    <Animated.Text style={styles.animatedText}>{displayText}</Animated.Text>
  );
};

const styles = StyleSheet.create({
  animatedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black', // Customize this as needed
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WritingAnimation;

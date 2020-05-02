import React from 'react';
import {StyleSheet, View, Text, StatusBar} from 'react-native';

const styles = StyleSheet.create({
  viewStyles: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b25',
  },
  textStyles: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
});

const SplashScreen = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1b1b25" />
      <View style={styles.viewStyles}>
        <Text style={styles.textStyles}>Translator</Text>
      </View>
    </>
  );
};

export default SplashScreen;

import React from 'react';
import {StyleSheet, StatusBar, Image} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export const SplashScreen = () => {
  return (
    <SafeAreaProvider style={{flex: 1}}>
      <StatusBar
        backgroundColor={'#008EFF'}
        barStyle={'light-content'}
        hidden={false}
      />
      <LinearGradient
        start={{x: 0.5, y: 1.8}}
        end={{x: 0.5, y: 0}}
        colors={['#00FFFF', '#008EFF']}
        style={{
          flexDirection: 'column',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={require('assets/img/logo-splash.png')}
          style={styles.logo}
        />
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
    marginBottom: '10%',
  },
});

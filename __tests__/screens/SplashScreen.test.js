import React from 'react';
import renderer from 'react-test-renderer';
import { SplashScreen } from 'screens/SplashScreen';

it('Test positive', () => {
  const tree = renderer
    .create(<SplashScreen />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
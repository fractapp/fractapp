import React from 'react';
import renderer from 'react-test-renderer';
import { SplashScreen } from 'components';

it('Test positive', () => {
  const tree = renderer
    .create(<SplashScreen />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
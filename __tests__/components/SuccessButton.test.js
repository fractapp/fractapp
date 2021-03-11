import React from 'react';
import renderer from 'react-test-renderer';
import {SuccessButton} from 'components/SuccessButton';

it('Test one', () => {
  const tree = renderer
    .create(<SuccessButton size={10} onPress={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(<SuccessButton size={10} onPress={() => {}} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

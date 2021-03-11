import React from 'react';
import renderer from 'react-test-renderer';
import {SeedButton} from 'components/SeedButton';

it('Test prefix="1." text="word#1"', () => {
  const tree = renderer
    .create(
      <SeedButton
        prefix={'1.'}
        text={'word#1'}
        onPress={() => console.log('click')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test prefix=empty text="word#2"', () => {
  const tree = renderer
    .create(
      <SeedButton
        prefix={''}
        text={'word#2'}
        onPress={() => console.log('click')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

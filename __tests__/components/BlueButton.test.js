import React from 'react';
import renderer from 'react-test-renderer';
import {BlueButton} from 'components/BlueButton';

it('Test disabled=false', () => {
  const tree = renderer
    .create(
      <BlueButton
        text={'Text #1'}
        height={10}
        disabled={false}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test disabled=true', () => {
  const tree = renderer
    .create(
      <BlueButton
        text={'Text #2'}
        height={20}
        disabled={true}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test width=90', () => {
  const tree = renderer
    .create(
      <BlueButton
        text={'Text #2'}
        height={20}
        width={'90%'}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

import React from 'react';
import renderer from 'react-test-renderer';
import {PasswordInput} from 'components/PasswordInput';

it('Test placeholder="placeholder#1" defaultValue=default width=default', () => {
  const tree = renderer
    .create(
      <PasswordInput
        placeholder={'placeholder#1'}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test placeholder="placeholder#2" defaultValue="value#2" width=50', () => {
  const tree = renderer
    .create(
      <PasswordInput
        placeholder={'placeholder#2'}
        defaultValue={'value#2'}
        width={'50%'}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

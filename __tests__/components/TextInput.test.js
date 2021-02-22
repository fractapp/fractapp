import React from 'react';
import renderer from 'react-test-renderer';
import {TextInput} from 'components/TextInput';

it('Test one', () => {
  const tree = renderer
    .create(<TextInput placeholder={'placeholder'} onChangeText={jest.fn()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <TextInput
        placeholder={'placeholder'}
        defaultValue={'defaultValue'}
        width={'90%'}
        onChangeText={jest.fn()}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

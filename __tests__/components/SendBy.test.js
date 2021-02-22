import React from 'react';
import renderer from 'react-test-renderer';
import {SendBy} from 'components/SendBy';

it('Test one', () => {
  const tree = renderer
    .create(
      <SendBy title={'title'} img={require('assets/img/default-avatar.png')} />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

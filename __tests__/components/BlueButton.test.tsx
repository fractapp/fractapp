import React from 'react';
import renderer from 'react-test-renderer';
import { BlueButton } from 'components';

it('Test height=20 && text="Text #1" && width=default', () => {
  const tree = renderer
    .create(<BlueButton text="Text #1" height={20} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test height=40 && text="Text #2" && width=50 ', () => {
  const tree = renderer
    .create(<BlueButton text="Text #2" height={40} width={50} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
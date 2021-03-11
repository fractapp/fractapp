import React from 'react';
import renderer from 'react-test-renderer';
import {Loader} from 'components/Loader';

it('Test positive', () => {
  const tree = renderer.create(<Loader />).toJSON();
  expect(tree).toMatchSnapshot();
});

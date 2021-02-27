import React from 'react';
import renderer from 'react-test-renderer';
import {Contact} from 'components/Contact';

it('Test one', () => {
  const tree = renderer
    .create(
      <Contact
        name={'contact'}
        img={null}
        usernameOrPhoneNumber={'username'}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <Contact
        name={'contactTwo'}
        img={require('assets/img/default-avatar.png')}
        usernameOrPhoneNumber={'phoneNumber'}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test three', () => {
  const tree = renderer
    .create(
      <Contact
        name={''}
        img={require('assets/img/default-avatar.png')}
        usernameOrPhoneNumber={'phoneNumber'}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

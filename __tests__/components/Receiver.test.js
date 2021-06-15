import React from 'react';
import renderer from 'react-test-renderer';
import {Receiver, ReceiverType} from 'components/Receiver';
import {Currency} from 'types/wallet';
import StringUtils from 'utils/string';

it('Test one', () => {
  const tree = renderer
    .create(
      <Receiver
        nameOrAddress={'name'}
        type={ReceiverType.User}
        avatar={require('assets/img/default-avatar.png')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <Receiver
        nameOrAddress={'1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE'}
        type={ReceiverType.Address}
        currency={Currency.DOT}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

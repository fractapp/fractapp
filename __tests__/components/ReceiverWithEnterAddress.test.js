import React from 'react';
import renderer from 'react-test-renderer';
import {ReceiverWithEnterAddress} from 'components/ReceiverWithEnterAddress';
import {Currency} from '../../src/types/wallet';

it('Test one', () => {
  const tree = renderer
    .create(
      <ReceiverWithEnterAddress
        value={'value'}
        isValid={true}
        currency={Currency.Polkadot}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <ReceiverWithEnterAddress
        value={'1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE'}
        isValid={false}
        currency={Currency.Kusama}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test three', () => {
  const tree = renderer
    .create(
      <ReceiverWithEnterAddress
        value={''}
        isValid={false}
        currency={Currency.Kusama}
        onOk={() => {}}
        onChangeText={(text) => {}}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

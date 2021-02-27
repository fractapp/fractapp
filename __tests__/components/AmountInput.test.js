import React from 'react';
import renderer from 'react-test-renderer';
import {AmountInput} from 'components/AmountInput';
import {Currency} from '../../src/types/wallet';

it('Test one', () => {
  const tree = renderer
    .create(
      <AmountInput
        alternativeValue={123}
        fee={1000}
        currency={Currency.Polkadot}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <AmountInput
        alternativeValue={555}
        fee={100}
        currency={Currency.Kusama}
        usdMode={true}
        value={'100'}
        width={'90%'}
        onChangeText={() => console.log('test')}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});

import React from 'react';
import renderer from 'react-test-renderer';
import {AmountValue} from 'components/AmountValue';
import {Currency} from 'types/wallet';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));
it('Test one', () => {
  const tree = renderer
    .create(
      <AmountValue
        alternativeValue={555}
        fee={100}
        currency={Currency.DOT}
        isUSDMode={true}
        value={100}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
it('Test two', () => {
  const tree = renderer
    .create(
      <AmountValue
        alternativeValue={111}
        fee={11}
        currency={Currency.KSM}
        isUSDMode={false}
        value={100}
        width={'90%'}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
it('Test three', () => {
  const tree = renderer
    .create(
      <AmountValue
        alternativeValue={111}
        fee={11}
        currency={Currency.KSM}
        isUSDMode={false}
        value={0}
        width={'90%'}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});

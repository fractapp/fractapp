import React from 'react';
import renderer from 'react-test-renderer';
import {StatisticsBar} from 'components/StatisticsBar';
import {Currency} from 'types/wallet';

it('Test empty wallet', () => {
  const tree = renderer
    .create(<StatisticsBar distribution={new Map()} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test one currency Polkadot', () => {
  const tree = renderer
    .create(<StatisticsBar distribution={new Map([[Currency.DOT, 100]])} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test one currency Kusama', () => {
  const tree = renderer
    .create(<StatisticsBar distribution={new Map([[Currency.KSM, 100]])} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test two currency 50/50', () => {
  const tree = renderer
    .create(
      <StatisticsBar
        distribution={
          new Map([
            [Currency.KSM, 100],
            [Currency.DOT, 100],
          ])
        }
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test two currency 10/90', () => {
  const tree = renderer
    .create(
      <StatisticsBar
        distribution={
          new Map([
            [Currency.DOT, 10],
            [Currency.KSM, 90],
          ])
        }
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test default color', () => {
  const tree = renderer
    .create(<StatisticsBar distribution={new Map([[999, 10]])} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

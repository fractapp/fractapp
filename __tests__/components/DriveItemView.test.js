import React from 'react';
import renderer from 'react-test-renderer';
import {DriveItemView} from 'components/DriveItemView';
import {DriveItem, Type} from 'types/google';
import StringUtils from 'utils/string';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test id=1 && title="Title #1" type=Dir', () => {
  const tree = renderer
    .create(
      <DriveItemView
        item={{
          id: '1',
          title: 'Title #1',
          type: Type.Dir,
        }}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test id=2 && title="Title #2" type=Json', () => {
  const tree = renderer
    .create(
      <DriveItemView
        item={{
          id: '2',
          title: 'Title #2',
          type: Type.Json,
        }}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test title length > 25', () => {
  const tree = renderer
    .create(
      <DriveItemView
        item={{
          id: '1',
          title: '1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE',
          type: Type.Dir,
        }}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

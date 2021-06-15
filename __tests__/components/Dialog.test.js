import React from 'react';
import renderer from 'react-test-renderer';
import {Dialog} from 'components/Dialog';
import StringUtils from 'utils/string';

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test title="Title #1" && text="Text #1" && visible=true', () => {
  const tree = renderer
    .create(
      <Dialog
        title="Title #1"
        text="Text #1"
        visible={true}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test title="Title #2" && text="Text #2" && visible=false', () => {
  const tree = renderer
    .create(
      <Dialog
        title="Title #2"
        text="Text #2"
        visible={false}
        onPress={() => console.log('test')}
      />,
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

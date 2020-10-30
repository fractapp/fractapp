import React from 'react';
import renderer from 'react-test-renderer';
import { DriveItemView } from 'components';
import { DriveItem, Type } from 'models/google'

it('Test id=1 && title="Title #1" type=Dir', () => {
    const tree = renderer
        .create(<DriveItemView item={new DriveItem("1", "Title #1", Type.Dir)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});


it('Test id=2 && title="Title #2" type=Json', () => {
    const tree = renderer
        .create(<DriveItemView item={new DriveItem("2", "Title #2", Type.Json)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test title length > 25', () => {
    const tree = renderer
        .create(<DriveItemView item={new DriveItem("1", "1exaAg2VJRQbyUBAeXcktChCAqjVP9TUxF3zo23R2T6EGdE", Type.Dir)} />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
import React, { useState } from 'react';
import { render } from '@testing-library/react-native';
import { GoogleDrivePicker } from 'screens/GoogleDrivePicker';
import renderer from 'react-test-renderer';
import { DriveItem, Type } from 'models/google'
import googleUtil from 'utils/google'

jest.mock('utils/polkadot', () => { })
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])

jest.mock('utils/google', () => ({
    getItems: jest.fn(),
    getFileBackup: jest.fn()
}))


it('Test root dir', async () => {
    const items = new Array(
        new DriveItem("dir#1", "dir#1", Type.Dir),
        new DriveItem("dir#2", "dir#2", Type.Dir),
        new DriveItem("dir#3", "dir#3", Type.Dir),
        new DriveItem("json#1", "json#1", Type.Json),
        new DriveItem("json#2", "json#2", Type.Json)
    )
    useState
        .mockImplementationOnce(init => [init, jest.fn()])
        .mockImplementationOnce(init => [items, jest.fn()])
        .mockImplementationOnce(init => [false, jest.fn()])

    const tree = render(
        <GoogleDrivePicker navigation={null} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('Test deep dir', async () => {
    const items = new Array(
        new DriveItem("dir#3", "dir#3", Type.Dir),
        new DriveItem("json#1", "json#1", Type.Json),
        new DriveItem("json#2", "json#2", Type.Json)
    )
    useState
        .mockImplementationOnce(init => [["root", "dir#1"], jest.fn()])
        .mockImplementationOnce(init => [items, jest.fn()])
        .mockImplementationOnce(init => [false, jest.fn()])

    const tree = render(
        <GoogleDrivePicker navigation={null} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('Test update $1', async () => {
    render(
        <GoogleDrivePicker navigation={null} />
    )

    expect(googleUtil.getItems).toHaveBeenCalledWith("root");
});

it('Test update #2', async () => {
    useState
        .mockImplementationOnce(init => [["root", "dir#1"], jest.fn()])

    render(
        <GoogleDrivePicker navigation={null} />
    )

    expect(googleUtil.getItems).toHaveBeenCalledWith("dir#1");
});

it('Test loader', async () => {
    const tree = render(
        <GoogleDrivePicker navigation={null} />
    )

    expect(tree).toMatchSnapshot();
});

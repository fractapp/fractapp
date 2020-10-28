import React, { useState } from 'react';
import { render } from '@testing-library/react-native';
import { GoogleDiskPicker } from 'screens/GoogleDiskPicker';
import renderer from 'react-test-renderer';
import { DiskItem, Type } from 'models/google'
import { getItems, getFileBackup } from 'utils/google'

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
        new DiskItem("dir#1", "dir#1", Type.Dir),
        new DiskItem("dir#2", "dir#2", Type.Dir),
        new DiskItem("dir#3", "dir#3", Type.Dir),
        new DiskItem("json#1", "json#1", Type.Json),
        new DiskItem("json#2", "json#2", Type.Json)
    )
    useState
        .mockImplementationOnce(init => [init, jest.fn()])
        .mockImplementationOnce(init => [items, jest.fn()])
        .mockImplementationOnce(init => [false, jest.fn()])

    const tree = render(
        <GoogleDiskPicker navigation={null} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('Test deep dir', async () => {
    const items = new Array(
        new DiskItem("dir#3", "dir#3", Type.Dir),
        new DiskItem("json#1", "json#1", Type.Json),
        new DiskItem("json#2", "json#2", Type.Json)
    )
    useState
        .mockImplementationOnce(init => [["root", "dir#1"], jest.fn()])
        .mockImplementationOnce(init => [items, jest.fn()])
        .mockImplementationOnce(init => [false, jest.fn()])

    const tree = render(
        <GoogleDiskPicker navigation={null} />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

it('Test update $1', async () => {
    render(
        <GoogleDiskPicker navigation={null} />
    )

    expect(getItems).toHaveBeenCalledWith("root");
});

it('Test update #2', async () => {
    useState
        .mockImplementationOnce(init => [["root", "dir#1"], jest.fn()])

    render(
        <GoogleDiskPicker navigation={null} />
    )

    expect(getItems).toHaveBeenCalledWith("dir#1");
});

it('Test loader', async () => {
    const tree = render(
        <GoogleDiskPicker navigation={null} />
    )

    expect(tree).toMatchSnapshot();
});

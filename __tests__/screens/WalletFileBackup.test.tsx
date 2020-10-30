import React, { useState } from 'react';
import { WalletFileBackup } from 'screens/WalletFileBackup';
import renderer from 'react-test-renderer';
import backupUtil from 'utils/backup';
import AuthStore from 'storage/Auth'
import DialogStore from 'storage/Dialog'

jest.mock('utils/db', () => ({
    createAccounts: async (seed: string) => { }
}))

jest.mock('react-native-crypto', () => { })
jest.mock('react-native-fs', () => { })
jest.mock('react-native-share', () => { })
jest.mock('@polkadot/util-crypto', () => { })
jest.mock('utils/google', () => { })

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useState: jest.fn(),
}))

useState.mockImplementation(init => [init, jest.fn()])

const params = {
    seed: "staff select toddler junior robot own paper sniff glare drive stay census".split(" "),
    type: backupUtil.BackupType.File,
}

it('Test empty password', () => {
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <DialogStore.Context.Provider value={{
                    dialog: {
                        text: "",
                        title: "",
                        visible: false
                    }
                }}>
                    <WalletFileBackup route={{ params: params }} />
                </DialogStore.Context.Provider>
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test loading', () => {
    useState
        .mockImplementationOnce(init => [init, jest.fn()])
        .mockImplementationOnce(init => [init, jest.fn()])
        .mockImplementationOnce(init => [true, jest.fn()])

    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <DialogStore.Context.Provider value={{
                    dialog: {
                        text: "",
                        title: "",
                        visible: false
                    }
                }}>
                    <WalletFileBackup route={{ params: params }} />
                </DialogStore.Context.Provider>
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test minimum password length', () => {
    useState
        .mockImplementationOnce(init => ["123", jest.fn()])
        .mockImplementationOnce(init => ["123", jest.fn()])
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <DialogStore.Context.Provider value={{
                    dialog: {
                        text: "",
                        title: "",
                        visible: false
                    }
                }}>
                    <WalletFileBackup route={{ params: params }} />
                </DialogStore.Context.Provider>
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test password do not match', () => {
    useState
        .mockImplementationOnce(init => ["123123", jest.fn()])
        .mockImplementationOnce(init => ["222222", jest.fn()])
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <DialogStore.Context.Provider value={{
                    dialog: {
                        text: "",
                        title: "",
                        visible: false
                    }
                }}>
                    <WalletFileBackup route={{ params: params }} />
                </DialogStore.Context.Provider>
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

it('Test success password', () => {
    useState
        .mockImplementationOnce(init => ["123123", jest.fn()])
        .mockImplementationOnce(init => ["123123", jest.fn()])
    const tree = renderer
        .create(
            <AuthStore.Context.Provider value={{
                isSign: false
            }}>
                <DialogStore.Context.Provider value={{
                    dialog: {
                        text: "",
                        title: "",
                        visible: false
                    }
                }}>
                    <WalletFileBackup route={{ params: params }} />
                </DialogStore.Context.Provider>
            </AuthStore.Context.Provider>
        )
        .toJSON();
    expect(tree).toMatchSnapshot();
});

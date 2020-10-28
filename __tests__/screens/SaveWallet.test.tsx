import React from 'react';
import { PermissionsAndroid } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native';
import { SaveWallet } from 'screens/SaveWallet';
import renderer from 'react-test-renderer';
import * as DialogStore from 'storage/Dialog'
import { signIn, signOut } from 'utils/google'
import DocumentPicker from 'react-native-document-picker';
import { getFile, BackupType } from 'utils/backup';
import { FileBackup } from 'models/backup';

const seed = ["seed"]

jest.mock('react-native-crypto', () => { });
jest.mock('react-native-fs', () => { });
jest.mock('@polkadot/util-crypto', () => ({
  mnemonicGenerate: () => "seed",
  mnemonicValidate: () => true
}));
jest.mock('react-native', () => {
  const result = jest.requireActual('react-native')
  result.PermissionsAndroid.PERMISSIONS = {
    WRITE_EXTERNAL_STORAGE: "WRITE_EXTERNAL_STORAGE",
    READ_EXTERNAL_STORAGE: "READ_EXTERNAL_STORAGE"
  }
  result.PermissionsAndroid.requestMultiple = jest.fn()
  return result
})
jest.mock('utils/google', () => ({
  signIn: jest.fn(),
  signOut: jest.fn()
}))
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
  types: {
    allFiles: jest.fn()
  }
}))

it('Test positive', () => {
  const tree = renderer
    .create(
      <DialogStore.Context.Provider value={{
        dialog: {
          text: "",
          title: "",
          visible: false
        }
      }}>
        <SaveWallet navigation={null} />
      </DialogStore.Context.Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click google disk', async () => {
  const mockFn = jest.fn()
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      }
    }}>
      <SaveWallet navigation={{ navigate: mockFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('Google disk'));
  expect(signOut).toBeCalled()
  expect(signIn).toBeCalled()
  expect(mockFn).toBeCalledWith("WalletFileBackup", { seed: seed, type: BackupType.GoogleDisk })
});

it('Test click enter seed', () => {
  const mockFn = jest.fn()
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      }
    }}>
      <SaveWallet navigation={{ navigate: mockFn }} />
    </DialogStore.Context.Provider>
  )

  fireEvent.press(component.getByText('Backup seed'));
  expect(mockFn).toBeCalledWith('SaveSeed', { seed: seed })
});

it('Test click encrypted file isGaranted=false', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "denied",
    "READ_EXTERNAL_STORAGE": "denied"
  })

  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <SaveWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('Encrypted file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(mockNavFn).not.toBeCalledWith("WalletFileBackup", { seed: seed, type: BackupType.File })
});

it('Test click encrypted file isGaranted=false && open dialog', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "never_ask_again",
    "READ_EXTERNAL_STORAGE": "never_ask_again"
  })

  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <SaveWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('Encrypted file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(mockDispatchFn).toBeCalled()
  expect(mockNavFn).not.toBeCalledWith("WalletFileBackup", { seed: seed, type: BackupType.File })
});

it('Test click encrypted file isGaranted=true', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "granted",
    "READ_EXTERNAL_STORAGE": "granted"
  })
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <SaveWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('Encrypted file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(mockNavFn).toBeCalledWith("WalletFileBackup", { seed: seed, type: BackupType.File })
});

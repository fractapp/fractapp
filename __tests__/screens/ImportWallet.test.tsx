import React from 'react';
import { PermissionsAndroid } from 'react-native'
import { render, fireEvent } from '@testing-library/react-native';
import { ImportWallet } from 'screens/ImportWallet';
import renderer from 'react-test-renderer';
import DialogStore from 'storage/Dialog'
import googleUtil from 'utils/google'
import DocumentPicker from 'react-native-document-picker';
import backupUtil from 'utils/backup';
import { FileBackup } from 'models/backup';

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
jest.mock('utils/backup', () => ({
  getFile: jest.fn()
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
        <ImportWallet navigation={null} />
      </DialogStore.Context.Provider>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Test click google drive', async () => {
  const mockFn = jest.fn()
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      }
    }}>
      <ImportWallet navigation={{ navigate: mockFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('Google drive'));
  expect(googleUtil.signOut).toBeCalled()
  expect(googleUtil.signIn).toBeCalled()
  expect(mockFn).toBeCalledWith("GoogleDrivePicker")
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
      <ImportWallet navigation={{ navigate: mockFn }} />
    </DialogStore.Context.Provider>
  )

  fireEvent.press(component.getByText('Enter seed'));
  expect(mockFn).toBeCalledWith("ImportSeed")
});

it('Test click from file isGaranted=false', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "denied",
    "READ_EXTERNAL_STORAGE": "denied"
  })

  const file = new FileBackup("seed", "algorithm")
  backupUtil.getFile.mockReturnValueOnce(file)
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <ImportWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('From file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(DocumentPicker.pick).not.toBeCalled()
  expect(backupUtil.getFile).not.toBeCalled()
  expect(mockNavFn).not.toBeCalledWith("WalletFileImport", { file: file })
});

it('Test click from file isGaranted=false && open dialog', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "never_ask_again",
    "READ_EXTERNAL_STORAGE": "never_ask_again"
  })

  const file = new FileBackup("seed", "algorithm")
  backupUtil.getFile.mockReturnValueOnce(file)
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <ImportWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('From file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(mockDispatchFn).toBeCalled()
  expect(DocumentPicker.pick).not.toBeCalled()
  expect(backupUtil.getFile).not.toBeCalled()
  expect(mockNavFn).not.toBeCalledWith("WalletFileImport", { file: file })
});

it('Test click from file isGaranted=true', async () => {
  const mockNavFn = jest.fn()
  const mockDispatchFn = jest.fn()

  PermissionsAndroid.requestMultiple.mockReturnValueOnce({
    "WRITE_EXTERNAL_STORAGE": "granted",
    "READ_EXTERNAL_STORAGE": "granted"
  })

  const file = new FileBackup("seed", "algorithm")
  backupUtil.getFile.mockReturnValueOnce(file)
  DocumentPicker.pick.mockReturnValueOnce({ uri: "" })
  
  const component = render(
    <DialogStore.Context.Provider value={{
      dialog: {
        text: "",
        title: "",
        visible: false
      },
      dispatch: mockDispatchFn
    }}>
      <ImportWallet navigation={{ navigate: mockNavFn }} />
    </DialogStore.Context.Provider>
  )

  await fireEvent.press(component.getByText('From file'));

  expect(PermissionsAndroid.requestMultiple).toBeCalledWith(["WRITE_EXTERNAL_STORAGE", "READ_EXTERNAL_STORAGE"])
  expect(DocumentPicker.pick).toBeCalled()
  expect(backupUtil.getFile).toBeCalled()
  expect(mockNavFn).toBeCalledWith("WalletFileImport", { file: file })
});

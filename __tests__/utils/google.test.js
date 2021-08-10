import googleUtil from 'utils/google';
import {GoogleSignin} from '@react-native-community/google-signin';
import GDrive from 'react-native-google-drive-api-wrapper';
import {Type} from 'types/google';
import StringUtils from 'utils/string';

jest.mock('@react-native-community/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    isSignedIn: jest.fn(),
    getTokens: jest.fn(),
    clearCachedAccessToken: jest.fn(),
    signOut: jest.fn(),
    signIn: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));
jest.mock('react-native-google-drive-api-wrapper', () => ({
  setAccessToken: jest.fn(),
  init: jest.fn(),
  files: {
    safeCreateFolder: jest.fn(),
    getId: jest.fn(),
    createFileMultipart: jest.fn(),
    list: jest.fn(),
    get: jest.fn(),
  },
}));

jest.mock('react-native-i18n', () => ({
  t: (value) => value,
}));

it('Test signOut isSigned=false', async () => {
  GoogleSignin.isSignedIn.mockReturnValueOnce(false);

  await googleUtil.signOut();
  expect(GoogleSignin.getTokens).not.toBeCalled();
});

it('Test signOut isSigned=true', async () => {
  GoogleSignin.isSignedIn.mockReturnValueOnce(true);

  const accessToken = 'accessToken';
  GoogleSignin.getTokens.mockReturnValueOnce({accessToken: accessToken});

  await googleUtil.signOut();
  expect(GoogleSignin.clearCachedAccessToken).toBeCalledWith(accessToken);
  expect(GoogleSignin.signOut).toBeCalled();
});

it('Test safeSave fieldId != undefined', async () => {
  const dir = 'dir';
  const fileName = 'filename';
  const file = 'file';
  const fieldIdDir = 'fieldIdDir';
  const fieldId = 'fieldId';

  GDrive.files.getId
    .mockReturnValueOnce(fieldIdDir)
    .mockReturnValueOnce(fieldId);

  const isSuccess = await googleUtil.safeSave(dir, fileName, file);
  expect(isSuccess).toBe(true);

  expect(GDrive.files.safeCreateFolder).toBeCalledWith({
    name: dir,
    parents: ['root'],
  });
  expect(GDrive.files.getId).toBeCalledWith(dir, ['root']);
  expect(GDrive.files.getId).toBeCalledWith(fileName, ['root', fieldIdDir]);
});

it('Test safeSave fieldId == undefined', async () => {
  const dir = 'dir';
  const fileName = 'filename';
  const file = 'file';
  const fieldIdDir = 'fieldIdDir';

  GDrive.files.getId
    .mockReturnValueOnce(fieldIdDir)
    .mockReturnValueOnce(undefined);

  GDrive.files.createFileMultipart.mockReturnValueOnce({status: 200});

  const isSuccess = await googleUtil.safeSave(dir, fileName, file);
  expect(isSuccess).toBe(true);

  expect(GDrive.files.safeCreateFolder).toBeCalledWith({
    name: dir,
    parents: ['root'],
  });
  expect(GDrive.files.getId).toBeCalledWith(dir, ['root']);
  expect(GDrive.files.getId).toBeCalledWith(fileName, ['root', fieldIdDir]);
  expect(GDrive.files.createFileMultipart).toBeCalledWith(
    file,
    'application/json',
    {
      parents: [fieldIdDir],
      name: fileName,
    },
    false,
  );
});

it('Test safeSave fieldId == undefined && status != 200', async () => {
  const dir = 'dir';
  const fileName = 'filename';
  const file = 'file';
  const fieldIdDir = 'fieldIdDir';

  GDrive.files.getId
    .mockReturnValueOnce(fieldIdDir)
    .mockReturnValueOnce(undefined);

  GDrive.files.createFileMultipart.mockReturnValueOnce({status: 404});

  const isSuccess = await googleUtil.safeSave(dir, fileName, file);
  expect(isSuccess).toBe(false);

  expect(GDrive.files.safeCreateFolder).toBeCalledWith({
    name: dir,
    parents: ['root'],
  });
  expect(GDrive.files.getId).toBeCalledWith(dir, ['root']);
  expect(GDrive.files.getId).toBeCalledWith(fileName, ['root', fieldIdDir]);
  expect(GDrive.files.createFileMultipart).toBeCalledWith(
    file,
    'application/json',
    {
      parents: [fieldIdDir],
      name: fileName,
    },
    false,
  );
});

it('Test signIn user!=null&&isSigned=true', async () => {
  GoogleSignin.getCurrentUser.mockReturnValueOnce({});
  GoogleSignin.isSignedIn.mockReturnValueOnce(true);

  const accessToken = 'accessToken';
  GoogleSignin.getTokens.mockReturnValueOnce({accessToken: accessToken});

  await googleUtil.signIn();
  expect(GDrive.setAccessToken).toBeCalledWith(accessToken);
  expect(GDrive.init).toBeCalled();
  expect(GoogleSignin.signIn).not.toBeCalledWith();
});

it('Test signIn user=null&&isSigned=false', async () => {
  GoogleSignin.getCurrentUser.mockReturnValueOnce(null);
  GoogleSignin.isSignedIn.mockReturnValueOnce(false);

  const accessToken = 'accessToken';
  GoogleSignin.getTokens.mockReturnValueOnce({accessToken: accessToken});

  await googleUtil.signIn();
  expect(GDrive.setAccessToken).toBeCalledWith(accessToken);
  expect(GDrive.init).toBeCalled();
  expect(GoogleSignin.signIn).toBeCalled();
});

it('Test getItems', async () => {
  const path = 'path';
  let files = new Array();
  for (let i = 0; i < 10; i++) {
    files.push({
      id: 'id' + i,
      name: 'name' + i,
      mimeType:
        i % 2 ? 'application/vnd.google-apps.folder' : 'application/json',
    });
  }
  files.push({
    id: 'id invalid',
    name: 'name invalid',
    mimeType: 'invalid',
  });

  GDrive.files.list.mockReturnValueOnce({
    json: () => ({
      files: files,
    }),
  });

  const items = await googleUtil.getItems(path);
  for (let i = 0; i < items.length; i++) {
    expect(items[i].id).toBe(files[i].id);
    expect(items[i].title).toBe(files[i].name);
    expect(items[i].type).toBe(i % 2 ? Type.Dir : Type.Json);
  }

  expect(items.length).toBe(files.length - 1);
});

it('Test getFileBackup', async () => {
  const id = 'testId';
  const eFile = {
    seed: 'seed',
    algorithm: 'algorithm',
  };
  GDrive.files.get.mockReturnValueOnce({json: () => eFile});

  const file = await googleUtil.getFileBackup(id);

  expect(GDrive.files.get).toBeCalledWith(id, {alt: 'media'});
  expect(file.seed).toBe(eFile.seed);
  expect(file.algorithm).toBe(eFile.algorithm);
});

it('Test getFileBackup with throw', async () => {
  const id = 'testId';
  const eFile = {a: 'invalidFile'};
  GDrive.files.get.mockReturnValueOnce({json: () => eFile});

  expect(googleUtil.getFileBackup(id)).rejects.toThrow('invalid file');
});

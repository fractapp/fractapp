import crypto from 'react-native-crypto';
import passcodeUtil from 'utils/passcode';

jest.mock('react-native-crypto', () => ({
  createHash: jest.fn(),
}));

it('Test hash', async () => {
  const passcode = '123123';
  const salt = 'salt-123123';

  const mockUpdate = jest.fn();
  const mockDigest = jest.fn();

  crypto.createHash.mockReturnValueOnce({
    update: mockUpdate,
    digest: mockDigest,
  });
  mockDigest.mockReturnValueOnce('0x0000000000000000000');
  const hash = passcodeUtil.hash(passcode, salt);

  expect(hash).toBe('0x0000000000000000000');
  expect(mockUpdate).toBeCalledWith(salt + passcode);
  expect(mockDigest).toBeCalledWith('base64');
});

// @ts-ignore
import crypto from 'react-native-crypto';

/**
 * @namespace
 * @category Utils
 */
namespace PasscodeUtil {
  export function hash(passcode: string, salt: string): string {
    const hashValue = crypto.createHash('sha256');
    hashValue.update(salt + passcode);
    return hashValue.digest('base64');
  }
}

export default PasscodeUtil;

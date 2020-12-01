import crypto from 'react-native-crypto';

/**
 * @namespace
   * @category Utils
*/
namespace PasscodeUtil {
    export function hash(passcode: string, salt: string): string {
        const hash = crypto.createHash('sha256');
        hash.update(salt + passcode);
        return hash.digest('base64');
    }
}

export default  PasscodeUtil
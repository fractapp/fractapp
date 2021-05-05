/**
 * @namespace
 * @category Utils
 */
import {Currency, getSymbol} from 'types/wallet';

namespace StringUtils {
  export const texts = {
    WelcomeTitle: 'Welcome to Fractapp',
    WelcomeDescription: 'The most simple Polkadot wallet for DeFi and crypto',
    SynchronizationTitle: 'Synchronization',

    FractappWalletTitle: 'Fractapp Wallet',
    FeeTitle: 'Fee',
    SentTitle: 'You sent',
    ReceivedTitle: 'You received',
    TotalTitle: 'Total',
    UnreadMessagesTitle: 'Unread messages',
    ChooseWalletTitle: 'Choose wallet',

    SearchPlaceholder: 'Search',
    NoResultsTitle: 'No results',

    EnterValidAddressErr: 'Please enter a valid address first',
    SendByAddressBtn: 'Send by address',
    NotEnoughBalanceErr: 'Not enough balance',
    EnterAmountTitle: 'Enter amount',
    EnterAddressTitle: 'Enter address',
    ResendTitle: 'Resend',
    ResendText: 'Can be resend after',
    ConfirmBtnTitle: 'Confirm',
    NextBtnTitle: 'Next',
    StartBtnTitle: 'Start',

    CopyBtn: 'Copy',
    ShareBtn: 'Share',
    passCode: {
      verifyDescription: 'Enter passcode',
      newCodeDescription: 'Enter new passcode',
      confirmNewCodeDescription: 'Confirm new passcode',
    },
    showMsg: {
      walletNotFound: 'Wallet not found',
      passcodeNotEquals: 'Passcode not equals',
      addressCopied: 'Address copied',
      copiedToClipboard: 'Copied to Clipboard',
      copied: 'Copied',
      incorrectPasscode: 'Incorrect passcode',
      connectionRestored: 'Connection restored',
      invalidConnection: 'Invalid connection',
    },

    WriteOffAccountTitle: 'Write-off account',
    ReceivingAccountTitle: 'Receiving account',

    SendBtn: 'Send',
    ReceiveBtn: 'Receive',

    RestoreBtn: 'Restore',

    statuses: {
      success: 'Success',
      pending: 'Pending',
      failed: 'Failed',
    },
    walletFileBackup: {
      title: 'Wallet encryption',
      description:
        'Enter the password to encrypt your wallet. Do not lose your password otherwise you will not be able to restore access.',
      filenamePlaceholder: 'File name',
      passwordPlaceholder: 'Password',
      confirmPassword: 'Confirm password',
      passLenErr: 'Minimum password length is 6 characters',
      passNotMatch: 'Password do not match',
    },
    walletFileImport: {
      title: 'Wallet decryption',
      passwordPlaceholder: 'Password',
      description: 'Enter the password to decrypt your wallet.',
      invalidPasswordTitle: 'Invalid password',
    },
    saveSeed: {
      title: 'Your secret phrase',
      description:
        'Write these 12 word down, or copy them to your password manager.',
      info:
        'These 12 words are the keys to your wallet. Back up in a safe place. Do not share this with anyone.',
    },
    importSeed: {
      title: 'Import secret phrase',
      description: 'Import your secret phrase',
      invalidSecretPhraseErr: 'Invalid secret phrase',
    },
    importWallet: {
      googleDriveTitle: 'From Google Drive',
      manuallyTitle: 'With recovery phrase',
    },
    legal: {
      tos: 'Terms & Conditions',
      privacyPolicy: 'Privacy Policy',
    },
    saveWallet: {
      title: 'Save a wallet',
      description:
        'Save your wallet keys in a safe place. If you lose your wallet keys, you cannot restore access to it. Do not share this with anyone.',
      googleDriveTitle: 'On Google Drive',
      manuallyTitle: 'Back up manually',
    },
    backup: {
      title:
        'Save your wallet in a safe place. If you lose your wallet, you cannot restore access to it.',
      googleDriveTitle: 'On Google Drive',
      manuallyTitle: 'Back up manually',
    },
    confirmSaveSeed: {
      title: 'Verify secret phrase',
      description: 'Put the words in the correct order.',
      incorrectEnteredSeed: 'Incorrectly entered seed',
    },
    connecting: {
      title: 'Connecting',
      description:
        'Connect if you want to receive cryptocurrency by phone number, email or twitter.',
      phone: 'Connect phone number',
      email: 'Connect email',
    },
    edit: {
      email: 'Enter email',
      name: 'Enter name',
      username: 'Enter username',

      phoneTitle: 'Phone',
      countryTitle: 'Country',
      invalidPhoneNumber: 'Invalid phone number',

      profile: {
        nameTitle: 'Name',
        usernameTitle: 'Username',
        phoneTitle: 'Phone',
        emailTitle: 'Email',

        namePlaceholder: 'Write your name',
        usernamePlaceholder: 'Write your username',
        phonePlaceholder: 'Write your phone',
        emailPlaceholder: 'Write your email',
      },
    },

    YourBalanceTitle: 'Your balance',
    OpenSettingsTitle: 'Open settings',
    OpenSettingsForStorageText:
      'If you want to save a file then open the application settings and give it access to the storage.',
    OpenSettingsForContactsText:
      'If you want to find users by your contacts then open the application settings and give it access to read your contacts.',

    WaitLoadingTitle: 'Wait loading amount',

    ServiceUnavailableTitle: 'Service unavailable',
    UserHasBeenDeletedTitle: 'User has been deleted',

    settingWallet: {
      backup: 'I have a wallet',
      create: 'Create new wallet',
    },
    DifferentAddressTitle: 'The account is registered to a different address',
    DifferentAddressText: '',

    InvalidPhoneNumberTitle: 'Invalid phone number',
    InvalidPhoneNumberText: 'Please validate and write phone number again',

    InvalidEmailTitle: 'Invalid email',
    InvalidEmailText: 'Please validate and write email again',

    InvalidNameTitle: 'Invalid name',
    InvalidNameText: 'Please validate and write name again',

    InvalidUsernameTitle: 'Invalid name',
    InvalidUsernameText: 'Please validate and write username again',

    UsernameIsExistTitle: 'Username exists',
    UsernameIsExistText: 'Please write new username',

    FileExistTitle: 'File exists',
    FileExistText: 'Please enter a different file name',

    SuccessSaveWalletTitle: 'Success save wallet',
    SuccessSaveWalletText: (filename: string, folder: string) =>
      `If you lose access to file then you will not be able to restore access to the wallet. File "${filename}.json" saved in "${folder}" directory`,

    MyAddressForText: (currency: Currency, address: string) =>
      `My address for ${getSymbol(currency)}: ${address}`,

    SendText: 'Send',
    ConfirmationCodePhoneNumberText:
      'Confirmation code sent to your phone number',
    ConfirmationCodeEmailText: 'Confirmation code sent to your email',

    MinimumTransferErrorTitle: 'Minimum transfer',
    MinimumTransferErrorText: 'The minimum transfer for this recipient is',

    NeedFullBalanceErrTitle: 'Amount',
    NeedFullBalanceErrText: (
      minBalance: number,
      validAmount: string,
      currency: Currency,
    ) =>
      `After the transfer, more than ${minBalance} ${getSymbol(
        currency,
      )} should remain on the balance or transfer the entire remaining balance. Valid amount: ${validAmount}`,
  };

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  /**
   * get month name by day number
   */
  export function getMonths(day: number): string {
    return months[day];
  }

  /**
   * convert date to string
   */
  export function toTitle(now: Date, date: Date): string {
    let dateValue = '';
    if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    ) {
      dateValue = 'Today';
    } else if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() - 1 === date.getDate()
    ) {
      dateValue = 'Yesterday';
    } else if (now.getFullYear() === date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()];
    } else {
      dateValue =
        date.getDate() +
        ' ' +
        months[date.getMonth()] +
        ' ' +
        date.getFullYear();
    }

    return dateValue;
  }

  /**
   * convert date to string
   */
  export function forChatInfo(now: Date, date: Date): string {
    let dateValue = '';
    if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    ) {
      let hours = String(date.getHours());
      let minutes = String(date.getMinutes());
      if (hours.length === 1) {
        hours = '0' + hours;
      }
      if (minutes.length === 1) {
        minutes = '0' + minutes;
      }

      dateValue = hours + ':' + minutes;
    } else if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() - 1 === date.getDate()
    ) {
      dateValue = 'Yesterday';
    } else if (now.getFullYear() === date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()];
    } else {
      dateValue = fromFullDate(date);
    }

    return dateValue;
  }

  /**
   * convert date to string
   */
  export function toMsg(now: Date, date: Date): string {
    let dateValue = '';
    const time = fromTime(date);

    if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() === date.getDate()
    ) {
      dateValue = time;
    } else if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() - 1 === date.getDate()
    ) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()] + ' ' + time;
    } else if (now.getFullYear() === date.getFullYear()) {
      dateValue = date.getDate() + ' ' + months[date.getMonth()] + ' ' + time;
    } else {
      dateValue = fromFullDate(date) + ' ' + time;
    }

    return dateValue;
  }

  export function fromFullDate(date: Date): string {
    let day = String(date.getDate());
    if (day.length === 1) {
      day = '0' + day;
    }
    let month = String(date.getMonth() + 1);
    if (month.length === 1) {
      month = '0' + month;
    }
    const year = String(date.getFullYear());

    return day + '/' + month + '/' + year[2] + year[3];
  }

  export function fromTime(date: Date): string {
    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    if (hours.length === 1) {
      hours = '0' + hours;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }

    return hours + ':' + minutes;
  }

  export function formatNameOrAddress(value: string): string {
    return value.length <= 32
      ? `${value}`
      : `${value.substring(0, 11)}...${value.substring(
          value.length - 11,
          value.length,
        )}`;
  }
}

export default StringUtils;

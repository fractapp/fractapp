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

    FractappWalletTitle: 'Fractapp',
    FeeTitle: 'Fee',
    YouSentTitle: 'You sent',
    YouReceivedTitle: 'You received',
    SentTitle: 'Sent',
    ReceivedTitle: 'Received',
    TotalTitle: 'Total',
    UnreadMessagesTitle: 'Unread messages',
    ChooseWalletTitle: 'Choose wallet',

    SearchPlaceholder: 'Search',
    NoResultsTitle: 'No results',

    EnterValidAddressErr: 'Please enter a valid address',
    SendByAddressBtn: 'Send to address',
    NotEnoughBalanceErr: 'Not enough balance',
    EnterAmountTitle: 'Enter amount',
    EnterAddressTitle: 'Enter address',
    ResendTitle: 'Resend',
    ResendText: 'Can be resending after',
    ConfirmBtnTitle: 'Confirm',
    NextBtnTitle: 'Next',
    StartBtnTitle: 'Start',
    CopyBtn: 'Copy',
    ShareBtn: 'Share',
    SendBtn: 'Send',
    ReceiveBtn: 'Receive',
    RestoreBtn: 'Restore',
    WriteOffAccountTitle: 'Write-off account',
    ReceivingAccountTitle: 'Receiving account',

    passCode: {
      verifyDescription: 'Enter passcode',
      newCodeDescription: 'Enter new passcode',
      confirmNewCodeDescription: 'Confirm new passcode',
    },
    showMsg: {
      walletNotFound: 'Wallet not found',
      passcodeNotEquals: 'Passcodes not equal',
      incorrectPasscode: 'Incorrect passcode',
      addressCopied: 'Address copied',
      copiedToClipboard: 'Copied to clipboard',
      connectionRestored: 'Connection restored',
      invalidConnection: 'Invalid connection',
    },
    statuses: {
      success: 'Success',
      pending: 'Pending',
      failed: 'Failed',
    },
    legal: {
      title: 'Terms & Conditions and Privacy Policy',
      checkbox:
        ' I have read, understood, and agree with the Terms & Conditions and Privacy Policy',
      tos: 'Terms & Conditions',
      privacyPolicy: 'Privacy Policy',
    },
    walletFileBackup: {
      title: 'Backup wallet',
      description:
        'Enter the password to encrypt your wallet. Do not lose your password and file otherwise, you cannot restore access.',
      filenamePlaceholder: 'File name',
      passwordPlaceholder: 'Password',
      confirmPassword: 'Confirm password',
      passLenErr: 'At least 8 characters',
      symbolOrNumberErr: 'Include at least 1 letter and 1 number',
      passNotMatchErr: 'Passwords do not match',
    },
    walletFileImport: {
      title: 'Import wallet',
      passwordPlaceholder: 'Password',
      description: 'Enter the password to decrypt your wallet.',
      invalidPasswordTitle: 'Incorrect password',
    },
    saveSeed: {
      title: 'Your secret phrase',
      description:
        'Write these 12 words down, or copy them to your password manager.',
      info:
        'These 12 words are the keys to your wallet. Back up in a safe place. Do not share this with anyone.',
    },
    confirmSaveSeed: {
      title: 'Verify secret phrase',
      description: 'Put the words in the correct order.',
      incorrectEnteredSeed: 'Incorrectly entered secret phrase',
    },
    importSeed: {
      title: 'Import wallet',
      description: 'Write your secret phrase',
      invalidSecretPhraseErr: 'Incorrect secret phrase',
    },
    importWallet: {
      googleDriveTitle: 'From Google Drive',
      manuallyTitle: 'With recovery phrase',
    },
    backup: {
      title: 'Save a wallet',
      description:
        'Save your wallet in a safe place. If you lose your wallet then you cannot restore access to it. Do not share this with anyone.',
      googleDriveTitle: 'On Google Drive',
      manuallyTitle: 'Back up manually',
    },
    connecting: {
      title: 'Connecting',
      description:
        'Connect to Fractapp and receive cryptocurrency by phone number, email or username',
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
    /*  OpenSettingsForStorageText:
      'If you want to save a file then open the application settings and give it access to the storage.',*/
    OpenSettingsForContactsText:
      'If you want to find users by your contacts then open the system settings and give it access to read your contacts.',

    WaitLoadingTitle: 'Wait loading amount',

    ServiceUnavailableTitle: 'Service unavailable',
    UserHasBeenDeletedTitle: 'The user has been deleted',

    settingWallet: {
      backup: 'I have a wallet',
      create: 'Create a new wallet',
    },
    DifferentAddressTitle: 'The account is registered to a different address',
    DifferentAddressText: '',

    InvalidPhoneNumberTitle: 'Invalid phone number',
    InvalidPhoneNumberText: 'Please validate and write the phone number again',

    InvalidEmailTitle: 'Invalid email',
    InvalidEmailText: 'Please validate and write the email again',

    InvalidNameTitle: 'Invalid name',
    InvalidNameText: 'Please validate and write the name again',

    InvalidUsernameTitle: 'Invalid name',
    InvalidUsernameText: 'Please validate and write the username again',

    UsernameIsExistTitle: 'Username exists',
    UsernameIsExistText: 'Please write a new username',

    FileExistTitle: 'File exists',
    FileExistText: 'Please enter a different file name',

    /*  SuccessSaveWalletTitle: 'Success save wallet',
    SuccessSaveWalletText: (filename: string, folder: string) =>
      `If you lose access to file then you will not be able to restore access to the wallet. File "${filename}.json" saved in "${folder}" directory`,
    */

    MyAddressForShare: (
      currency: Currency,
      address: string,
      userId: string,
    ) => {
      let text = `My address for ${getSymbol(currency)}: ${address}\n\n`;

      if (userId === '') {
        text += `Link for sending via Fractapp: https://fractapp.com/send.html?user=${address}&type=address&currency=${getSymbol(
          currency,
        )}`;
      } else {
        text += `Link for sending via Fractapp: https://fractapp.com/send.html?user=${userId}&type=user&currency=${getSymbol(
          currency,
        )}`;
      }
      return text;
    },

    ConfirmationCodePhoneNumberText:
      'Confirmation code sent to your phone number',
    ConfirmationCodeEmailText: 'Confirmation code sent to your email',

    MinimumTransferErrorTitle: 'Minimum transfer',
    MinimumTransferErrorText: 'The minimum transfer for this recipient is',

    NeedFullBalanceErrTitle: 'Amount',
    NeedFullBalanceErrText: (minBalance: number, currency: Currency) =>
      `Leave more than  ${minBalance} ${getSymbol(
        currency,
      )} on your balance or send the whole balance`,
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

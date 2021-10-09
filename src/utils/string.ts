/**
 * @namespace
 * @category Utils
 */
import {Currency, getSymbol} from 'types/wallet';
import I18n from 'react-native-i18n';

namespace StringUtils {
  export const today = I18n.t('today');
  export const yesterday = I18n.t('yesterday');

  export const months = [
    I18n.t('months.january'),
    I18n.t('months.february'),
    I18n.t('months.march'),
    I18n.t('months.april'),
    I18n.t('months.may'),
    I18n.t('months.june'),
    I18n.t('months.july'),
    I18n.t('months.august'),
    I18n.t('months.september'),
    I18n.t('months.october'),
    I18n.t('months.november'),
    I18n.t('months.december'),
  ];

  export const texts = {
    WelcomeTitle: I18n.t('welcome_title'),
    WelcomeDescription: I18n.t('welcome_description'),
    SynchronizationTitle: I18n.t('synchronization_title'),

    FractappWalletTitle: I18n.t('fractapp_wallet_title'),
    FeeTitle: I18n.t('fee_title'),
    DateTitle: I18n.t('date_title'),
    YouSentTitle: I18n.t('you_sent_title'),
    YouReceivedTitle: I18n.t('you_received_title'),
    SentTitle: I18n.t('sent_title'),
    ReceivedTitle: I18n.t('received_title'),
    TotalTitle: I18n.t('total_title'),
    UnreadMessagesTitle: I18n.t('unread_messages_title'),
    ChooseWalletTitle: I18n.t('choose_wallet_title'),

    SearchPlaceholder: I18n.t('search_placeholder'),
    NoResultsTitle: I18n.t('no_results_title'),
    NoTransactionsTitle: I18n.t('no_transactions_title'),

    EnterValidAddressErr: I18n.t('enter_valid_address_err'),
    SendByAddressBtn: I18n.t('send_by_address_btn'),
    NotEnoughBalanceErr: I18n.t('not_enough_balance_err'),
    EnterAmountTitle: I18n.t('enter_amount_title'),
    EnterAddressTitle: I18n.t('enter_address_title'),
    ResendTitle: I18n.t('resend_title'),
    ResendText: I18n.t('resend_text'),
    ConfirmBtnTitle: I18n.t('confirm_btn_title'),
    NextBtnTitle: I18n.t('next_btn_title'),
    StartBtnTitle: I18n.t('start_btn_title'),
    CopyBtn: I18n.t('copy_btn'),
    ShareBtn: I18n.t('share_btn'),
    SendBtn: I18n.t('send_btn'),
    ReceiveBtn: I18n.t('receive_btn'),
    RestoreBtn: I18n.t('restore_btn'),
    WithdrawBtn: I18n.t('withdraw_btn'),
    InvestBtn: I18n.t('invest_btn'),
    AccountTitle: I18n.t('account_title'),
    WriteOffAccountTitle: I18n.t('write_off_account_title'),
    ReceivingAccountTitle: I18n.t('receiving_account_title'),
    profile: {
      restartBtn: I18n.t('profile.restart_btn'),
      sendBtn: I18n.t('profile.send_btn'),
      deleteBtn: I18n.t('profile.delete_btn'),
      addressesTitle: I18n.t('profile.addresses_title'),
    },
    settings: {
      editProfile: I18n.t('settings.edit_profile'),
      backup: I18n.t('settings.backup'),
      language: I18n.t('settings.language'),
      disablePasscode: I18n.t('settings.disable_passcode'),
      enablePasscode: I18n.t('settings.enable_passcode'),
      disableBiometry: I18n.t('settings.disable_biometry'),
      enableBiometry: I18n.t('settings.enable_biometry'),
      help: I18n.t('settings.help'),
      aboutUs: I18n.t('settings.about_us'),
    },
    titles: {
      language: I18n.t('titles.language'),
      details: I18n.t('titles.details'),
      transaction: I18n.t('titles.transaction'),
      backup: I18n.t('titles.backup'),
      editProfile: I18n.t('titles.edit_profile'),
      confirmCode: I18n.t('titles.confirm_code'),
      selectCountry: I18n.t('titles.select_country'),
      phoneNumber: I18n.t('titles.phone_number'),
      email: I18n.t('titles.email'),
      editUsername: I18n.t('titles.edit_username'),
      editName: I18n.t('titles.edit_name'),
      selectWallet: I18n.t('titles.select_wallet'),
      send: I18n.t('titles.send'),
      enterAmount: I18n.t('titles.enter_amount'),
      receive: I18n.t('titles.receive'),
      settingWallet: I18n.t('titles.setting_wallet'),
      restoreWallet: I18n.t('titles.restore_wallet'),
      statistics: I18n.t('titles.statistics'),
    },
    passCode: {
      verifyDescription: I18n.t('pass_code.verify_description'),
      newCodeDescription: I18n.t('pass_code.new_code_description'),
      confirmNewCodeDescription: I18n.t(
        'pass_code.confirm_new_code_description',
      ),
    },
    showMsg: {
      walletNotFound: I18n.t('show_msg.wallet_not_found'),
      passcodeNotEquals: I18n.t('show_msg.passcode_not_equals'),
      incorrectPasscode: I18n.t('show_msg.incorrect_passcode'),
      addressCopied: I18n.t('show_msg.address_copied'),
      copiedToClipboard: I18n.t('show_msg.copied_to_clipboard'),
      connectionRestored: I18n.t('show_msg.connection_restored'),
      invalidConnection: I18n.t('show_msg.invalid_connection'),
    },
    menu: {
      chats: I18n.t('menu.chats'),
      wallet: I18n.t('menu.wallet'),
      profile: I18n.t('menu.profile'),
    },
    statuses: {
      success: I18n.t('statuses.success'),
      pending: I18n.t('statuses.pending'),
      failed: I18n.t('statuses.failed'),
    },
    legal: {
      title: I18n.t('legal.title'),
      checkbox: I18n.t('legal.checkbox'),
      tos: I18n.t('legal.tos'),
      privacyPolicy: I18n.t('legal.privacy_policy'),
    },
    walletFileBackup: {
      title: I18n.t('wallet_file_backup.title'),
      description: I18n.t('wallet_file_backup.description'),
      filenamePlaceholder: I18n.t('wallet_file_backup.filename_placeholder'),
      passwordPlaceholder: I18n.t('wallet_file_backup.password_placeholder'),
      confirmPassword: I18n.t('wallet_file_backup.confirm_password'),
      passLenErr: I18n.t('wallet_file_backup.pass_len_err'),
      symbolOrNumberErr: I18n.t('wallet_file_backup.symbol_or_number_err'),
      passNotMatchErr: I18n.t('wallet_file_backup.pass_not_match_err'),
    },
    walletFileImport: {
      title: I18n.t('wallet_file_import.title'),
      passwordPlaceholder: I18n.t('wallet_file_import.password_placeholder'),
      description: I18n.t('wallet_file_import.description'),
      invalidPasswordTitle: I18n.t('wallet_file_import.invalid_password_title'),
    },
    saveSeed: {
      title: I18n.t('save_seed.title'),
      description: I18n.t('save_seed.description'),
      info: I18n.t('save_seed.info'),
    },
    confirmSaveSeed: {
      title: I18n.t('confirm_save_seed.title'),
      description: I18n.t('confirm_save_seed.description'),
      incorrectEnteredSeed: I18n.t('confirm_save_seed.incorrect_entered_seed'),
    },
    importSeed: {
      title: I18n.t('import_seed.title'),
      description: I18n.t('import_seed.description'),
      invalidSecretPhraseErr: I18n.t('import_seed.invalid_secret_phrase_err'),
    },
    importWallet: {
      googleDriveTitle: I18n.t('import_wallet.google_drive_title'),
      manuallyTitle: I18n.t('import_wallet.manually_title'),
    },
    backup: {
      title: I18n.t('backup.title'),
      description: I18n.t('backup.description'),
      googleDriveTitle: I18n.t('backup.google_drive_title'),
      manuallyTitle: I18n.t('backup.manually_title'),
    },
    connecting: {
      title: I18n.t('connecting.title'),
      description: I18n.t('connecting.description'),
      phone: I18n.t('connecting.phone'),
      email: I18n.t('connecting.email'),
    },
    edit: {
      email: I18n.t('edit.email'),
      name: I18n.t('edit.name'),
      username: I18n.t('edit.username'),

      phoneTitle: I18n.t('edit.phone_title'),
      countryTitle: I18n.t('edit.country_title'),
      invalidPhoneNumber: I18n.t('edit.invalid_phone_number'),

      profile: {
        nameTitle: I18n.t('edit.profile.name_title'),
        usernameTitle: I18n.t('edit.profile.username_title'),
        phoneTitle: I18n.t('edit.profile.phone_title'),
        emailTitle: I18n.t('edit.profile.email_title'),

        namePlaceholder: I18n.t('edit.profile.name_placeholder'),
        usernamePlaceholder: I18n.t('edit.profile.username_placeholder'),
        phonePlaceholder: I18n.t('edit.profile.phone_placeholder'),
        emailPlaceholder: I18n.t('edit.profile.email_placeholder'),
      },
    },

    YourBalanceTitle: I18n.t('your_balance_title'),
    OpenSettingsTitle: I18n.t('open_settings_title'),
    OpenSettingsForContactsText: I18n.t('open_settings_for_contacts_text'),
    WaitLoadingTitle: I18n.t('wait_loading_title'),
    ServiceUnavailableTitle: I18n.t('service_unavailable_title'),
    UserHasBeenDeletedTitle: I18n.t('user_has_been_deleted_title'),

    settingWallet: {
      import: I18n.t('setting_wallet.import'),
      create: I18n.t('setting_wallet.create'),
    },
    DifferentAddressTitle: I18n.t('different_address_title'),
    InvalidPhoneNumberTitle: I18n.t('invalid_phone_number_title'),
    InvalidPhoneNumberText: I18n.t('invalid_phone_number_text'),

    InvalidEmailTitle: I18n.t('invalid_email_title'),
    InvalidEmailText: I18n.t('invalid_email_text'),

    InvalidNameTitle: I18n.t('invalid_name_title'),
    InvalidNameText: I18n.t('invalid_name_text'),

    InvalidUsernameTitle: I18n.t('invalid_username_title'),
    InvalidUsernameText: I18n.t('invalid_username_text'),

    UsernameIsExistTitle: I18n.t('username_is_exist_title'),
    UsernameIsExistText: I18n.t('username_is_exist_text'),

    FileExistTitle: I18n.t('file_exist_title'),
    FileExistText: I18n.t('file_exist_text'),

    ConfirmationCodePhoneNumberText: I18n.t(
      'confirmation_code_phone_number_text',
    ),
    ConfirmationCodeEmailText: I18n.t('confirmation_code_email_text'),

    MinimumTransferErrorTitle: I18n.t('minimum_transfer_error_title'),
    MinimumTransferErrorText: I18n.t('minimum_transfer_error_text'),

    NeedFullBalanceErrTitle: I18n.t('need_full_balance_err_title'),

    NeedFullBalanceErrText: (minBalance: number, currency: Currency, isStakingBalanceEmpty: boolean) => {
      return isStakingBalanceEmpty ? `${I18n.t(
        'need_full_balance_err_text_part_one',
      )} ${minBalance} ${getSymbol(currency)} ${I18n.t(
        'need_full_balance_err_text_part_two',
      )}` : `${I18n.t(
        'need_withdraw_staking_err_text_part_one',
      )} ${minBalance} ${getSymbol(currency)} ${I18n.t(
        'need_withdraw_staking_err_text_part_two',
      )}`;
    },

    MyAddressForShare: (
      currency: Currency,
      address: string,
      userId: string,
    ) => {
      let text = `${I18n.t('share_text')} ${getSymbol(
        currency,
      )}: ${address}\n\n`;

      if (userId === '') {
        text += `${I18n.t(
          'share_link',
        )}: https://send.fractapp.com/send.html?user=${address}&type=address&currency=${getSymbol(
          currency,
        )}`;
      } else {
        text += `${I18n.t(
          'share_link',
        )}: https://send.fractapp.com/send.html?user=${userId}&type=user&currency=${getSymbol(
          currency,
        )}`;
      }
      return text;
    },
  };

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
      dateValue = today;
    } else if (
      now.getFullYear() === date.getFullYear() &&
      now.getMonth() === date.getMonth() &&
      now.getDate() - 1 === date.getDate()
    ) {
      dateValue = yesterday;
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
  export function forMsg(date: Date): string {
    let dateValue = '';

    let hours = String(date.getHours());
    let minutes = String(date.getMinutes());
    if (hours.length === 1) {
      hours = '0' + hours;
    }
    if (minutes.length === 1) {
      minutes = '0' + minutes;
    }

    dateValue = hours + ':' + minutes;

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
      dateValue = yesterday;
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

  export function objectToMap(obj: any) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  }
}

export default StringUtils;

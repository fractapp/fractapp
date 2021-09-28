import { ImageSourcePropType } from 'react-native';
import { AccountType, Network } from 'types/account';
import { Transaction, TxAction } from 'types/transaction';

/**
 * @category Models
 */
export enum Currency {
  DOT = 0,
  KSM,
}


/**
 * get network by currency
 * @category Models
 */

export function getNetwork(currency: Currency): Network {
  switch (currency) {
    case Currency.DOT:
      return Network.Polkadot;
    case Currency.KSM:
      return Network.Kusama;
    default:
      return Network.Polkadot;
  }
}


/**
 * get logo for wallet
 * @category Models
 */

export function getFullCurrencyName(currency: Currency) {
  let name = '';
  switch (currency) {
    case Currency.DOT:
      name = 'Polkadot';
      break;
    case Currency.KSM:
      name = 'Kusama';
      break;
    default:
      throw new Error('invalid currency');
  }
  return name;
}

export function getColor(currency: Currency) {
  let color = '';
  switch (currency) {
    case Currency.DOT:
      color = '#E6007A';
      break;
    case Currency.KSM:
      color = '#434C74';
      break;
    default:
      throw new Error('invalid currency');
  }
  return color;
}

export function getLogo(currency: Currency) {
  let logo: ImageSourcePropType;
  switch (currency) {
    case Currency.DOT:
      logo = require('assets/img/dot.png');
      break;
    case Currency.KSM:
      logo = require('assets/img/kusama.png');
      break;
    default:
      throw new Error('invalid currency');
  }
  return logo;
}

/**
 * check logo without border
 * @category Models
 */
export function withoutBorder(currency: Currency): boolean {
  return currency === Currency.DOT || currency === Currency.KSM;
}

/**
 * get symbol for wallet
 * @category Models
 */
export function getSymbol(currency: Currency) {
  let symbol = '';
  switch (currency) {
    case Currency.DOT:
      symbol = 'DOT';
      break;
    case Currency.KSM:
      symbol = 'KSM';
      break;
    default:
      throw new Error('invalid currency');
  }
  return symbol;
}

/**
 * string to currency
 * @category Models
 */
export function toCurrency(currency: string): Currency {
  switch (currency) {
    case 'DOT':
      return Currency.DOT;
    case 'KSM':
      return Currency.KSM;
    default:
      throw new Error('invalid currency');
  }
}


/**
 * currency to string
 * @category Models
 */
export function fromCurrency(currency: Currency): string {
  switch (currency) {
    case Currency.DOT:
      return 'DOT';
    case Currency.KSM:
      return 'KSM';
    default:
      throw new Error('invalid currency');
  }
}

/**
 * filter Tx by wallet
 * @category Models
 */
export function filterTxsByAccountType(txs: Array<Transaction>, action: AccountType): Array<Transaction>  {
  switch (action) {
    case AccountType.Main:
      return txs.filter((tx) => tx.action === TxAction.Transfer || tx.action === TxAction.Staking || tx.action === TxAction.StakingWithdrawn);
    case AccountType.Staking:
      return txs.filter((tx) => tx.action === TxAction.Staking || tx.action === TxAction.StakingWithdrawn || tx.action === TxAction.StakingReward);
    default:
      throw new Error('invalid action type');
  }
}

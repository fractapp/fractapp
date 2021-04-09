import {Network} from 'types/account';
import BN from 'bn.js';
import GlobalStore from 'storage/Global';
// @ts-ignore
import {DEFAULT_KUSAMA_URL, DEFAULT_POLKADOT_URL} from '@env';
import {SubstrateAdaptor} from './substrate';

export enum ErrorCode {
  None,
  ServiceUnavailable,
  MinBalance,
  InvalidAmount,
}
export type TransferValidation = {
  isOk: boolean;
  errorCode: ErrorCode;
  errorTitle: string;
  errorMsg: string;
};

export interface IAdaptor {
  viewDecimals: number;
  network: Network;
  decimals: number;

  init(): Promise<void>;
  balance(address: string): Promise<BN>;
  calculateFee(currencyValue: number, receiver: string): Promise<BN>;
  send(receiver: string, value: BN): Promise<string>;
  isValidTransfer(
    sender: string,
    receiver: string,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation>;
}

export class Adaptors {
  private static adaptors: Map<Network, IAdaptor>;
  public static init(globalContext: GlobalStore.ContextType) {
    let polkadotUrl = '';
    if (globalContext.state.urls.has(Network.Polkadot)) {
      polkadotUrl = globalContext.state.urls.get(Network.Polkadot)!;
    } else {
      polkadotUrl = DEFAULT_POLKADOT_URL;
    }

    const polkadotAdaptor = new SubstrateAdaptor(polkadotUrl, Network.Polkadot);
    this.adaptors.set(Network.Polkadot, polkadotAdaptor);

    let kusamaUrl = '';
    if (globalContext.state.urls.has(Network.Kusama)) {
      kusamaUrl = globalContext.state.urls.get(Network.Kusama)!;
    } else {
      kusamaUrl = DEFAULT_KUSAMA_URL;
    }
    const kusamaAdaptor = new SubstrateAdaptor(kusamaUrl, Network.Kusama);
    this.adaptors.set(Network.Kusama, kusamaAdaptor);
  }

  public static get(network: Network): IAdaptor {
    return this.adaptors.get(network)!;
  }
}

import {Network} from 'types/account';
import BN from 'bn.js';

// @ts-ignore
import {DEFAULT_KUSAMA_URL, DEFAULT_POLKADOT_URL} from '@env';
import {SubstrateAdaptor} from './substrate';
import ServerInfoStore from 'storage/ServerInfo';

export enum ErrorCode {
  None,
  ServiceUnavailable,
  MinBalance,
  NeedFullBalance,
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
  calculateFee(value: BN, receiver: string): Promise<BN>;
  send(receiver: string, value: BN): Promise<string>;
  isValidTransfer(
    sender: string,
    receiver: string,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation>;
}

export class Adaptors {
  private static adaptors: Map<Network, IAdaptor> = new Map<
    Network,
    IAdaptor
  >();
  public static init(serverInfoStore: ServerInfoStore.State) {
    let polkadotUrl = '';
    if (serverInfoStore.urls[Network.Polkadot]) {
      polkadotUrl = serverInfoStore.urls[Network.Polkadot]!;
    } else {
      polkadotUrl = DEFAULT_POLKADOT_URL;
    }

    const polkadotAdaptor = new SubstrateAdaptor(polkadotUrl, Network.Polkadot);
    this.adaptors.set(Network.Polkadot, polkadotAdaptor);

    let kusamaUrl = '';
    if (serverInfoStore.urls[Network.Kusama]) {
      kusamaUrl = serverInfoStore.urls[Network.Kusama]!;
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

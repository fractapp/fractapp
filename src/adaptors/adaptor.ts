import {Network} from 'types/account';
import BN from 'bn.js';
import {SubstrateAdaptor} from './substrate';

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

  balance(address: string): Promise<BN>;
  calculateFee(sender: string, value: BN, receiver: string): Promise<BN>;
  send(receiver: string, value: BN): Promise<string>;
  isValidTransfer(
    sender: string,
    receiver: string,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation>;
}

export class Adaptors {
  private static adaptors: Map<Network, IAdaptor> = new Map<Network,
    IAdaptor>();

  public static init() {
    const polkadotAdaptor = new SubstrateAdaptor(Network.Polkadot);
    this.adaptors.set(Network.Polkadot, polkadotAdaptor);

    const kusamaAdaptor = new SubstrateAdaptor(Network.Kusama);
    this.adaptors.set(Network.Kusama, kusamaAdaptor);
  }

  public static get(network: Network): IAdaptor {
    return this.adaptors.get(network)!;
  }
}

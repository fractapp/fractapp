import { Account, BalanceRs, Network } from 'types/account';
import BN from 'bn.js';
import { SubstrateAdaptor } from './substrate';
import { Profile } from 'types/profile';
import { ConfirmTxInfo } from 'types/inputs';
import { SubstrateBase } from 'types/serverInfo';
import backend from 'utils/fractappClient';
import { getRegistry } from '@substrate/txwrapper-polkadot';
import { TxAction } from 'types/transaction';
import { BroadcastArgs } from 'types/message';

export enum ErrorCode {
  None,
  ServiceUnavailable,
  MinBalance,
  NeedFullBalance,
  NotEnoughBalanceErr
}

export type TransferValidationArgs = {
  receiver: string
};

export type BotValidationArgs = {
  limit: BN | null
};

export type TxValidationResult = {
  isOk: boolean;
  errorCode: ErrorCode;
  errorTitle: string;
  errorMsg: string;
};

export interface IAdaptor {
  viewDecimals: number;
  network: Network;
  decimals: number;

  balance(address: string): Promise<BalanceRs>;
  calculateTransferFee(
    sender: string,
    value: BN,
    receiver: string
  ): Promise<BN | undefined>;
  send(receiver: string, value: BN, sendFull: boolean): Promise<string>;
  broadcast(unsignedTx: any): Promise<string>;
  isTxValid(
    sender: string,
    action: TxAction | null,
    args: TransferValidationArgs | BotValidationArgs,
    value: BN,
    fee: BN,
  ): Promise<TxValidationResult>;
  parseTx(creator: Profile, sender: Account, msgId: string, args: BroadcastArgs, unsignedTx: any, price: number): Promise<ConfirmTxInfo>
}

export class Adaptors {
  private static adaptors: Map<Network, IAdaptor> = new Map<Network,
    IAdaptor>();

  public static init(): Promise<void> {
    return (async () => {
      const polkadotTxBasePromise = this.getSubstrateBase(Network.Polkadot);
      const kusamaTxBasePromise = this.getSubstrateBase(Network.Kusama);

      const polkadotAdaptor = new SubstrateAdaptor(Network.Polkadot, await polkadotTxBasePromise);
      this.adaptors.set(Network.Polkadot, polkadotAdaptor);

      const kusamaAdaptor = new SubstrateAdaptor(Network.Kusama, await kusamaTxBasePromise);
      this.adaptors.set(Network.Kusama, kusamaAdaptor);
    })();
  }

  public static async getSubstrateBase(network: Network): Promise<SubstrateBase> {
    console.log('get http substrate base: ' + new Date());
    const substrateBase: SubstrateBase | null = await backend.getSubstrateBase(network);
    if (substrateBase == null) {
      throw new Error('invalid tx base loading');
    }
    console.log('end http get substrate base: ' + new Date());

    return {
      genesisHash: substrateBase.genesisHash,
      metadata: substrateBase.metadata,
      specVersion: substrateBase.specVersion,
      transactionVersion: substrateBase.transactionVersion,
    };
  }

  public static get(network: Network): IAdaptor | undefined {
    return this.adaptors.get(network)!;
  }
}

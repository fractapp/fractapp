import { Account, Network } from 'types/account';
import BN from 'bn.js';
import { SubstrateAdaptor } from './substrate';
import { Profile } from 'types/profile';
import { ConfirmTxInfo } from 'types/inputs';
import { SubstrateBase, SubstrateTxBase } from 'types/serverInfo';
import backend from 'utils/api';
import { getRegistry } from '@substrate/txwrapper-polkadot';
import { Currency } from 'types/wallet';

export enum ErrorCode {
  None,
  ServiceUnavailable,
  MinBalance,
  NeedFullBalance,
  NotEnoughBalanceErr
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
  calculateTransferFee(
    sender: string,
    value: BN,
    receiver: string
  ): Promise<BN | undefined>;
  send(receiver: string, value: BN, sendFull: boolean): Promise<string>;
  isTxValid(
    sender: string,
    receiver: string | null,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation>;
  parseTx(creator: Profile, sender: Account, unsignedTx: any): Promise<ConfirmTxInfo>
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

  private static async getSubstrateBase(network: Network): Promise<SubstrateBase> {
    const substrateBase: SubstrateBase | null = await backend.getSubstrateBase(network);
    if (substrateBase == null) {
      throw new Error('invalid tx base loading');
    }

    const registry = getRegistry({
      chainName: network === Network.Polkadot ? 'Polkadot' : 'Kusama',
      specName: network == Network.Polkadot ? 'polkadot' : 'kusama',
      specVersion: substrateBase.specVersion,
      metadataRpc: substrateBase.metadata,
    });

    return {
      genesisHash: substrateBase.genesisHash,
      metadata: substrateBase.metadata,
      specVersion: substrateBase.specVersion,
      transactionVersion: substrateBase.transactionVersion,
      registry: registry,
    };
  }

  public static get(network: Network): IAdaptor | undefined {
    return this.adaptors.get(network)!;
  }
}

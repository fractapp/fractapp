import BN from 'bn.js';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {ErrorCode, IAdaptor, TransferValidation} from './adaptor';
import {Network} from 'types/account';
import math from 'utils/math';
import {Currency, getSymbol} from 'types/wallet';
import backend from 'utils/backend';
import StringUtils from 'utils/string';
import {KeyringPair} from '@polkadot/keyring/types';
import {
  construct,
  createMetadata,
  getRegistry,
  methods,
  OptionsWithMeta,
} from '@substrate/txwrapper-polkadot';
import {EXTRINSIC_VERSION} from '@polkadot/types/extrinsic/v4/Extrinsic';
import {SubstrateTxBase} from 'types/serverInfo';

export class SubstrateAdaptor implements IAdaptor {
  public readonly viewDecimals: number;
  public readonly network: Network;
  public readonly decimals: number;

  public readonly currency: Currency;
  private readonly minTransfer: BN;

  public constructor(network: Network) {
    this.network = network;

    switch (this.network) {
      case Network.Polkadot:
        this.viewDecimals = 3;
        this.decimals = 10;
        this.minTransfer = math.convertToPlanck('1', this.decimals);
        this.currency = Currency.DOT;
        break;
      case Network.Kusama:
        this.viewDecimals = 4;
        this.decimals = 12;
        this.minTransfer = math.convertToPlanck('0.002', this.decimals);
        this.currency = Currency.KSM;
        break;
    }
  }

  private sign(
    pair: KeyringPair,
    signingPayload: string,
    options: OptionsWithMeta,
  ): string {
    const {registry, metadataRpc} = options;
    registry.setMetadata(createMetadata(registry, metadataRpc));

    const {signature} = registry
      .createType('ExtrinsicPayload', signingPayload, {
        version: EXTRINSIC_VERSION,
      })
      .sign(pair);

    return signature;
  }

  private async createTx(
    account: KeyringPair,
    value: BN,
    receiver: string,
  ): Promise<string> {
    const txBase: SubstrateTxBase | null = await backend.getSubstrateTxBase(
      account.address,
      receiver,
      value.toString(),
      this.currency,
    );
    if (txBase == null) {
      throw new Error('invalid tx base loading');
    }

    const registry = getRegistry({
      chainName: this.network === Network.Polkadot ? 'Polkadot' : 'Kusama',
      specName: this.network === Network.Polkadot ? 'polkadot' : 'kusama',
      specVersion: txBase.specVersion,
      metadataRpc: txBase.metadata,
    });

    const unsigned = methods.balances.transfer(
      {
        value: value.toString(10),
        dest: receiver,
      },
      {
        address: account.address,
        blockHash: txBase.blockHash,
        blockNumber: registry
          .createType('BlockNumber', txBase.blockNumber)
          .toNumber(),
        eraPeriod: 10,
        genesisHash: txBase.genesisHash,
        metadataRpc: txBase.metadata,
        nonce: txBase.nonce,
        specVersion: txBase.specVersion,
        tip: 0,
        transactionVersion: txBase.transactionVersion,
      },
      {
        metadataRpc: txBase.metadata,
        registry,
      },
    );

    const signature = this.sign(
      account,
      construct.signingPayload(unsigned, {registry}),
      {
        metadataRpc: txBase.metadata,
        registry,
      },
    );

    return construct.signedTx(unsigned, signature, {
      metadataRpc: txBase.metadata,
      registry,
    });
  }

  private async getAccount(): Promise<KeyringPair> {
    const seed = (await DB.getSeed())!;

    let account;
    switch (this.network) {
      case Network.Polkadot:
        account = new Keyring({type: 'sr25519'}).addFromUri(seed);
        break;
      case Network.Kusama:
        account = new Keyring({
          type: 'sr25519',
          ss58Format: 2,
        }).addFromUri(seed);
    }

    return account;
  }

  public async balance(address: string): Promise<BN> {
    return (await backend.substrateBalance(address, this.currency))!;
  }

  public async calculateFee(
    sender: string,
    value: BN,
    receiver: string,
  ): Promise<BN> {
    const info = await backend.calculateSubstrateFee(
      sender,
      receiver,
      value.toString(),
      this.currency,
    );
    return new BN(info?.fee ?? 0);
  }

  public async send(receiver: string, value: BN): Promise<string> {
    const account = await this.getAccount();
    const hexTx = await this.createTx(account, value, receiver);
    const hash = await backend.broadcastSubstrateTx(hexTx, this.currency);
    if (hash == null) {
      throw new Error('invalid send tx');
    }
    return hash;
  }

  public async isValidTransfer(
    sender: string,
    receiver: string,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation> {
    const balanceReceiver = await this.balance(receiver);
    const balanceSender = await this.balance(sender);
    if (balanceReceiver == null || balanceSender == null) {
      return {
        isOk: false,
        errorCode: ErrorCode.ServiceUnavailable,
        errorTitle: 'Service unavailable',
        errorMsg: 'Try again',
      };
    }

    if (new BN(balanceReceiver).add(value).cmp(this.minTransfer) < 0) {
      return {
        isOk: false,
        errorCode: ErrorCode.MinBalance,
        errorTitle: StringUtils.texts.MinimumTransferErrorTitle,
        errorMsg:
          StringUtils.texts.MinimumTransferErrorText +
          ` ${math.convertFromPlanckToViewDecimals(
            this.minTransfer,
            this.decimals,
            this.viewDecimals,
          )} ${getSymbol(this.currency)}`,
      };
    }

    const balanceAfterBalance = balanceSender?.sub(value).sub(fee);
    if (
      balanceAfterBalance.cmp(this.minTransfer) < 0 &&
      balanceAfterBalance.cmp(new BN(0)) !== 0
    ) {
      return {
        isOk: false,
        errorCode: ErrorCode.NeedFullBalance,
        errorTitle: StringUtils.texts.NeedFullBalanceErrTitle,
        errorMsg: StringUtils.texts.NeedFullBalanceErrText(
          math.convertFromPlanckToViewDecimals(
            this.minTransfer,
            this.decimals,
            this.viewDecimals,
          ),
          this.currency,
        ),
      };
    }

    return {
      isOk: true,
      errorCode: ErrorCode.None,
      errorTitle: '',
      errorMsg: '',
    };
  }
}

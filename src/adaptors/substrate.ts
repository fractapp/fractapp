import BN from 'bn.js';
import DB from 'storage/DB';
import { Keyring } from '@polkadot/keyring';
import { ErrorCode, IAdaptor, TransferValidation } from './adaptor';
import { Account, Network } from 'types/account';
import math from 'utils/math';
import { Currency, getSymbol } from 'types/wallet';
import backend from 'utils/api';
import StringUtils from 'utils/string';
import { KeyringPair } from '@polkadot/keyring/types';
import { construct, createMetadata, methods, OptionsWithMeta } from '@substrate/txwrapper-polkadot';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { ConfirmTxInfo, TxActionType } from 'types/inputs';
import { Profile } from 'types/profile';
import { decode } from '@substrate/txwrapper-polkadot';
import { SubstrateBase } from 'types/serverInfo';
import api from 'utils/api';

export class SubstrateAdaptor implements IAdaptor {
  public readonly viewDecimals: number;
  public readonly network: Network;
  public readonly decimals: number;
  private readonly substrateBase: SubstrateBase;

  public readonly currency: Currency;
  private readonly minTransfer: BN;

  public constructor(network: Network, substrateBase: SubstrateBase) {
    this.network = network;
    this.substrateBase = substrateBase;
    switch (this.network) {
      case Network.Polkadot:
        this.viewDecimals = 3;
        this.decimals = 10;
        this.minTransfer = math.convertToPlanck('1', this.decimals); //TODO
        this.currency = Currency.DOT;
        break;
      case Network.Kusama:
        this.viewDecimals = 4;
        this.decimals = 12;
        this.minTransfer = math.convertToPlanck('0.002', this.decimals); //TODO
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

  private async createTransferTx(
    account: KeyringPair,
    value: BN,
    receiver: string,
    sendFull: boolean
  ): Promise<string> {
    const opt = {
      metadataRpc: this.substrateBase.metadata,
      registry: this.substrateBase.registry,
    };

    const txBase = await api.getSubstrateTxBase(account.address, this.network);
    if (txBase == null) {
      throw new Error('invalid tx base');
    }

    console.log('txBase: ' + JSON.stringify(txBase));

    const txArgs = {
      address: account.address,
      blockHash: txBase.blockHash,
      blockNumber: this.substrateBase.registry
        .createType('BlockNumber', txBase.blockNumber)
        .toNumber(),
      eraPeriod: 10,
      genesisHash: this.substrateBase.genesisHash,
      metadataRpc: this.substrateBase.metadata,
      nonce: txBase.nonce,
      specVersion: this.substrateBase.specVersion,
      tip: 0,
      transactionVersion: this.substrateBase.transactionVersion,
    };
    const transferValue = {
      value: value.toString(10),
      dest: receiver,
    };

    let unsigned;
    if (sendFull) {
      unsigned = methods.balances.transfer(transferValue, txArgs, opt);
    } else {
      unsigned = methods.balances.transferKeepAlive(transferValue, txArgs, opt);
    }

    const signature = this.sign(
      account,
      construct.signingPayload(unsigned, { registry: this.substrateBase.registry }),
      opt
    );

    return construct.signedTx(unsigned, signature, opt);
  }

  private async getAccount(): Promise<KeyringPair> {
    const seed = (await DB.getSeed())!;

    let account;
    switch (this.network) {
      case Network.Polkadot:
        account = new Keyring({
          type: 'sr25519',
          ss58Format: 0,
        }).addFromUri(seed);
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

  public async calculateTransferFee(
    sender: string,
    value: BN,
    receiver: string
  ): Promise<BN | undefined> {
    const hexTx = await this.createTransferTx(new Keyring().addFromUri('fake'), value, receiver, false /*TODO: with locked balance*/ );
    const info = await backend.calculateSubstrateFee(hexTx, this.network);
    return info == null ? undefined : new BN(info?.fee);
  }

  public async send(receiver: string, value: BN, sendFull: boolean /*TODO: with locked balance*/): Promise<string> {
    const account = await this.getAccount();
    const hexTx = await this.createTransferTx(account, value, receiver, sendFull);
    const hash = await backend.broadcastSubstrateTx(hexTx, this.network);
    if (hash == null) {
      throw new Error('invalid send tx');
    }
    return hash;
  }

  public async isTxValid(
    sender: string,
    receiver: string | null,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation> {
    //TODO: check locked balance
    //TODO: action (staking not check min balance)
    const balanceReceiver = receiver == null ? 0 : await this.balance(receiver);
    const balanceSender = await this.balance(sender);
    if (balanceReceiver == null || balanceSender == null) {
      return {
        isOk: false,
        errorCode: ErrorCode.ServiceUnavailable,
        errorTitle: 'Service unavailable',
        errorMsg: 'Try again',
      };
    }

    if (balanceSender.cmp(value.add(fee)) < 0) {
      return {
        isOk: false,
        errorCode: ErrorCode.NotEnoughBalanceErr,
        errorTitle: '',
        errorMsg: StringUtils.texts.NotEnoughBalanceErr,
      };
    }

    console.log('receiver: ' + receiver);
    if (receiver != null) {
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

    }

    return {
      isOk: true,
      errorCode: ErrorCode.None,
      errorTitle: '',
      errorMsg: '',
    };
  }

  public async parseTx(creator: Profile, sender: Account, unsignedTx: any): Promise<ConfirmTxInfo> {
    console.log('test load: ' + new Date());
    const opt = {
      metadataRpc: this.substrateBase.metadata,
      registry: this.substrateBase.registry,
    };
    const txInfo = decode(unsignedTx, opt);

    const signature = this.sign(
      new Keyring().addFromUri('fake'),
      construct.signingPayload(unsignedTx, { registry: this.substrateBase.registry }),
      opt
    );
    const tx = construct.signedTx(unsignedTx, signature, opt);
    const feeInfo = await backend.calculateSubstrateFee(tx, this.network);
    if (feeInfo == null) {
      throw new Error('fee is undefined');
    }
    console.log('test load end: ' + new Date());

    console.log(txInfo.method.args.value);
    console.log(txInfo.method.name);
    switch (txInfo.method.name) {
      case 'transfer':
      case 'transferKeepAlive':
        const value = new BN(String(txInfo.method.args.value));
        const transferValidation = await this.isTxValid(
          sender.address,
          null, //TODO
          value,
          new BN(feeInfo.fee),
        );
        return {
          action: TxActionType.Donate,
          planksValue: value.toString(),
          creator: creator,
          sender: sender,
          planksFee: new BN(String(txInfo.tip)).add(new BN(feeInfo.fee)).toString(),
          warningText: 'На данный момент вы совершаете пожертвование. Убедитесь, что вы хотите совершить пожертвование.', //TODO: go to string
          errorText: transferValidation.isOk ? null : transferValidation.errorMsg,
        };
      case 'batchAll':
        break;
    }

    throw new Error('undefined transaction type');
  }
}

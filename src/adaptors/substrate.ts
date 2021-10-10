import BN from 'bn.js';
import DB from 'storage/DB';
import { Keyring } from '@polkadot/keyring';
import { BotValidationArgs, ErrorCode, IAdaptor, TransferValidationArgs, TxValidationResult } from './adaptor';
import { Account, BalanceRs, Network } from 'types/account';
import math from 'utils/math';
import MathUtils from 'utils/math';
import { Currency, getSymbol } from 'types/wallet';
import backend from 'utils/api';
import api from 'utils/api';
import StringUtils from 'utils/string';
import { KeyringPair } from '@polkadot/keyring/types';
import { construct, createMetadata, decode, methods, OptionsWithMeta } from '@substrate/txwrapper-polkadot';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';
import { ConfirmTxInfo } from 'types/inputs';
import { Profile } from 'types/profile';
import { SubstrateBase } from 'types/serverInfo';
import { TxAction, TxStatus, TxType } from 'types/transaction';
import { BroadcastArgs } from 'types/message';

export class SubstrateAdaptor implements IAdaptor {
  public readonly viewDecimals: number;
  public readonly network: Network;
  public readonly decimals: number;
  private substrateBase: SubstrateBase;

  public readonly currency: Currency;
  private readonly minTransfer: BN;

  public constructor(network: Network, substrateBase: SubstrateBase) {
    this.network = network;
    this.substrateBase = substrateBase;
    switch (this.network) {
      case Network.Polkadot:
        this.viewDecimals = 4;
        this.decimals = 10;
        this.minTransfer = math.convertToPlanck('1', this.decimals); //TODO: next release
        this.currency = Currency.DOT;
        break;
      case Network.Kusama:
        this.viewDecimals = 5;
        this.decimals = 12;
        this.minTransfer = math.convertToPlanck('0.002', this.decimals); //TODO: next release
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
      eraPeriod: 128,
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
      console.log('transfer: ' + value.toString(10));
      unsigned = methods.balances.transfer(transferValue, txArgs, opt);
    } else {
      unsigned = methods.balances.transferKeepAlive(transferValue, txArgs, opt);
    }

    console.log('send tx: ' + JSON.stringify(unsigned));
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

  public async balance(address: string): Promise<BalanceRs> {
    return (await backend.substrateBalance(address, this.currency))!;
  }

  public async calculateTransferFee(
    sender: string,
    value: BN,
    receiver: string
  ): Promise<BN | undefined> {
    const info = await backend.calculateSubstrateTransferFee(sender, receiver, value, false, this.network);
    return info == null ? undefined : new BN(info?.fee);
  }

  public async send(receiver: string, value: BN, sendFull: boolean /*TODO: with locked balance*/): Promise<string> {
    const account = await this.getAccount();
    console.log('sendFull: ' + sendFull);
    const hexTx = await this.createTransferTx(account, value, receiver, sendFull);
    const hash = await backend.broadcastSubstrateTx(hexTx, this.network);
    if (hash == null) {
      throw new Error('invalid send tx');
    }
    return hash;
  }

  public async broadcast(unsignedTx: any): Promise<string> {
    const opt = {
      metadataRpc: this.substrateBase.metadata,
      registry: this.substrateBase.registry,
    };
    const signature = this.sign(
      await this.getAccount(),
      construct.signingPayload(unsignedTx, { registry: this.substrateBase.registry }),
      opt
    );
    const hexTx = construct.signedTx(unsignedTx, signature, opt);
    const hash = await backend.broadcastSubstrateTx(hexTx, this.network);
    if (hash == null) {
      throw new Error('invalid send tx');
    }
    return hash;
  }

  public async isTxValid(
    sender: string,
    action: TxAction | null,
    args: TransferValidationArgs | BotValidationArgs,
    value: BN,
    fee: BN,
  ): Promise<TxValidationResult> {
    const balanceSender: BalanceRs = await this.balance(sender);

    switch (action) {
      case TxAction.Transfer:
        const transferArgs = args as TransferValidationArgs;
        const balanceReceiver: BalanceRs = await this.balance(transferArgs.receiver);
        if (balanceReceiver == null || balanceSender == null) {
          return {
            isOk: false,
            errorCode: ErrorCode.ServiceUnavailable,
            errorTitle: 'Service unavailable',
            errorMsg: 'Try again',
          };
        }

        if (value.add(fee).cmp(new BN(balanceSender.transferable)) > 0) {
          return {
            isOk: false,
            errorCode: ErrorCode.NotEnoughBalanceErr,
            errorTitle: '',
            errorMsg: StringUtils.texts.NotEnoughBalanceErr,
          };
        }

        console.log('receiver: ' + transferArgs.receiver);
        if (new BN(balanceReceiver!.total).add(value).cmp(this.minTransfer) < 0) {
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

        const balanceAfterSend = new BN(balanceSender.total).sub(value).sub(fee);
        if (
          balanceAfterSend.cmp(this.minTransfer) < 0 &&
          balanceAfterSend.cmp(new BN(0)) !== 0
        ) {
          const isStakingBalanceEmpty = new BN(balanceSender.staking).cmp(new BN(0)) === 0;
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
              isStakingBalanceEmpty
            ),
          };
        }
        break;
      default:
        const botArgs = args as BotValidationArgs;
        const isLimit = botArgs.limit == null ?
          value.add(fee).cmp(new BN(balanceSender.transferable)) > 0 :
          value.cmp(botArgs.limit) > 0;

        if (isLimit) {
          return {
            isOk: false,
            errorCode: ErrorCode.NotEnoughBalanceErr,
            errorTitle: '',
            errorMsg: StringUtils.texts.NotEnoughBalanceErr,
          };
        }
        break;
    }

    if (fee.cmp(new BN(balanceSender.payableForFee)) > 0 ) {
      return {
        isOk: false,
        errorCode: ErrorCode.NotEnoughBalanceErr,
        errorTitle: '',
        errorMsg: StringUtils.texts.NotEnoughBalanceErr,
      };
    }

    return {
      isOk: true,
      errorCode: ErrorCode.None,
      errorTitle: '',
      errorMsg: '',
    };
  }

  public async parseTx(creator: Profile, sender: Account, msgId: string, args: BroadcastArgs, unsignedTx: any, price: number): Promise<ConfirmTxInfo> {
    const opt = {
      metadataRpc: this.substrateBase.metadata,
      registry: this.substrateBase.registry,
    };

    const txInfo = decode(unsignedTx, opt);

    console.log('test load end: ' + new Date());


    console.log('method name: ' + txInfo.method.name);
    let decodedTx = null;
    switch (txInfo.method.name) {
      case 'unbond':
        console.log(txInfo.method.args);
        if (
          Object.keys(txInfo.method.args).length !== 1 ||
          txInfo.method.args.value === undefined
        ) {
          break;
        }

        decodedTx = {
          value: new BN((<any>txInfo.method.args).value),
          txType: TxType.None,
          action: TxAction.StakingWithdrawn,
        };
        break;
      case 'batchAll':
        const calls: Array<any> = <Array<any>>txInfo.method.args.calls;
        console.log('calls: ' + JSON.stringify(calls));
        if (
          calls.length === 2 &&

          calls[0].args.controller !== undefined &&
          calls[0].args.payee !== undefined &&
          calls[0].args.value !== undefined &&
          Object.keys(calls[0].args).length === 3 &&

          calls[1].args.targets !== undefined &&
          Object.keys(calls[1].args).length === 1
        ) {
          decodedTx = {
            value: new BN(String(calls[0].args.value)),
            txType: TxType.None,
            action: TxAction.StakingOpenDeposit,
          };
        } else if (calls.length >= 1 && calls.length <= 2 &&
          calls[0].args.max_additional !== undefined &&
          Object.keys(calls[0].args).length === 1 &&

          (calls.length === 1 ||
            (
              calls.length === 2 && calls[1].args.targets !== undefined &&
              Object.keys(calls[1].args).length === 1
            )
          )
        ) {
          decodedTx = {
            value: new BN(String(calls[0].args.max_additional)),
            txType: TxType.None,
            action: TxAction.StakingAddAmount,
          };
        } else if (calls.length === 2 && calls[0].callIndex === '0x0606'
          && calls[1].callIndex === '0x0602' &&  calls[1].args.value !== undefined
        ) {
          decodedTx = {
            value: new BN((<any>calls[1].args).value),
            txType: TxType.None,
            action: TxAction.StakingWithdrawn,
          };
        }

        break;
    }

    if (decodedTx == null) {
      throw new Error('undefined transaction type');
    }

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

    const planksFee = new BN(String(txInfo.tip)).add(new BN(feeInfo.fee));
    const transferValidation = await this.isTxValid(
      sender.address,
      null,
      {
        limit: null,
      },
      decodedTx.value,
      new BN(feeInfo.fee)
    );

    const viewValue = math.convertFromPlanckToViewDecimals(
      decodedTx.value,
      this.decimals,
      this.viewDecimals,
    );
    const fee = math.convertFromPlanckToViewDecimals(
      planksFee,
      this.decimals,
      this.viewDecimals,
    );

    return {
      msgId: msgId,
      unsignedTx: unsignedTx,
      tx: {
        id: '',
        hash: '',
        fullValue: math.convertFromPlanckToString(
          decodedTx.value,
          this.decimals
        ),
        userId: creator.id,
        address: creator.addresses![sender.currency],
        currency: sender.currency,
        txType: TxType.None,
        timestamp: Math.round(new Date().getTime()),
        action: decodedTx.action,

        value: viewValue,
        planckValue: decodedTx.value.toString(),
        usdValue: MathUtils.calculateUsdValue(decodedTx.value, this.decimals, price),

        fee: fee,
        planckFee: planksFee.toString(),
        usdFee: MathUtils.calculateUsdValue(planksFee, this.decimals, price),
        status: TxStatus.Pending,
      },
      creator: creator,
      args: args,
      accountCurrency: sender.currency,
      warningText: null,
      errorText: transferValidation.isOk ? null : transferValidation.errorMsg,
    };
  }
}

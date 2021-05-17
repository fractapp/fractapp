import BN from 'bn.js';
import {ApiPromise, WsProvider} from '@polkadot/api';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';
import {ErrorCode, IAdaptor, TransferValidation} from './adaptor';
import {Network} from 'types/account';
import math from 'utils/math';
import {Currency, getSymbol} from 'types/wallet';
import backend from 'utils/backend';
import StringUtils from 'utils/string';

export class SubstrateAdaptor implements IAdaptor {
  public readonly viewDecimals: number;
  public readonly network: Network;
  public readonly decimals: number;

  public readonly currency: Currency;
  private readonly minTransfer: BN;
  private readonly url: string;
  private substrateApi: ApiPromise | null;

  public constructor(url: string, network: Network) {
    this.url = url;
    this.network = network;
    this.substrateApi = null;

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

  public async init(): Promise<void> {
    await this.getSubstrateApi();
  }

  public async balance(address: string): Promise<BN> {
    return (await backend.substrateBalance(address, this.currency))!;
  }

  public async calculateFee(value: BN, receiver: string): Promise<BN> {
    const api = await this.getSubstrateApi();

    const info = await api.tx.balances
      .transfer(receiver, value)
      .paymentInfo(receiver);

    return info.partialFee.toBn();
  }

  public async send(receiver: string, value: BN): Promise<string> {
    const seed = (await DB.getSeed())!;

    let key;
    switch (this.network) {
      case Network.Polkadot:
        key = new Keyring({type: 'sr25519'}).addFromUri(seed);
        break;
      case Network.Kusama:
        key = new Keyring({
          type: 'sr25519',
          ss58Format: 2,
        }).addFromUri(seed);
    }

    const substrateApi = await this.getSubstrateApi();
    const tx = await substrateApi.tx.balances.transfer(receiver, value);
    const hash = await tx.signAndSend(key);

    return hash.toHex();
  }

  public async isValidTransfer(
    sender: string,
    receiver: string,
    value: BN,
    fee: BN,
  ): Promise<TransferValidation> {
    const balanceReceiver = await this.balance(receiver);
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

    const balanceSender = await this.balance(sender);
    if (balanceSender == null) {
      return {
        isOk: false,
        errorCode: ErrorCode.ServiceUnavailable,
        errorTitle: 'Service unavailable',
        errorMsg: 'Try again',
      };
    }

    const balanceAfterBalance = balanceSender?.sub(value).sub(fee);
    if (
      balanceAfterBalance.cmp(this.minTransfer) < 0 &&
      balanceAfterBalance.cmp(new BN(0)) !== 0
    ) {
      const v = math.convertFromPlanckToString(value.sub(fee), this.decimals);
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

  private async getSubstrateApi(): Promise<ApiPromise> {
    if (this.substrateApi == null) {
      const provider = new WsProvider(this.url);
      this.substrateApi = await ApiPromise.create({provider});
    }
    return <ApiPromise>this.substrateApi;
  }
}

import {Currency, getSymbol} from 'models/wallet';
import BN from 'bn.js';
import {Transaction, TxStatus, TxType} from 'models/transaction';
// @ts-ignore
import {
  KUSAMA_SUBSCAN_API,
  KUSAMA_WSS_API,
  POLKADOT_SUBSCAN_API,
  POLKADOT_WSS_API,
} from '@env';
import MathUtils from 'utils/math';
import {ApiPromise, WsProvider} from '@polkadot/api';
import DB from 'storage/DB';
import {Keyring} from '@polkadot/keyring';

export class Api {
  private static instance: Map<Currency, Api>;
  private readonly explorerApiUrl: string;
  private readonly currency: Currency;
  private readonly decimals: number;
  public readonly viewDecimals: number;
  private readonly substrateApiUrl: string;
  private substrateApi: ApiPromise | null;

  public constructor(
    substrateApiUrl: string,
    currency: Currency,
    explorerApiUrl: string,
    decimals: number,
  ) {
    this.currency = currency;
    this.explorerApiUrl = explorerApiUrl;
    this.decimals = decimals;
    this.viewDecimals = 3;
    this.substrateApiUrl = substrateApiUrl;
    this.substrateApi = null;
  }

  public static getInstance(currency: Currency): Promise<Api> {
    if (this.instance == null) {
      this.instance = new Map<Currency, Api>();
    }
    return (async () => {
      if (!this.instance.has(currency)) {
        let explorerApiUrl = '';
        let decimals = 0;
        let apiUrl = '';
        switch (currency) {
          case Currency.Polkadot:
            explorerApiUrl = POLKADOT_SUBSCAN_API;
            apiUrl = POLKADOT_WSS_API;
            decimals = 10;
            break;
          case Currency.Kusama:
            explorerApiUrl = KUSAMA_SUBSCAN_API;
            apiUrl = KUSAMA_WSS_API;
            decimals = 12;
            break;
          default:
            throw 'Invalid currency';
        }

        this.instance.set(
          currency,
          new Api(apiUrl, currency, explorerApiUrl, decimals),
        );
      }

      return <Api>this.instance.get(currency);
    })();
  }

  public async getSubstrateApi(): Promise<ApiPromise> {
    if (this.substrateApi == null) {
      const provider = new WsProvider(this.substrateApiUrl);
      this.substrateApi = await ApiPromise.create({provider});
    }
    return <ApiPromise>this.substrateApi;
  }

  public convertFromPlanckWithViewDecimals(planck: BN): number {
    return (
      planck
        .mul(new BN(1000))
        .div(new BN(10).pow(new BN(this.decimals)))
        .toNumber() / Math.pow(10, this.viewDecimals)
    );
  }
  public convertFromPlanckString(planck: BN): string {
    let value = planck.toString(10);

    const length = value.length;
    if (length < this.decimals) {
      for (let i = 0; i < this.decimals - length; i++) {
        value = '0' + value;
      }
    }

    value =
      value.substr(0, value.length - this.decimals) +
      '.' +
      value.substr(value.length - this.decimals);

    if (value.startsWith('.')) {
      value = '0' + value;
    }

    return value;
  }

  public convertToPlanck(number: string): BN {
    const decimals = String(number).split('.');
    let planks = decimals[0] + (decimals.length === 2 ? decimals[1] : '');
    if (decimals.length === 2 && decimals[1].length < this.decimals) {
      for (let i = 0; i < this.decimals - decimals[1].length; i++) {
        planks += '0';
      }
    } else if (decimals.length === 1) {
      for (let i = 0; i < this.decimals; i++) {
        planks += '0';
      }
    }

    return new BN(planks);
  }

  public async balance(
    address: string,
  ): Promise<[value: number, plankValue: BN] | null> {
    let rs = await fetch(`${this.explorerApiUrl}/scan/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        key: address,
      }),
    });

    if (!rs.ok) {
      return null;
    }
    const result = await rs.json();

    if (result.data === undefined && result.message === 'Success') {
      return [0, new BN(0)];
    }

    return [
      MathUtils.floor(result.data.account.balance, this.viewDecimals),
      this.convertToPlanck(result.data.account.balance),
    ];
  }

  public async getTxStatus(hash: string): Promise<TxStatus | null> {
    let rs = await fetch(`${this.explorerApiUrl}/scan/extrinsic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash: hash,
      }),
    });

    if (!rs.ok) {
      return null;
    }
    const result = await rs.json();
    if (result.data === undefined) {
      return null;
    }

    if (result.data.success === null || result.data.success == undefined) {
      return null;
    }

    return result.data.success ? TxStatus.Success : TxStatus.Fail;
  }
  public async getTransactionsWithoutUSDValue(
    address: string,
    page: number = 0,
    size: number = 25,
  ): Promise<Array<Transaction>> {
    let transactions = new Array<Transaction>();

    try {
      let rs = await fetch(`${this.explorerApiUrl}/scan/transfers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({
          address: address,
          page: page,
          row: size,
        }),
      });
      if (!rs.ok) {
        return [];
      }

      const data = (await rs.json()).data;

      const transfers = data.transfers;
      if (transfers == null || transfers.length === 0) {
        return new Array<Transaction>();
      }
      for (let i = 0; i < transfers.length; i++) {
        const id = transfers[i].hash;

        let txType = 0;
        let member = '';
        if (address === transfers[i].from) {
          txType = TxType.Sent;
          member = transfers[i].to;
        } else {
          txType = TxType.Received;
          member = transfers[i].from;
        }

        transactions.push({
          id: id,
          userId: null,
          address: member,
          currency: this.currency,
          txType: txType,
          timestamp: transfers[i].block_timestamp * 1000,
          value: MathUtils.floor(transfers[i].amount, this.viewDecimals),
          usdValue: 0,
          fee: MathUtils.floor(
            this.convertFromPlanckWithViewDecimals(new BN(transfers[i].fee)),
            this.viewDecimals,
          ),
          usdFee: 0,
          status: transfers[i].success ? TxStatus.Success : TxStatus.Fail,
        });
      }
    } catch (e) {
      console.log(e);
      return transactions;
    }
    return transactions;
  }

  public async updateUSDValueInTransaction(tx: Transaction): Promise<void> {
    try {
      let usdPrice = 0;

      let priceRs = await fetch(`${this.explorerApiUrl}/open/price_converter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          value: 1,
          from: getSymbol(this.currency),
          quote: 'USD',
          time: tx.timestamp / 1000,
        }),
      });
      if (!priceRs.ok) {
        return;
      }

      const json = await priceRs.json();
      usdPrice = json.data.price.price;

      tx.usdValue = MathUtils.floorUsd(tx.value * usdPrice);
      tx.usdFee = MathUtils.floorUsd(tx.fee * usdPrice);
    } catch (e) {
      console.log(e);
      return;
    }
    return;
  }

  public async send(receive: string, value: BN): Promise<string> {
    const seed = (await DB.getSeed())!;

    let key;
    switch (this.currency) {
      case Currency.Polkadot:
        key = new Keyring({type: 'sr25519'}).addFromUri(seed);
        break;
      case Currency.Kusama:
        key = new Keyring({
          type: 'sr25519',
          ss58Format: 2,
        }).addFromUri(seed);
        break;
    }

    const substrateApi = await this.getSubstrateApi();
    const tx = await substrateApi.tx.balances.transferKeepAlive(receive, value);
    return (await tx.signAndSend(key)).toHex();
  }

  public async minTransfer(): Promise<BN> {
    switch (this.currency) {
      case Currency.Polkadot:
        return this.convertToPlanck('1');
      case Currency.Kusama:
        return this.convertToPlanck('0.002');
    }
  }
}

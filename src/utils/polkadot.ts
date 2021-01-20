import {Currency, getSymbol} from 'models/wallet';
import BN from 'bn.js';
import {Transaction, TxStatus, TxType} from 'models/transaction';
// @ts-ignore
import {KUSAMA_API, POLKADOT_API} from '@env';
import MathUtils from 'utils/math';

export class Api {
  private static instance: Map<Currency, Api>;
  private readonly explorerApiUrl: string;
  private readonly currency: Currency;
  private decimals: BN;
  private readonly viewDecimals: number;

  public constructor(currency: Currency, explorerApiUrl: string, decimals: BN) {
    this.currency = currency;
    this.explorerApiUrl = explorerApiUrl;
    this.decimals = decimals;
    this.viewDecimals = 3;
  }

  public static getInstance(currency: Currency): Api {
    if (this.instance == null) {
      this.instance = new Map<Currency, Api>();
    }
    if (!this.instance.has(currency)) {
      let explorerApiUrl = '';
      let decimals = new BN(0);
      switch (currency) {
        case Currency.Polkadot:
          explorerApiUrl = POLKADOT_API;
          decimals = new BN(10);
          break;
        case Currency.Kusama:
          explorerApiUrl = KUSAMA_API;
          decimals = new BN(12);
          break;
        default:
          throw 'Invalid currency';
      }
      this.instance.set(currency, new Api(currency, explorerApiUrl, decimals));
    }
    return <Api>this.instance.get(currency);
  }

  public convertFromPlanck(plancks: BN): number {
    return (
      plancks.mul(new BN(1000)).div(new BN(10).pow(this.decimals)).toNumber() /
      1000
    );
  }

  public async balance(address: string): Promise<number | null> {
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

    return MathUtils.floor(result.data.account.balance, this.viewDecimals);
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
        return new Array();
      }
      const data = (await rs.json()).data;
      const transfers = data.transfers;
      if (transfers.length == 0) {
        return new Array<Transaction>();
      }
      for (let i = 0; i < transfers.length; i++) {
        const idx = transfers[i].extrinsic_index;

        let txType = 0;
        let member = '';
        if (address == transfers[i].from) {
          txType = TxType.Sent;
          member = transfers[i].to;
        } else {
          txType = TxType.Received;
          member = transfers[i].from;
        }

        transactions.push(
          new Transaction(
            idx,
            member,
            this.currency,
            txType,
            transfers[i].block_timestamp * 1000,
            MathUtils.floor(transfers[i].amount, this.viewDecimals),
            0,
            MathUtils.floor(
              this.convertFromPlanck(new BN(transfers[i].fee)),
              this.viewDecimals,
            ),
            0,
            transfers[i].success ? TxStatus.Success : TxStatus.Fail,
          ),
        );
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
      tx.usdFee = MathUtils.floorUsd(
        this.convertFromPlanck(new BN(tx.fee)) * usdPrice,
      );
    } catch (e) {
      console.log(e);
      return;
    }
    return;
  }
}

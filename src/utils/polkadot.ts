import {Currency} from 'models/wallet';
import BN from 'bn.js';
import {Transaction, TxType} from 'models/transaction';
import {POLKADOT_API, KUSAMA_API} from '@env';

export class Api {
  private static instance: Map<Currency, Api>;
  private readonly explorerApiUrl: string;
  private readonly currency: Currency;
  private decimals: BN;

  public constructor(currency: Currency, explorerApiUrl: string, decimals: BN) {
    this.currency = currency;
    this.explorerApiUrl = explorerApiUrl;
    this.decimals = decimals;
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
    let rs = await fetch(`${this.explorerApiUrl}/api/v1/account/${address}`);
    if (!rs.ok) {
      return null;
    }
    const result = await rs.json();
    return this.convertFromPlanck(new BN(result.data.attributes.balance_free));
  }

  public async getTransactions(
    address: string,
    page: number = 1,
    size: number = 10,
  ): Promise<Array<Transaction>> {
    let transactions = new Array<Transaction>();

    try {
      let rs = await fetch(
        `${this.explorerApiUrl}/api/v1/event?filter[address]=${address}&filter[search_index]=2&page[number]=${page}&page[size]=${size}`,
      );
      if (!rs.ok) {
        return new Array();
      }

      const transfers = (await rs.json()).data;
      for (let i = 0; i < transfers.length; i++) {
        const idx = `${transfers[i].attributes.block_id}-${transfers[i].attributes.extrinsic_idx}`;
        let txType = 0;
        let member = '';
        if (address == transfers[i].attributes.attributes[0].value) {
          txType = TxType.Sent;
          member = transfers[i].attributes.attributes[1].value;
        } else {
          txType = TxType.Received;
          member = transfers[i].attributes.attributes[0].value;
        }

        rs = await fetch(
          `${this.explorerApiUrl}/api/v1/extrinsic/${idx}?include=events`,
        );
        const jsRs = await rs.json();
        const tx = jsRs.data;
        const events = jsRs.included;
        let fee = new BN(0);
        for (let j = 0; j < events.length; j++) {
          if (
            events[j].attributes.module_id == 'treasury' &&
            events[j].attributes.event_id == 'Deposit'
          ) {
            fee = fee.add(new BN(events[j].attributes.attributes[0].value));
          } else if (
            events[j].attributes.module_id == 'balances' &&
            events[j].attributes.event_id == 'Deposit'
          ) {
            fee = fee.add(new BN(events[j].attributes.attributes[1].value));
          }
        }

        transactions.push(
          new Transaction(
            idx,
            member,
            this.currency,
            txType,
            new Date(tx.attributes.datetime),
            this.convertFromPlanck(
              new BN(transfers[i].attributes.attributes[2].value),
            ),
            this.convertFromPlanck(fee),
          ),
        );
      }
    } catch (e) {
      console.log(e);
      return transactions;
    }
    return transactions;
  }
}

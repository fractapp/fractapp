import { ApiPromise, WsProvider } from '@polkadot/api';
import { Currency } from 'models/wallet';
import BN from 'bn.js'
import { Transaction, TxType } from 'models/transaction';
import { Alert } from 'react-native';

export class Api {
  private KSMDecimals = new BN(12);
  private DOTDecimals = new BN(10);
  private static instance: Map<Currency, Api>;
  private explorerApiUrl: string;
  private apiPromise: ApiPromise;
  private currency: Currency;

  private constructor(apiPromise: ApiPromise, currency: Currency, explorerApiUrl: string) {
    this.apiPromise = apiPromise;
    this.currency = currency;
    this.explorerApiUrl = explorerApiUrl;
  }

  public static getInstance(currency: Currency): Promise<Api> {
    return (async (currency: Currency) => {
      if (this.instance == null)
        this.instance = new Map<Currency, Api>()

      if (!this.instance.has(currency)) {
        let apiUrl = ""
        let explorerApiUrl = ""
        switch (currency) {
          case Currency.Polkadot:
            apiUrl = "ws://rpc.polkadot.io"
            explorerApiUrl = "https://explorer-31.polkascan.io/polkadot"
            break;
          case Currency.Kusama:
            apiUrl = "ws://kusama-rpc.polkadot.io"
            explorerApiUrl = "https://explorer-31.polkascan.io/kusama"
            break;
          default:
            throw ("Invalid currency")
        }
        const provider = new WsProvider(apiUrl);
        let apiPromise = await ApiPromise.create({ provider })
        this.instance.set(currency, new Api(apiPromise, currency, explorerApiUrl))
      }
      return <Api>this.instance.get(currency);
    })(currency)
  }

  public convertFromPlanck(plancks: BN): number {
    let b = new BN(0);
    switch (this.currency) {
      case Currency.Kusama:
        b = this.KSMDecimals
        break;
      case Currency.Polkadot:
        b = this.DOTDecimals
        break;
    }
    return plancks.mul(new BN(1000)).div(new BN(10).pow(b)).toNumber() / 1000
  }

  public async balance(address: string): Promise<number> {
    let accountInfo = await this.apiPromise.query.system.account(address);
    return this.convertFromPlanck(accountInfo.data.free.toBn())
  }

  public async getTransactions(address: string, page: number = 1, size: number = 10): Promise<Array<Transaction>> {
    let transactions = new Array<Transaction>()

    try {
      let rs = await fetch(`${this.explorerApiUrl}/api/v1/event?filter[address]=${address}&filter[search_index]=2&page[number]=${page}&page[size]=${size}`)
      if (!rs.ok) return new Array()

      const transfers = (await rs.json()).data
      for (let i = 0; i < transfers.length; i++) {
        const idx = `${transfers[i].attributes.block_id}-${transfers[i].attributes.extrinsic_idx}`
        let txType = 0
        let member = ""
        if (address == transfers[i].attributes.attributes[0].value) {
          txType = TxType.Sent
          member = transfers[i].attributes.attributes[1].value
        } else {
          txType = TxType.Received
          member = transfers[i].attributes.attributes[0].value
        }

        rs = await fetch(`${this.explorerApiUrl}/api/v1/extrinsic/${idx}?include=events`)
        const jsRs = await rs.json()
        const tx = jsRs.data
        const events = jsRs.included
        let fee = new BN(0)
        for (let j = 0; j < events.length; j++) {
          if (events[j].attributes.module_id == "treasury" && events[j].attributes.event_id == "Deposit") {
            fee = fee.add(new BN(events[j].attributes.attributes[0].value))
          } else if (events[j].attributes.module_id == "balances" && events[j].attributes.event_id == "Deposit") {
            fee = fee.add(new BN(events[j].attributes.attributes[1].value))
          }
        }

        transactions.push(
          new Transaction(
            idx,
            member,
            this.currency,
            txType,
            new Date(tx.attributes.datetime),
            this.convertFromPlanck(new BN(transfers[i].attributes.attributes[2].value)),
            this.convertFromPlanck(fee)
          )
        )
      }
    } catch (e) {
      console.log(e)
      return transactions
    }
    return transactions
  }
}
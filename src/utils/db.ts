import { Account } from 'models/account'
import SecureStorage from 'react-native-sensitive-info'
import { Keyring } from '@polkadot/api';
import { Metadata } from '@polkadot/types';
import { hexToString, u8aToHex } from '@polkadot/util';
import { Currency } from 'models/wallet';
import { Transaction } from 'models/transaction';
import * as date from 'utils/date'

const seedKey = "seed"
const currentAccountsStore = {
    keychainService: 'fractapp_v1'
};

const metadateKey = "metadate"
const accountsKey = "accounts"
const accountInfoKey = (address: string) => `account_${address}`
const transactionsInfoKey = (address: string) => `transactions_${address}`

export async function getSeed(): Promise<string | null> {
    return await SecureStorage.getItem(seedKey, currentAccountsStore);
}

export async function getAccounts(): Promise<Array<string> | null> {
    return JSON.parse(await SecureStorage.getItem(accountsKey, currentAccountsStore));
}

export async function setAccounts(accounts: Array<string>): Promise<void> {
    await SecureStorage.setItem(accountsKey, JSON.stringify(accounts), currentAccountsStore);
}

export async function createAccounts(seed: string): Promise<void> {
    let polkadotWallet = new Keyring({ type: "sr25519", ss58Format: 0 }).addFromUri(seed)
    let kusamaWallet = new Keyring({ type: "sr25519", ss58Format: 2 }).addFromUri(seed)
    let accountsInfo = new Array<Account>(
        new Account("Polkadot wallet", polkadotWallet.address, u8aToHex(polkadotWallet.publicKey), Currency.Polkadot, 0),
        new Account("Kusama wallet", kusamaWallet.address, u8aToHex(kusamaWallet.publicKey), Currency.Kusama, 0)
    )

    let accounts = new Array<string>()
    for (let i = 0; i < accountsInfo.length; i++) {
        const account = accountsInfo[i]
        accounts.push(account.address)
        await setAccountInfo(account)
    }
    await setAccounts(accounts)
    await SecureStorage.setItem(seedKey, seed, currentAccountsStore);
}

export async function getAccountInfo(address: string): Promise<Account> {
    return Account.parse(await SecureStorage.getItem(accountInfoKey(address), currentAccountsStore));
}

export async function setAccountInfo(account: Account): Promise<void> {
    await SecureStorage.setItem(accountInfoKey(account.address), JSON.stringify(account), currentAccountsStore);
}

export async function getTransactionsFull(address: string,): Promise<Array<Transaction>> {
    const transactions: Array<Transaction> = JSON.parse(await SecureStorage.getItem(transactionsInfoKey(address), currentAccountsStore), date.dateReviver)
    if (transactions == null)
        return new Array()

    return transactions;
}

export async function getTransactions(address: string, page: number, size: number): Promise<Array<Transaction>> {
    const transactions: Array<Transaction> = await getTransactionsFull(address)
    const start = (page - 1) * size
    const end = page * size
    if (transactions == null)
        return new Array()
    return transactions.splice(start, end);
}
export async function removeTransactions(address: string): Promise<void> {
    await SecureStorage.deleteItem(transactionsInfoKey(address), currentAccountsStore);
}

export async function addTransaction(address: string, txs: Array<Transaction>): Promise<void> {
    let transactions = await getTransactionsFull(address)
    transactions = transactions.concat(txs)
    await SecureStorage.setItem(transactionsInfoKey(address), JSON.stringify(transactions), currentAccountsStore);
}

export async function removeSeed(): Promise<void> {
    await SecureStorage.deleteItem(seedKey, currentAccountsStore);
}
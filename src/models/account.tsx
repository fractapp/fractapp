import { Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types';



/*
const keyring = new Keyring({ type: "sr25519" })

interface CurrencyAdapter {
    address(): string;
}

class PolkadotAndCusamaAdapter implements CurrencyAdapter {
    keyPair: KeyringPair
    constructor(seed: string, currency: Currency) {
        switch (currency) {
            case Currency.Polkadot:
                keyring.setSS58Format(0)
                break;
            case Currency.Kusama:
                keyring.setSS58Format(0)
                break;
        }
        this.keyPair = keyring.addFromUri(seed)
    }

    address() {
        return this.keyPair.address
    }
}

export class Account {
    seed: string;
    adapters: Map<Currency, CurrencyAdapter>

    constructor(seed: string, adapters?: Map<Currency, CurrencyAdapter>) {
        this.seed = seed;
        if (adapters == null) {
            this.adapters = new Map<Currency, CurrencyAdapter>(
                [
                    [Currency.Polkadot, new PolkadotAndCusamaAdapter(seed, Currency.Polkadot)],
                    [Currency.Kusama, new PolkadotAndCusamaAdapter(seed, Currency.Kusama)]
                ]
            )
        } else {
            this.adapters = adapters;
        }
    }


    address(currency: Currency) {
        adapters
    }


    backupAccount(password: String) {

    }
}
*/
import SecureStorage from 'react-native-secure-storage'

const seedKey = "seed"
const currentAccountsStore = {
    keychainService: 'account_v1',
    sharedPreferencesName: 'account_v1'
};


export async function getSeed(): Promise<string | null> {
    return SecureStorage.getItem(seedKey, currentAccountsStore);
}
export async function setSeed(seed: string): Promise<void> {
    return SecureStorage.setItem(seedKey, seed, currentAccountsStore);
}
export async function removeSeed(): Promise<void> {
    return SecureStorage.removeItem(seedKey, currentAccountsStore);
}
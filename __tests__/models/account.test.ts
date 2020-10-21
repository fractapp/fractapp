import { Account } from 'models/account'
import { Currency } from 'models/wallet';

test('create model', () => {
    const model = new Account("name", "address", "pubKey", Currency.Kusama, 100)
    expect(model.name).toBe("name");
    expect(model.address).toBe("address");
    expect(model.pubKey).toBe("pubKey");
    expect(model.currency).toBe(Currency.Kusama);
    expect(model.balance).toBe(100);
});

test('parse', () => {
    const sourceModel = new Account("name", "address", "pubKey", Currency.Kusama, 100)
    const testModel = Account.parse(JSON.stringify(sourceModel))
    
    expect(testModel.name).toBe(sourceModel.name);
    expect(testModel.address).toBe(sourceModel.address);
    expect(testModel.pubKey).toBe(sourceModel.pubKey);
    expect(testModel.currency).toBe(sourceModel.currency);
    expect(testModel.balance).toBe(sourceModel.balance);
});
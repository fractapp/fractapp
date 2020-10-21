import { Transaction, TxType } from 'models/transaction';
import { Currency } from 'models/wallet';

test('create model', () => {
    const date = new Date()
    const model = new Transaction("id", "member", Currency.Kusama, TxType.Sent, date, 100, 150)
    expect(model.id).toBe("id");
    expect(model.member).toBe("member");
    expect(model.currency).toBe(Currency.Kusama);
    expect(model.txType).toBe(TxType.Sent);
    expect(model.date).toBe(date);
    expect(model.value).toBe(100);
    expect(model.fee).toBe(150);
});
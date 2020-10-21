import { FileBackup } from 'models/backup';

test('create model', () => {
    const model = new FileBackup("seed", "algorithm")
    expect(model.seed).toBe("seed");
    expect(model.algorithm).toBe("algorithm");
});
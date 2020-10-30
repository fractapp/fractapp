import { DriveItem,Type } from 'models/google';

test('create model', () => {
    const model = new DriveItem("id", "title", Type.Dir)
    expect(model.id).toBe("id");
    expect(model.title).toBe("title");
    expect(model.type).toBe(Type.Dir);
});
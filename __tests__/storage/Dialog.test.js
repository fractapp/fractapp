import Dialog from 'storage/Dialog';

it('Test open', async () => {
  const title = 'title';
  const text = 'text';
  const onPress = () => {};
  expect(Dialog.open(title, text, onPress)).toStrictEqual({
    type: Dialog.Action.OPEN,
    title: title,
    text: text,
    onPress: onPress,
  });
});

it('Test close', async () => {
  expect(Dialog.close()).toStrictEqual({
    type: Dialog.Action.CLOSE,
  });
});

it('Test reducer open', async () => {
  const title = 'title';
  const text = 'text';
  const onPress = () => {};
  const ac = Dialog.open(title, text, onPress);

  expect(Dialog.reducer(Dialog.initialState(), ac)).toStrictEqual({
    visible: true,
    title: ac.title,
    text: ac.text,
    onPress: ac.onPress,
  });
});

it('Test reducer close', async () => {
  const title = 'title';
  const text = 'text';
  const onPress = () => {};
  const ac = Dialog.open(title, text, onPress);
  const prevState = Dialog.reducer(Dialog.initialState(), ac);

  expect(Dialog.reducer(prevState, Dialog.close())).toStrictEqual({
    visible: false,
    title: ac.title,
    text: ac.text,
    onPress: ac.onPress,
  });
});

it('Test default', async () => {
  expect(
    Dialog.reducer(Dialog.initialState(), {
      type: 9999,
    }),
  ).toStrictEqual(Dialog.initialState());
});

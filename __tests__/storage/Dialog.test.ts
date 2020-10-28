import { open, close, Action, reducer, initialState } from 'storage/Dialog'

it('Test open', async () => {
    const title = "title"
    const text = "text"
    const onPress = () => { }
    expect(open(title, text, onPress)).toStrictEqual({
        type: Action.OPEN,
        title: title,
        text: text,
        onPress: onPress
    })
});

it('Test close', async () => {
    expect(close()).toStrictEqual({
        type: Action.CLOSE
    })
});

it('Test reducer open', async () => {
    const title = "title"
    const text = "text"
    const onPress = () => { }
    const ac = open(title, text, onPress)

    expect(reducer(initialState, ac)).toStrictEqual({
        dialog: {
            visible: true,
            title: ac.title,
            text: ac.text,
            onPress: ac.onPress
        }
    })
});


it('Test reducer close', async () => {
    const title = "title"
    const text = "text"
    const onPress = () => { }
    const ac = open(title, text, onPress)
    const prevState = reducer(initialState, ac)

    expect(reducer(prevState, close())).toStrictEqual({
        dialog: {
            visible: false,
            title: ac.title,
            text: ac.text,
            onPress: ac.onPress
        }
    })
});

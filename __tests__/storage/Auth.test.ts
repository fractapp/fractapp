import { signIn, signOut, Action, reducer, initialState } from 'storage/Auth'

it('Test sigIn', async () => {
    expect(signIn()).toStrictEqual({
        type: Action.SIGN_IN
    })
});

it('Test signOut', async () => {
    expect(signOut()).toStrictEqual({
        type: Action.SIGN_OUT
    })
});

it('Test reducer signIn', async () => {
    expect(reducer(initialState, signIn())?.isSign).toStrictEqual(true)
});

it('Test reducer signOut', async () => {
    expect(reducer(initialState, signOut())?.isSign).toStrictEqual(false)
});

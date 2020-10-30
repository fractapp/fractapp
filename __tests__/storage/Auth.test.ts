import Auth from 'storage/Auth'

it('Test sigIn', async () => {
    expect(Auth.signIn()).toStrictEqual({
        type: Auth.Action.SIGN_IN
    })
});

it('Test signOut', async () => {
    expect(Auth.signOut()).toStrictEqual({
        type: Auth.Action.SIGN_OUT
    })
});

it('Test reducer signIn', async () => {
    expect(Auth.reducer(Auth.initialState, Auth.signIn())?.isSign).toStrictEqual(true)
});

it('Test reducer signOut', async () => {
    expect(Auth.reducer(Auth.initialState, Auth.signOut())?.isSign).toStrictEqual(false)
});

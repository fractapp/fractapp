import DB from 'storage/DB';
import { AuthInfo, LoadInfo } from 'types/authInfo';
import {MyProfile} from 'types/myProfile';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * @namespace
 * @category Storage
 */
namespace GlobalStore {
  export type State = {
    isRegisteredInFractapp: boolean;
    isUpdatingProfile: boolean;

    profile: MyProfile | null;
    authInfo: AuthInfo;
    loadInfo: LoadInfo;

    isInitialized: boolean;
  };

  export const initialState = (): State => ({
    isRegisteredInFractapp: false,
    isUpdatingProfile: false,
    profile: null,
    authInfo:  {
      isSynced: false,
      hasWallet: false,
      hasPasscode: false,
      hasBiometry: false,
    },
    loadInfo: {
      isAllStatesLoaded: false,
      isSyncShow: true,
      isLoadingShow: false,
    },

    isInitialized: false,
  });

  const slice = createSlice({
    name: 'global',
    initialState: initialState(),
    reducers: {
      set(state: State, action: PayloadAction<State>): State {
        return action.payload;
      },
      setProfile(state: State, action: PayloadAction<MyProfile>): State {
        state.profile = action.payload;
        DB.setProfile(state.profile);
        return state;
      },
      initWallet(state: State): State {
        state.authInfo.hasWallet = true;
        DB.setAuthInfo(state.authInfo);
        return state;
      },
      signInFractapp(state: State): State {
        state.isRegisteredInFractapp = true;
        state.isUpdatingProfile = true;
        return state;
      },
      signOutFractapp(state: State): State {
        state.profile = null;
        state.isRegisteredInFractapp = false;
        DB.setProfile(state.profile);
        return state;
      },
      setUpdatingProfile(state: State, action: PayloadAction<boolean>): State {
        state.isUpdatingProfile = action.payload;
        return state;
      },
      setSynced(state: State): State {
        state.authInfo.isSynced = true;
        DB.setAuthInfo(state.authInfo);
        return state;
      },
      enablePasscode(state: State, action: PayloadAction<string>): State {
        state.authInfo.hasPasscode = true;
        state.authInfo.hasBiometry = false;
        DB.enablePasscode(action.payload, false);
        return state;
      },
      disablePasscode(state: State): State {
        state.authInfo.hasPasscode = false;
        state.authInfo.hasBiometry = false;
        DB.disablePasscode();
        return state;
      },
      enableBiometry(state: State): State {
        state.authInfo.hasBiometry = true;
        //TODO: DB.enablePasscode what? In anyother code file we use DB.enablePasscode
        return state;
      },
      disableBiometry(state: State): State {
        state.authInfo.hasBiometry = false;
        //TODO: DB.disablePasscode what? In anyother code file we use DB.disablePasscode
        return state;
      },
      showLoading(state: State): State {
        state.loadInfo.isLoadingShow = true;
        return state;
      },
      hideLoading(state: State): State {
        state.loadInfo.isLoadingShow = true;
        return state;
      },
      showSync(state: State): State {
        state.loadInfo.isSyncShow = true;
        return state;
      },
      hideSync(state: State): State {
        state.loadInfo.isSyncShow = true;
        return state;
      },
      setAllStatesLoaded(state: State): State {
        state.loadInfo.isAllStatesLoaded = true;
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default GlobalStore;

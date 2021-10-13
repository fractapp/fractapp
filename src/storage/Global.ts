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

    profile: MyProfile;
    authInfo: AuthInfo;
    loadInfo: LoadInfo;

    isInitialized: boolean;
  };

  export const initialState = (): State => ({
    isRegisteredInFractapp: false,
    isUpdatingProfile: false,
    profile: {
      id: '',
      name: '',
      username: '',
      phoneNumber: '',
      email: '',
      avatarExt: '',
      lastUpdate: 0,
    },
    authInfo:  {
      isFirstSync: false,
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
      setAllStatesLoaded(state: State, action: PayloadAction<boolean>): State {
        state.loadInfo.isAllStatesLoaded = action.payload;
        return state;
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
        state.profile = {
          id: '',
          name: '',
          username: '',
          phoneNumber: '',
          email: '',
          avatarExt: '',
          lastUpdate: 0,
        };
        state.isRegisteredInFractapp = false;
        DB.setProfile(null);
        DB.setJWT(null);
        return state;
      },
      setUpdatingProfile(state: State, action: PayloadAction<boolean>): State {
        state.isUpdatingProfile = action.payload;
        return state;
      },
      setSynced(state: State): State {
        state.authInfo.isFirstSync = true;
        DB.setAuthInfo(state.authInfo);
        return state;
      },
      enablePasscode(state: State, action: PayloadAction<string>): State {
        state.authInfo.hasPasscode = true;
        state.authInfo.hasBiometry = false;
        DB.enablePasscode(action.payload);
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
        //TODO: next release DB.enablePasscode what? In anyother code file we use DB.enablePasscode
        return state;
      },
      disableBiometry(state: State): State {
        state.authInfo.hasBiometry = false;
        //TODO: next release DB.disablePasscode what? In anyother code file we use DB.disablePasscode
        return state;
      },
      showLoading(state: State): State {
        state.loadInfo.isLoadingShow = true;
        return state;
      },
      hideLoading(state: State): State {
        state.loadInfo.isLoadingShow = false;
        return state;
      },
      showSync(state: State): State {
        state.loadInfo.isSyncShow = true;
        return state;
      },
      hideSync(state: State): State {
        state.loadInfo.isSyncShow = false;
        return state;
      },
    },
  });

  export const actions = slice.actions;
  export const reducer = slice.reducer;
}
export default GlobalStore;

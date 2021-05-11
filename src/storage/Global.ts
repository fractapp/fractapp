import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';
import {AuthInfo} from 'types/authInfo';
import {MyProfile} from 'types/myProfile';
import {UserProfile} from 'types/profile';
import {Network} from 'types/account';
/**
 * @namespace
 * @category Storage
 */
namespace GlobalStore {
  export enum Action {
    SET,
    SET_PROFILE,
    SET_LANG,
    SIGN_IN_LOCAL,
    SIGN_IN_FRACTAPP,
    SET_UPDATING_PROFILE,
    SIGN_OUT_FRACTAPP,
    ENABLE_PASSCODE,
    DISABLE_PASSCODE,
    ENABLE_BIOMETRY,
    DISABLE_BIOMETRY,
    SET_SYNCED,
    SET_LOADING,
    SET_SYNC_SHOW,
    SET_CONTACTS,
    SET_USER,
    DELETE_USER,
    SET_SUBSTRATE_URL,
  }

  export type State = {
    profile: MyProfile;
    contacts: Array<string>;
    users: Map<string, UserProfile>;
    isRegistered: boolean;
    isUpdatingProfile: boolean;
    authInfo: AuthInfo;
    isInitialized: boolean;
    isSyncShow: boolean;
    isLoadingShow: boolean;
    urls: Map<Network, string>;
    lang: string | null;
  };

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const initialState = (): State => ({
    isUpdatingProfile: false,
    profile: {
      id: '',
      name: '',
      username: '',
      phoneNumber: '',
      email: '',
      isMigratory: false,
      avatarExt: '',
      lastUpdate: 0,
    },
    contacts: [],
    users: new Map<string, UserProfile>(),
    authInfo: {
      isSynced: false,
      isAuthed: false,
      isPasscode: false,
      isBiometry: false,
    },
    isSyncShow: true,
    isInitialized: false,
    isRegistered: false,
    isLoadingShow: false,
    urls: new Map<Network, string>(),
    lang: null,
  });
  export const Context = createContext<ContextType>({
    state: initialState(),
    dispatch: () => null,
  });
  export function reducer(prevState: State, action: any): State {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.SET:
        return {
          isUpdatingProfile: action.isUpdatingProfile,
          profile: action.profile,
          authInfo: action.authInfo,
          isInitialized: true,
          isRegistered: action.isRegistered,
          isLoadingShow: false,
          contacts: action.contacts,
          users: action.users,
          urls: action.urls,
          isSyncShow: true,
          lang: action.lang,
        };
      case Action.SET_LANG:
        copy.lang = action.lang;
        if (copy.lang != null) {
          DB.setLang(copy.lang);
        }
        break;
      case Action.SET_PROFILE:
        copy.profile = action.profile;
        DB.setProfile(copy.profile);
        break;
      case Action.SIGN_IN_LOCAL:
        copy.authInfo.isAuthed = true;
        DB.setAuthInfo(copy.authInfo);
        break;
      case Action.SIGN_IN_FRACTAPP:
        copy.isRegistered = true;
        copy.isUpdatingProfile = true;
        break;
      case Action.SET_UPDATING_PROFILE:
        copy.isUpdatingProfile = action.isUpdatingProfile;
        break;
      case Action.SIGN_OUT_FRACTAPP:
        copy.profile = GlobalStore.initialState().profile;
        copy.isRegistered = false;
        break;
      case Action.SET_SYNCED:
        copy.authInfo.isSynced = true;
        DB.setAuthInfo(copy.authInfo);
        break;
      case Action.ENABLE_PASSCODE:
        copy.authInfo.isPasscode = true;
        copy.authInfo.isBiometry = false;
        DB.enablePasscode(action.passcode, false);
        break;
      case Action.DISABLE_PASSCODE:
        copy.authInfo.isPasscode = false;
        copy.authInfo.isBiometry = false;
        DB.disablePasscode();
        break;
      case Action.ENABLE_BIOMETRY:
        copy.authInfo.isBiometry = true;
        break;
      case Action.DISABLE_BIOMETRY:
        copy.authInfo.isBiometry = false;
        break;
      case Action.SET_LOADING:
        copy.isLoadingShow = action.isLoadingShow;
        break;
      case Action.SET_CONTACTS:
        copy.contacts = action.contacts;
        DB.setContacts(action.contacts);
        break;
      case Action.SET_USER:
        copy.users.set(action.user.id, action.user);
        DB.setUsers(copy.users);
        break;
      case Action.DELETE_USER:
        copy.users.delete(action.id);
        DB.setUsers(copy.users);
        break;
      case Action.SET_SUBSTRATE_URL:
        copy.urls.set(action.network, action.url);
        DB.setSubstrateUrls(copy.urls);
        break;
      case Action.SET_SYNC_SHOW:
        copy.isSyncShow = action.isSyncShow;
        break;
      default:
        return prevState;
    }

    return copy;
  }

  export const set = (
    profile: MyProfile,
    authInfo: AuthInfo,
    isRegistered: boolean,
    isUpdatingProfile: boolean,
    contacts: Array<UserProfile>,
    users: Map<string, UserProfile>,
    urls: Map<Network, string>,
    lang: string | null,
  ) => ({
    type: Action.SET,
    profile: profile,
    authInfo: authInfo,
    isRegistered: isRegistered,
    isUpdatingProfile: isUpdatingProfile,
    contacts: contacts,
    users: users,
    urls: urls,
    lang: lang,
  });

  export const setLang = (lang: string) => ({
    type: Action.SET_LANG,
    lang: lang,
  });

  export const setProfile = (profile: MyProfile) => ({
    type: Action.SET_PROFILE,
    profile: profile,
  });
  export const setUpdatingProfile = (isUpdatingProfile: boolean) => ({
    type: Action.SET_UPDATING_PROFILE,
    isUpdatingProfile: isUpdatingProfile,
  });
  export const signInLocal = () => ({
    type: Action.SIGN_IN_LOCAL,
  });
  export const signInFractapp = () => ({
    type: Action.SIGN_IN_FRACTAPP,
  });
  export const signOutFractapp = () => ({
    type: Action.SIGN_OUT_FRACTAPP,
  });
  export const setSynced = () => ({
    type: Action.SET_SYNCED,
  });
  export const enablePasscode = (passcode: string) => ({
    type: Action.ENABLE_PASSCODE,
    passcode: passcode,
  });
  export const disablePasscode = () => ({
    type: Action.DISABLE_PASSCODE,
  });
  export const enableBiometry = () => ({
    type: Action.ENABLE_BIOMETRY,
  });
  export const disableBiometry = () => ({
    type: Action.DISABLE_BIOMETRY,
  });
  export const setSyncShow = (isSyncShow: boolean) => ({
    type: Action.SET_SYNC_SHOW,
    isSyncShow: isSyncShow,
  });
  export const setLoading = (isLoadingShow: boolean) => ({
    type: Action.SET_LOADING,
    isLoadingShow: isLoadingShow,
  });
  export const setContacts = (contacts: Array<string>) => ({
    type: Action.SET_CONTACTS,
    contacts: contacts,
  });
  export const setUser = (user: UserProfile) => ({
    type: Action.SET_USER,
    user: user,
  });
  export const deleteUser = (id: string) => ({
    type: Action.DELETE_USER,
    id: id,
  });
  export const setSubstrateUrl = (network: Network, url: string) => ({
    type: Action.SET_SUBSTRATE_URL,
    url: url,
    network: network,
  });
}
export default GlobalStore;

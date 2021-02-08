import {createContext, Dispatch} from 'react';
import DB from 'storage/DB';
import {AuthInfo} from 'models/authInfo';
import {MyProfile} from 'models/myProfile';
import {UserProfile} from 'models/profile';

/**
 * @namespace
 * @category Context storage
 */
namespace GlobalStore {
  export enum Action {
    SET,
    SET_PROFILE,
    SIGN_IN_LOCAL,
    SIGN_IN_FRACTAPP,
    SET_UPDATING_PROFILE,
    SIGN_OUT_FRACTAPP,
    ADD_NOTIFICATION,
    REMOVE_NOTIFICATION,
    ENABLE_PASSCODE,
    DISABLE_PASSCODE,
    ENABLE_BIOMETRY,
    DISABLE_BIOMETRY,
    SET_SYNCED,
    SET_LOADING,
    SET_CONTACTS,
    SET_USER,
  }

  export type State = {
    profile: MyProfile;
    contacts: Array<UserProfile>;
    users: Map<string, UserProfile>;
    isRegistered: boolean;
    isUpdatingProfile: boolean;
    notificationCount: number;
    authInfo: AuthInfo;
    isInitialized: boolean;
    isLoadingShow: boolean;
  };

  export type ContextType = {
    state: State;
    dispatch: Dispatch<any>;
  };

  export const initialState: State = {
    isUpdatingProfile: false,
    profile: new MyProfile('', '', '', '', '', false, '', 0),
    contacts: [],
    users: new Map<string, UserProfile>(),
    notificationCount: 0,
    authInfo: new AuthInfo(false, false, false, false),
    isInitialized: false,
    isRegistered: false,
    isLoadingShow: false,
  };
  export const Context = createContext<ContextType>({
    state: initialState,
    dispatch: () => null,
  });
  export function reducer(prevState: State, action: any): State {
    let copy = Object.assign({}, prevState);

    switch (action.type) {
      case Action.SET:
        return {
          isUpdatingProfile: action.isUpdatingProfile,
          profile: action.profile,
          notificationCount: action.notificationCount,
          authInfo: action.authInfo,
          isInitialized: action.isInitialized,
          isRegistered: action.isRegistered,
          isLoadingShow: false,
          contacts: action.contacts,
          users: action.users,
        };
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
        copy.profile = GlobalStore.initialState.profile;
        copy.isRegistered = false;
        break;
      case Action.ADD_NOTIFICATION:
        copy.notificationCount++;

        DB.setNotificationCount(copy.notificationCount);
        break;
      case Action.REMOVE_NOTIFICATION:
        if (copy.notificationCount - action.value < 0) {
          return prevState;
        }
        copy.notificationCount -= action.value;
        DB.setNotificationCount(copy.notificationCount);
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
      default:
        return prevState;
    }

    return copy;
  }

  export const set = (
    profile: MyProfile,
    notificationCount: number,
    authInfo: AuthInfo,
    isInitialized: boolean,
    isRegistered: boolean,
    isUpdatingProfile: boolean,
    contacts: Array<UserProfile>,
    users: Map<string, UserProfile>,
  ) => ({
    type: Action.SET,
    profile: profile,
    notificationCount: notificationCount,
    authInfo: authInfo,
    isInitialized: isInitialized,
    isRegistered: isRegistered,
    isUpdatingProfile: isUpdatingProfile,
    contacts: contacts,
    users: users,
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
  export const addNotificationCount = () => ({
    type: Action.ADD_NOTIFICATION,
  });
  export const removeNotificationCount = (value: number) => ({
    type: Action.REMOVE_NOTIFICATION,
    value: value,
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
  export const setLoading = (isLoadingShow: boolean) => ({
    type: Action.SET_LOADING,
    isLoadingShow: isLoadingShow,
  });
  export const setContacts = (contacts: Array<UserProfile>) => ({
    type: Action.SET_CONTACTS,
    contacts: contacts,
  });
  export const setUser = (user: UserProfile) => ({
    type: Action.SET_USER,
    user: user,
  });
}
export default GlobalStore;

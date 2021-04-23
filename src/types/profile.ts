/**
 * @category Models
 */
export type UserProfile = {
  id: string;
  name: string;
  username: string;
  avatarExt: string;
  lastUpdate: number;
  addresses: {
    0: string;
    1: string;
  };
};

//TODO: "addresses" to currency enum

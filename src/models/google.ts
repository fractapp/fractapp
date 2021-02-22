/**
 * Back item id for drive item view
 * @category Models
 */
export const BackItemId = 'back';

/**
 * Type Item for drive item view
 * @category Models
 */
export enum Type {
  Dir,
  Json,
}

/**
 * Drive item (foler/file) for google drive
 * @category Models
 */
export type DriveItem = {
  id: string;
  title: string;
  type: Type;
};

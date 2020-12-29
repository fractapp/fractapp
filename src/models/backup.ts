/**
 * File backup model
 * @category Models
 */
export class FileBackup {
  seed: string;
  algorithm: string;
  constructor(seed: string, algorithm: string) {
    this.seed = seed;
    this.algorithm = algorithm;
  }
}

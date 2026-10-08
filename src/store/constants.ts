export const STORAGE_KEY = 'kwyzibo';
export const DATA_PATH = '/data/';

export const getStorageKey = (sourcePath: string) =>
  `${STORAGE_KEY}:${encodeURIComponent(sourcePath)}`;

import { DATA_PATH } from './constants';
import type { QuizItem, QuizManifest, QuizData } from './types';

export const loadItems = async (): Promise<QuizItem[]> => {
  const manifestResponse = await fetch(`${DATA_PATH}index.json`);
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load quiz manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json() as QuizManifest;
  const itemGroups = await Promise.all(
    manifest.files.map(async file => {
      const response = await fetch(`${DATA_PATH}${encodeURIComponent(file)}`);
      if (!response.ok) {
        throw new Error(`Unable to load ${file}: ${response.status}`);
      }

      return await response.json() as QuizData[];
    })
  );

  return itemGroups.flat().map((item, index) => ({
    ...item,
    id: index + 1,
    topic: item?.topic ?? '',
    confidence: 0
  }));
};

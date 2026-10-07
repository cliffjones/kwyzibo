import { DATA_PATH } from './constants';
import { isQuizData } from './is-quiz-data';
import { parseQuizData } from './parse-quiz-data';
import type { QuizItem, QuizManifest } from './types';

export const loadItems = async (path = '/'): Promise<QuizItem[]> => {
  const manifestResponse = await fetch(`${DATA_PATH}index.json`);
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json() as QuizManifest;
  const pathSegments = path.split('/').filter(Boolean);
  const files = [...new Set(pathSegments.flatMap(segment => {
    let stem: string;
    try {
      stem = decodeURIComponent(segment);
    } catch {
      return [];
    }

    if (!stem || stem === '.' || stem === '..' || /[\\/]/.test(stem)) {
      return [];
    }

    const file = `${stem}.kwyz`;
    return manifest.files.includes(file) ? [file] : [];
  }))];

  const itemGroups = await Promise.all(
    files.map(async file => {
      const response = await fetch(`${DATA_PATH}${encodeURIComponent(file)}`);
      if (!response.ok) {
        throw new Error(`Unable to load ${file}: ${response.status}`);
      }

      const data = await response.text();
      return parseQuizData(data);
    })
  );

  return itemGroups.flat().filter(isQuizData).map((item, index) => ({
    ...item,
    id: index,
    topic: item.topic ?? '',
    confidence: 0
  }));
};

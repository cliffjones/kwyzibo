import { DATA_PATH } from './constants';
import { isQuizData } from './is-quiz-data';
import type { QuizItem, QuizManifest, QuizData } from './types';

export const parseKwyz = (data: string): QuizData[] => {
  const blocks = data
    .split(/\r?\n/)
    .reduce<string[][]>((result, line) => {
      if (line.trim() === '') {
        if (result[result.length - 1]?.length) {
          result.push([]);
        }
      } else {
        if (result.length === 0) {
          result.push([]);
        }
        result[result.length - 1].push(line.trim());
      }
      return result;
    }, [])
    .filter(block => block.length > 0);

  const items: QuizData[] = [];
  let topic = '';
  blocks.forEach((block) => {
    if (block.length === 1) {
      topic = block[0];
    } else {
      items.push({ topic, question: block[0], answer: block[1] });
    }
  });

  return items;
};

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

      if (file.toLowerCase().endsWith('.json')) {
        return await response.json() as QuizData[];
      }

      const data = await response.text();
      if (data.trimStart().startsWith('[')) {
        return JSON.parse(data) as QuizData[];
      }

      return parseKwyz(data);
    })
  );

  return itemGroups.flat().filter(isQuizData).map((item, index) => ({
    ...item,
    id: index,
    topic: item.topic ?? '',
    confidence: 0
  }));
};
